"""Unit tests for traffic profile definitions and controlled generators."""

import pytest
from services.testbed.src.traffic.generators import ControlledTrafficGenerator
from services.testbed.src.traffic.profiles import TRAFFIC_PROFILES


def test_traffic_profiles_registered():
    expected_profiles = ["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"]
    for p in expected_profiles:
        assert p in TRAFFIC_PROFILES
        prof = TRAFFIC_PROFILES[p]
        assert prof.name == p
        assert prof.payload_size_bytes > 0
        assert prof.protocol in ["icmp", "tcp", "udp"]


@pytest.mark.asyncio
async def test_controlled_traffic_generator_run():
    generator = ControlledTrafficGenerator(profile_name="ICMP", seed=123)
    record = await generator.run(duration_seconds=0.2, is_simulation=True)

    assert record.profile_name == "ICMP"
    assert record.packets_transmitted > 0
    assert record.bytes_transmitted > 0
    assert record.loss_rate == 0.0
    assert record.duration_seconds >= 0.1
