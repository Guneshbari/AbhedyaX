"""Unit tests for strongSwan swanctl.conf and ipsec.conf configuration generation."""

import pytest
from services.testbed.src.scenarios.presets import PRESET_SCENARIOS
from services.testbed.src.strongswan.config_generator import (
    build_proposals,
    generate_ipsec_conf,
    generate_swanctl_conf,
)
from services.testbed.src.strongswan.manager import StrongSwanManager


def test_build_proposals_modern_gcm():
    scenario = PRESET_SCENARIOS["ts-secure-ikev2-gcm"]
    ike_prop, esp_prop = build_proposals(scenario)
    assert "aes256gcm" in ike_prop
    assert "ecp256" in ike_prop
    assert "aes256gcm" in esp_prop
    assert "ecp256" in esp_prop  # PFS enabled


def test_build_proposals_no_pfs():
    scenario = PRESET_SCENARIOS["ts-aes256-cbc"]
    ike_prop, esp_prop = build_proposals(scenario)
    assert "aes256" in ike_prop
    assert "modp2048" in ike_prop
    assert "aes256" in esp_prop
    assert "modp2048" not in esp_prop  # PFS disabled


def test_generate_swanctl_conf():
    scenario = PRESET_SCENARIOS["ts-secure-ikev2-gcm"]
    conf = generate_swanctl_conf(scenario, is_initiator=True)
    assert "version = 2" in conf
    assert "local_addrs = 192.168.10.2" in conf
    assert "remote_addrs = 192.168.20.2" in conf
    assert "start_action = start" in conf
    assert "secret =" in conf


def test_generate_ipsec_conf_legacy():
    scenario = PRESET_SCENARIOS["ts-legacy-ikev1"]
    conf = generate_ipsec_conf(scenario, is_initiator=True)
    assert "keyexchange=ikev1" in conf
    assert "pfs=no" in conf
    assert "lifetime=86400s" in conf


def test_strongswan_manager_prepare(tmp_path):
    scenario = PRESET_SCENARIOS["ts-secure-ikev2-gcm"]
    mgr = StrongSwanManager(run_id="test-run-1", scenario=scenario, is_simulation=True)
    paths = mgr.prepare_configurations()

    for p in paths.values():
        assert p.exists()
        assert p.stat().st_size > 50

    sa_state = mgr.get_sa_state()
    assert sa_state["established"] is True
    assert sa_state["ike_sa"]["version"] == "IKEv2"
