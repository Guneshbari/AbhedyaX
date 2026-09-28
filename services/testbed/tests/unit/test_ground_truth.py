"""Unit tests for ground-truth schema adherence and persistence."""

import json
import pytest
from services.testbed.src.capture.metadata import CaptureSessionMetadata
from services.testbed.src.ground_truth.generator import generate_ground_truth
from services.testbed.src.ground_truth.schema import GroundTruthRecord
from services.testbed.src.scenarios.presets import PRESET_SCENARIOS
from services.testbed.src.traffic.profiles import TrafficExecutionRecord


def test_ground_truth_generation(tmp_path):
    scenario = PRESET_SCENARIOS["ts-secure-ikev2-gcm"]
    traffic_record = TrafficExecutionRecord(
        profile_name="ICMP",
        start_time="2026-09-28T10:00:00Z",
        end_time="2026-09-28T10:00:30Z",
        duration_seconds=30.0,
        packets_transmitted=40,
        bytes_transmitted=2560,
        packets_received=40,
        bytes_received=2560,
        loss_rate=0.0,
        target_ip="10.100.2.1",
    )
    capture_meta = CaptureSessionMetadata(
        scenario_id=scenario.scenario_id,
        run_id="test-run-gt",
        capture_file=str(tmp_path / "test.pcapng"),
        file_format="pcapng",
        file_size_bytes=4096,
        packet_count=44,
        start_time="2026-09-28T10:00:00Z",
        end_time="2026-09-28T10:00:30Z",
        duration_seconds=30.0,
        interface="veth_r_init",
        traffic_profiles=["ICMP"],
    )

    record = generate_ground_truth(
        scenario=scenario,
        traffic_record=traffic_record,
        capture_metadata=capture_meta,
        output_dir=tmp_path,
    )

    assert record.scenario_id == scenario.scenario_id
    assert record.configuration.ike_version == "IKEv2"
    assert record.configuration.encryption == "AES-256-GCM"
    assert record.traffic.traffic_class == "ICMP"
    assert record.capture.packet_count == 44

    # Verify JSON structure matches exact schema
    out_file = tmp_path / f"{scenario.scenario_id}_{capture_meta.run_id}.json"
    assert out_file.exists()
    with open(out_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert "scenario_id" in data
    assert "configuration" in data
    assert "traffic" in data
    assert data["traffic"]["class"] == "ICMP"
    assert "capture" in data
    assert "expected_analysis" in data
