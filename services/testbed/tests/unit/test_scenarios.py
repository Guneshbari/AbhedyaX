"""Unit tests for testbed scenario definitions, models, and loader."""

import pytest
from services.testbed.src.scenarios.loader import export_preset_definitions, load_all_scenarios
from services.testbed.src.scenarios.models import ScenarioDefinition
from services.testbed.src.scenarios.presets import PRESET_SCENARIOS, list_preset_scenarios


def test_preset_scenarios_valid():
    """All built-in presets must validate against the canonical ScenarioDefinition schema."""
    presets = list_preset_scenarios()
    assert len(presets) >= 5

    expected_ids = {
        "ts-secure-ikev2-gcm",
        "ts-aes256-cbc",
        "ts-weak-dh",
        "ts-legacy-ikev1",
        "ts-secure-ipv6",
    }
    present_ids = {p.scenario_id for p in presets}
    assert expected_ids.issubset(present_ids)

    for p in presets:
        assert p.ike_version in ["IKEv1", "IKEv2"]
        assert p.mode in ["Tunnel", "Transport"]
        assert p.ip_version in ["IPv4", "IPv6"]
        assert len(p.traffic_profiles) > 0
        assert p.expected_security.score_range.min >= 0
        assert p.expected_security.score_range.max <= 100
        assert p.expected_security.risk_level in ["Low", "Medium", "High", "Critical"]


def test_scenario_serialization_and_loader(tmp_path):
    """Test exporting presets to disk and reloading them accurately."""
    export_preset_definitions(target_dir=tmp_path)
    loaded = load_all_scenarios(definitions_dir=tmp_path)

    assert len(loaded) >= 5
    for sc_id in PRESET_SCENARIOS:
        assert sc_id in loaded
        assert loaded[sc_id].name == PRESET_SCENARIOS[sc_id].name
        assert loaded[sc_id].encryption == PRESET_SCENARIOS[sc_id].encryption
