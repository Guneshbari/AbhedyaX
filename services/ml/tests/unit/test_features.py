"""Unit tests for ML feature extraction modules."""

import pytest
from services.ml.src.config.settings import CANONICAL_FEATURES
from services.ml.src.features.packet_features import compute_packet_size_features
from services.ml.src.features.temporal_features import compute_temporal_features
from services.ml.src.features.burst_features import compute_direction_and_burst_features
from services.ml.src.features.extractor import UnifiedFeatureExtractor


def test_packet_length_features():
    lengths = [100, 200, 300, 400, 500]
    feats = compute_packet_size_features(lengths)
    
    assert feats["packet_count"] == 5.0
    assert feats["mean_packet_size"] == 300.0
    assert feats["median_packet_size"] == 300.0
    assert feats["min_packet_size"] == 100.0
    assert feats["max_packet_size"] == 500.0
    assert "packet_size_p10" in feats
    assert "packet_size_p90" in feats


def test_packet_length_empty():
    feats = compute_packet_size_features([])
    assert feats["packet_count"] == 0.0
    assert feats["mean_packet_size"] == 0.0
    assert feats["min_packet_size"] == 0.0


def test_temporal_features():
    timestamps = [0.0, 0.1, 0.3, 0.6, 1.0]
    total_bytes = 500.0
    feats = compute_temporal_features(timestamps, total_bytes)
    
    assert feats["flow_duration"] == 1.0
    assert feats["packet_rate"] == 5.0
    assert feats["byte_rate"] == 500.0
    assert feats["mean_inter_arrival_time"] == pytest.approx(0.25, rel=1e-2)
    assert "iat_p50" in feats


def test_temporal_features_single_packet():
    feats = compute_temporal_features([10.0], 500.0)
    assert feats["flow_duration"] == 0.0
    assert feats["mean_inter_arrival_time"] == 0.0


def test_burst_features():
    # packets: (timestamp, length, direction: 0 for fwd, 1 for rev)
    packets = [
        (0.0, 100, 0),
        (0.02, 150, 0),
        (0.20, 200, 1),  # gap > 0.05 -> new burst
        (0.21, 250, 1),
    ]
    feats = compute_direction_and_burst_features(packets, flow_duration=0.21)
    
    assert feats["forward_packet_count"] == 2.0
    assert feats["reverse_packet_count"] == 2.0
    assert feats["forward_bytes"] == 250.0
    assert feats["reverse_bytes"] == 450.0
    assert feats["direction_ratio"] == pytest.approx(250.0 / 451.0, rel=1e-3)
    assert feats["burst_count"] >= 2.0


def test_unified_feature_extractor_zero_payload():
    """Verify that feature extraction strictly requires only metadata, zero payload."""
    packets = [
        {"frame_number": 1, "timestamp": 100.0, "length": 64, "direction": 1},
        {"frame_number": 2, "timestamp": 100.05, "length": 128, "direction": -1},
        {"frame_number": 3, "timestamp": 100.10, "length": 1420, "direction": 1},
        {"frame_number": 4, "timestamp": 100.12, "length": 1420, "direction": 1},
    ]
    extractor = UnifiedFeatureExtractor()
    feat_dict = extractor.extract_from_packets(packets)
    
    # Check all 28 canonical features are present
    assert len(feat_dict) == len(CANONICAL_FEATURES)
    for feat_name in CANONICAL_FEATURES:
        assert feat_name in feat_dict
        assert isinstance(feat_dict[feat_name], (int, float))

    vec = extractor.to_vector(feat_dict)
    assert len(vec) == len(CANONICAL_FEATURES)
