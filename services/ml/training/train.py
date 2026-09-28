"""Model training, validation selection, and artifact serialization pipeline."""

import asyncio
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from sklearn.preprocessing import StandardScaler

from services.ml.src.config.settings import (
    CANONICAL_FEATURES,
    DATASET_MANIFEST_FILE,
    METRICS_DIR,
    MODELS_DIR,
    TARGET_CLASSES,
)
from services.ml.src.dataset.loader import (
    load_dataset_from_directory,
    load_dataset_from_manifest,
)
from services.ml.src.dataset.splitter import extract_matrices, split_dataset_by_capture
from services.ml.src.dataset.validator import validate_dataset
from services.ml.src.models.baseline import (
    build_dummy_baseline,
    build_logistic_regression_baseline,
    build_random_forest_baseline,
)
from services.ml.src.models.evaluation import evaluate_classifier
from services.ml.src.models.registry import (
    ModelArtifactMetadata,
    ModelBundle,
    save_model_artifact,
)
from services.ml.src.models.xgboost_model import XGBoostClassifierWrapper
from services.testbed.src.dataset_generator import generate_dataset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("abhedyax.ml.train")


def ensure_dataset_available() -> None:
    """Ensure Phase 3 benchmark dataset is generated on disk."""
    if not DATASET_MANIFEST_FILE.exists():
        logger.info("Generating Phase 3 benchmark dataset (30 samples)...")
        asyncio.run(generate_dataset(is_simulation=True))


def run_training_pipeline(
    model_version: str = "v1.0.0",
    random_state: int = 42,
) -> Tuple[ModelBundle, Dict[str, Any]]:
    """
    Execute full training pipeline:
    1. Load and validate labelled captures
    2. Split at capture level (preventing data leakage)
    3. Train candidate models
    4. Select best candidate on validation Macro F1
    5. Evaluate on held-out test split
    6. Serialize model artifact
    """
    ensure_dataset_available()

    # 1. Load dataset
    samples = load_dataset_from_manifest()
    if not samples:
        samples = load_dataset_from_directory()

    logger.info("Loaded %d dataset samples", len(samples))

    # 2. Validate dataset
    report = validate_dataset(samples)
    logger.info(
        "Dataset validation: total=%d, classes=%s, valid=%s",
        report.total_samples,
        report.classes,
        report.is_valid,
    )

    # 3. Capture-level split
    train_s, val_s, test_s = split_dataset_by_capture(
        samples, test_ratio=0.2, val_ratio=0.2, random_state=random_state
    )
    logger.info(
        "Split sizes: Train=%d, Validation=%d, Test=%d",
        len(train_s),
        len(val_s),
        len(test_s),
    )

    X_train, y_train = extract_matrices(train_s, CANONICAL_FEATURES)
    X_val, y_val = extract_matrices(val_s, CANONICAL_FEATURES)
    X_test, y_test = extract_matrices(test_s, CANONICAL_FEATURES)

    # Feature scaling (fit on train only to prevent leakage)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    # 4. Train candidates
    candidates = {
        "DummyBaseline": (build_dummy_baseline(random_state), False),
        "LogisticRegression": (build_logistic_regression_baseline(random_state), True),
        "RandomForest": (build_random_forest_baseline(random_state=random_state), False),
        "XGBoost": (XGBoostClassifierWrapper(random_state=random_state), False),
    }

    results = {}
    best_candidate_name = ""
    best_val_macro_f1 = -1.0
    best_model = None
    use_scaler_for_best = False

    for name, (clf, needs_scaling) in candidates.items():
        X_tr = X_train_scaled if needs_scaling else X_train
        X_v = X_val_scaled if needs_scaling else X_val

        clf.fit(X_tr, y_train)
        eval_val = evaluate_classifier(clf, X_v, y_val, CANONICAL_FEATURES)
        results[name] = eval_val

        logger.info(
            "Candidate [%s] Validation - Accuracy: %.4f, Macro F1: %.4f, Balanced Acc: %.4f",
            name,
            eval_val["accuracy"],
            eval_val["macro_f1"],
            eval_val["balanced_accuracy"],
        )

        if eval_val["macro_f1"] > best_val_macro_f1:
            best_val_macro_f1 = eval_val["macro_f1"]
            best_candidate_name = name
            best_model = clf
            use_scaler_for_best = needs_scaling

    logger.info(
        "Selected best model: %s (Validation Macro F1: %.4f)",
        best_candidate_name,
        best_val_macro_f1,
    )

    # 5. Final Evaluation on Held-Out Test Set
    X_t = X_test_scaled if use_scaler_for_best else X_test
    final_test_eval = evaluate_classifier(best_model, X_t, y_test, CANONICAL_FEATURES)
    logger.info(
        "Final Test Evaluation [%s] - Accuracy: %.4f, Macro F1: %.4f, Balanced Acc: %.4f",
        best_candidate_name,
        final_test_eval["accuracy"],
        final_test_eval["macro_f1"],
        final_test_eval["balanced_accuracy"],
    )

    # 6. Save Model Bundle & Metadata
    classes_list = sorted(list(set(y_train)))
    metadata = ModelArtifactMetadata(
        model_name="traffic_classifier",
        model_version=model_version,
        algorithm=best_candidate_name,
        dataset_version="v1.0.0",
        feature_count=len(CANONICAL_FEATURES),
        classes=classes_list,
        metrics={
            "validation_macro_f1": best_val_macro_f1,
            "test_accuracy": final_test_eval["accuracy"],
            "test_balanced_accuracy": final_test_eval["balanced_accuracy"],
            "test_macro_f1": final_test_eval["macro_f1"],
            "test_weighted_f1": final_test_eval["weighted_f1"],
            "confusion_matrix": final_test_eval["confusion_matrix"],
            "per_class_metrics": final_test_eval["per_class_metrics"],
            "feature_importance": final_test_eval["feature_importance"],
            "candidate_comparisons": {
                k: {"accuracy": v["accuracy"], "macro_f1": v["macro_f1"]}
                for k, v in results.items()
            },
        },
        created_at=datetime.now(timezone.utc).isoformat(),
        feature_names=CANONICAL_FEATURES,
        abstention_threshold=0.55,
    )

    bundle = ModelBundle(
        model=best_model,
        metadata=metadata,
        scaler=scaler if use_scaler_for_best else None,
    )

    saved_path = save_model_artifact(bundle)

    # Save metrics report JSON
    metrics_path = METRICS_DIR / f"{bundle.metadata.model_name}_{model_version}_eval.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metadata.metrics, f, indent=2)

    return bundle, final_test_eval


if __name__ == "__main__":
    run_training_pipeline()
