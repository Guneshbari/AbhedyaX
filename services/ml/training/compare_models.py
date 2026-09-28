"""Benchmark comparison of multiple candidate classification models."""

import logging
from typing import Dict
from sklearn.preprocessing import StandardScaler

from services.ml.src.config.settings import CANONICAL_FEATURES
from services.ml.src.dataset.loader import load_dataset_from_manifest
from services.ml.src.dataset.splitter import extract_matrices, split_dataset_by_capture
from services.ml.src.models.baseline import (
    build_dummy_baseline,
    build_logistic_regression_baseline,
    build_random_forest_baseline,
)
from services.ml.src.models.evaluation import evaluate_classifier
from services.ml.src.models.xgboost_model import XGBoostClassifierWrapper
from services.ml.training.train import ensure_dataset_available

logger = logging.getLogger("abhedyax.ml.compare")


def compare_all_models() -> Dict[str, Dict[str, float]]:
    """Compare candidate classifiers across standard evaluation benchmarks."""
    ensure_dataset_available()
    samples = load_dataset_from_manifest()
    train_s, val_s, test_s = split_dataset_by_capture(samples, test_ratio=0.2, val_ratio=0.2)

    X_train, y_train = extract_matrices(train_s, CANONICAL_FEATURES)
    X_val, y_val = extract_matrices(val_s, CANONICAL_FEATURES)
    X_test, y_test = extract_matrices(test_s, CANONICAL_FEATURES)

    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_val_sc = scaler.transform(X_val)
    X_test_sc = scaler.transform(X_test)

    candidates = {
        "Dummy (Baseline)": (build_dummy_baseline(42), False),
        "Logistic Regression": (build_logistic_regression_baseline(42), True),
        "Random Forest": (build_random_forest_baseline(42), False),
        "XGBoost (Candidate)": (XGBoostClassifierWrapper(random_state=42), False),
    }

    results = {}
    print("\n" + "=" * 80)
    print(f"{'Model':<24} {'Val Acc':<10} {'Val Macro F1':<14} {'Test Acc':<10} {'Test Macro F1':<14}")
    print("-" * 80)

    for name, (clf, needs_scaling) in candidates.items():
        X_tr = X_train_sc if needs_scaling else X_train
        X_v = X_val_sc if needs_scaling else X_val
        X_t = X_test_sc if needs_scaling else X_test

        clf.fit(X_tr, y_train)
        val_eval = evaluate_classifier(clf, X_v, y_val, CANONICAL_FEATURES)
        test_eval = evaluate_classifier(clf, X_t, y_test, CANONICAL_FEATURES)

        results[name] = {
            "val_acc": val_eval["accuracy"],
            "val_f1": val_eval["macro_f1"],
            "test_acc": test_eval["accuracy"],
            "test_f1": test_eval["macro_f1"],
        }

        print(
            f"{name:<24} {val_eval['accuracy']*100:>6.1f}%   {val_eval['macro_f1']*100:>8.1f}%     {test_eval['accuracy']*100:>6.1f}%   {test_eval['macro_f1']*100:>8.1f}%"
        )

    print("=" * 80 + "\n")
    return results


if __name__ == "__main__":
    compare_all_models()
