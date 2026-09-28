"""Integration tests for the end-to-end ML inference pipeline."""

import pytest
from services.ml.src.features.extractor import UnifiedFeatureExtractor
from services.ml.src.inference.classifier import TrafficClassifier
from services.ml.src.config.settings import CANONICAL_FEATURES, TARGET_CLASSES, UNKNOWN_CLASS


def test_traffic_classifier_inference_and_explanation():
    classifier = TrafficClassifier()
    assert classifier.is_ready
    
    # Generate representative video streaming packet pattern (high MTU packets, fast bursts)
    packets = []
    t = 0.0
    for i in range(100):
        packets.append({
            "frame_number": i + 1,
            "timestamp": t,
            "length": 1420 if i % 10 != 0 else 64,
            "direction": 1 if i % 8 != 0 else -1,
        })
        t += 0.005  # 5ms intervals
        
    extractor = UnifiedFeatureExtractor()
    features = extractor.extract_from_packets(packets)
    
    pred = classifier.predict(features)
    assert pred.predicted_class in TARGET_CLASSES or pred.predicted_class == UNKNOWN_CLASS
    assert 0.0 <= pred.confidence <= 1.0
    assert len(pred.candidate_classes) > 0
    assert pred.model.name is not None
    assert pred.model.version is not None
    
    # Check explanations
    assert len(pred.explanation) > 0
    top_exp = pred.explanation[0]
    assert top_exp.feature in CANONICAL_FEATURES
    assert top_exp.importance >= 0.0


def test_traffic_classifier_abstention_on_empty_features():
    """Verify that anomalous / flat / empty vectors abstain to 'Unknown' when below threshold."""
    classifier = TrafficClassifier()
    empty_features = {f: 0.0 for f in CANONICAL_FEATURES}
    
    pred = classifier.predict(empty_features)
    # Either confidence is below 0.55 leading to Unknown, or it outputs a calibrated prediction
    if pred.confidence < classifier.abstention_threshold:
        assert pred.predicted_class == UNKNOWN_CLASS
