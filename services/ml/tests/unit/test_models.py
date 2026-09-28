"""Unit tests for ML models, evaluation metrics, and registry persistence."""

import numpy as np
import pytest
from services.ml.src.models.baseline import (
    build_dummy_baseline,
    build_random_forest_baseline,
)
from services.ml.src.models.evaluation import evaluate_classifier
from services.ml.src.models.registry import (
    ModelArtifactMetadata,
    ModelBundle,
    save_model_artifact,
    load_model_artifact,
)


def _generate_synthetic_data(n_samples=60):
    np.random.seed(42)
    classes = ["Web", "Video", "VoIP", "Email", "Messaging", "ICMP"]
    y = np.random.choice(classes, size=n_samples)
    
    # Feature 0 distinct per class to make it learnable
    X = np.random.randn(n_samples, 28)
    class_map = {c: i * 5.0 for i, c in enumerate(classes)}
    for i, label in enumerate(y):
        X[i, 0] += class_map[label]
    return X, y


def test_dummy_baseline_classifier():
    X, y = _generate_synthetic_data(30)
    dummy = build_dummy_baseline()
    dummy.fit(X, y)
    preds = dummy.predict(X)
    probs = dummy.predict_proba(X)
    
    assert len(preds) == 30
    assert probs.shape == (30, len(np.unique(y)))


def test_random_forest_and_evaluation():
    X, y = _generate_synthetic_data(60)
    rf = build_random_forest_baseline(n_estimators=10, random_state=42)
    rf.fit(X[:40], y[:40])
    
    eval_res = evaluate_classifier(
        rf,
        X[40:],
        y[40:],
        feature_names=[f"feat_{i}" for i in range(28)],
    )
    
    assert 0.0 <= eval_res["accuracy"] <= 1.0
    assert 0.0 <= eval_res["macro_f1"] <= 1.0
    assert 0.0 <= eval_res["weighted_f1"] <= 1.0
    assert len(eval_res["confusion_matrix"]) == 6
    assert len(eval_res["feature_importance"]) == 28


def test_model_registry_save_and_load(tmp_path):
    X, y = _generate_synthetic_data(30)
    rf = build_random_forest_baseline(n_estimators=5, random_state=42)
    rf.fit(X, y)
    
    metadata = ModelArtifactMetadata(
        model_name="test_rf",
        model_version="v0.0.1",
        algorithm="RandomForestClassifier",
        feature_count=28,
        classes=["Email", "ICMP", "Messaging", "Video", "VoIP", "Web"],
        feature_names=[f"f_{i}" for i in range(28)],
        abstention_threshold=0.55,
        metrics={"test_accuracy": 0.85, "test_macro_f1": 0.80},
    )
    bundle = ModelBundle(model=rf, metadata=metadata)
    
    saved_path = save_model_artifact(bundle, str(tmp_path))
    assert saved_path.exists()
    
    loaded_bundle = load_model_artifact(str(saved_path))
    assert loaded_bundle.metadata.model_name == "test_rf"
    assert loaded_bundle.metadata.model_version == "v0.0.1"
    
    preds = loaded_bundle.model.predict(X[:5])
    assert len(preds) == 5
