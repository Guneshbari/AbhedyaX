"""Unit tests for ML dataset loading, validation, and splitting."""

import pytest
from services.ml.src.dataset.schema import DatasetSample, DatasetReport
from services.ml.src.dataset.validator import validate_dataset
from services.ml.src.dataset.splitter import split_dataset_by_capture, extract_matrices


def _make_dummy_sample(sample_id: str, label: str, duration: float = 1.0) -> DatasetSample:
    features = {
        "packet_count": 10.0,
        "mean_packet_size": 250.0,
        "median_packet_size": 250.0,
        "std_packet_size": 50.0,
        "min_packet_size": 100.0,
        "max_packet_size": 400.0,
        "packet_size_p10": 120.0,
        "packet_size_p25": 180.0,
        "packet_size_p50": 250.0,
        "packet_size_p75": 320.0,
        "packet_size_p90": 380.0,
        "flow_duration": duration,
        "mean_inter_arrival_time": 0.1,
        "std_inter_arrival_time": 0.05,
        "median_inter_arrival_time": 0.1,
        "packet_rate": 10.0,
        "byte_rate": 2500.0,
        "iat_p25": 0.05,
        "iat_p50": 0.10,
        "iat_p75": 0.15,
        "forward_packet_count": 5.0,
        "reverse_packet_count": 5.0,
        "forward_bytes": 1250.0,
        "reverse_bytes": 1250.0,
        "direction_ratio": 0.5,
        "burst_count": 2.0,
        "mean_burst_size": 5.0,
        "burst_rate": 2.0,
    }
    return DatasetSample(
        sample_id=sample_id,
        scenario_id="scenario_test",
        traffic_class=label,
        pcap_path=f"/captures/{sample_id}.pcap",
        label=label,
        features=features,
    )


def test_dataset_validator_valid():
    samples = [
        _make_dummy_sample(f"cap_{i}", cls)
        for i, cls in enumerate(["Web", "VoIP", "Video", "Email", "Messaging", "ICMP"])
    ]
    report = validate_dataset(samples)
    assert report.is_valid
    assert len(report.validation_messages) == 0
    assert report.total_samples == 6
    assert "Web" in report.samples_per_class


def test_dataset_validator_invalid_label():
    samples = [
        _make_dummy_sample("cap_1", "InvalidCustomClass"),
    ]
    report = validate_dataset(samples)
    assert not report.is_valid
    assert any("invalid label" in m for m in report.validation_messages)


def test_dataset_validator_missing_feature():
    sample = _make_dummy_sample("cap_1", "Web")
    sample.features["packet_count"] = 0.0
    report = validate_dataset([sample])
    assert not report.is_valid
    assert any("0 packets" in m for m in report.validation_messages)


def test_dataset_splitter_no_leakage():
    """Verify split_dataset_by_capture generates disjoint sample splits."""
    samples = []
    classes = ["Web", "Video", "VoIP", "Email", "Messaging", "ICMP"]
    for i in range(18):
        cap_id = f"capture_{i:02d}"
        label = classes[i % len(classes)]
        samples.append(_make_dummy_sample(cap_id, label))

    train, val, test = split_dataset_by_capture(samples, test_ratio=0.2, val_ratio=0.2, random_state=42)
    
    train_ids = {s.sample_id for s in train}
    val_ids = {s.sample_id for s in val}
    test_ids = {s.sample_id for s in test}

    assert len(train_ids.intersection(val_ids)) == 0
    assert len(train_ids.intersection(test_ids)) == 0
    assert len(val_ids.intersection(test_ids)) == 0
    assert len(train_ids) + len(val_ids) + len(test_ids) == len(samples)

    X_train, y_train = extract_matrices(train)
    assert X_train.shape[0] == len(train)
    assert X_train.shape[1] == 28
    assert len(y_train) == len(train)
