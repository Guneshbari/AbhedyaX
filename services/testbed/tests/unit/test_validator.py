"""Unit tests for validation engine comparing ground-truth to analysis results."""

import pytest
from services.testbed.src.ground_truth.schema import (
    GroundTruthCapture,
    GroundTruthConfiguration,
    GroundTruthExpectedAnalysis,
    GroundTruthRecord,
    GroundTruthTraffic,
)
from services.testbed.src.validation.validator import validate_analysis_against_ground_truth


def test_validator_perfect_match(tmp_path):
    gt = GroundTruthRecord(
        scenario_id="ts-secure-ikev2-gcm",
        generated_at="2026-09-28T12:00:00Z",
        configuration=GroundTruthConfiguration(
            ike_version="IKEv2",
            mode="Tunnel",
            ip_version="IPv4",
            encryption="AES-256-GCM",
            authentication="AEAD",
            dh_group="DH Group 19",
            pfs=True,
            replay_protection=True,
            sa_lifetime_seconds=28800,
        ),
        traffic=GroundTruthTraffic(traffic_class="ICMP", duration_seconds=30.0),
        capture=GroundTruthCapture(file="test.pcapng", packet_count=40),
        expected_analysis=GroundTruthExpectedAnalysis(
            protocol="IPsec",
            ike_version="IKEv2",
            mode="Tunnel",
            ip_version="IPv4",
            encryption="AES-256-GCM",
            authentication="AEAD",
            dh_group="DH Group 19",
            pfs=True,
        ),
    )

    observed = {
        "vpn_configuration": {
            "protocol": "IPsec",
            "ike_version": "IKEv2",
            "mode": "Tunnel",
            "ip_version": "IPv4",
            "encryption": "AES-256-GCM",
            "authentication": "AEAD",
            "dh_group": "DH Group 19",
            "pfs": True,
            "replay_protection": True,
        },
        "traffic_intelligence": {
            "traffic_class": "ICMP",
        },
    }

    res = validate_analysis_against_ground_truth(
        ground_truth=gt,
        observed_analysis=observed,
        run_id="run-perfect",
        output_dir=tmp_path,
    )

    assert res.passed is True
    assert res.accuracy == 1.0
    assert res.matched_checks == res.total_checks


def test_validator_partial_mismatch(tmp_path):
    gt = GroundTruthRecord(
        scenario_id="ts-secure-ikev2-gcm",
        generated_at="2026-09-28T12:00:00Z",
        configuration=GroundTruthConfiguration(
            ike_version="IKEv2",
            mode="Tunnel",
            ip_version="IPv4",
            encryption="AES-256-GCM",
            authentication="AEAD",
            dh_group="DH Group 19",
            pfs=True,
            replay_protection=True,
            sa_lifetime_seconds=28800,
        ),
        traffic=GroundTruthTraffic(traffic_class="ICMP", duration_seconds=30.0),
        capture=GroundTruthCapture(file="test.pcapng", packet_count=40),
        expected_analysis=GroundTruthExpectedAnalysis(
            protocol="IPsec",
            ike_version="IKEv2",
            mode="Tunnel",
            ip_version="IPv4",
            encryption="AES-256-GCM",
            authentication="AEAD",
            dh_group="DH Group 19",
            pfs=True,
        ),
    )

    # Observed has wrong cipher and DH group
    observed = {
        "vpn_configuration": {
            "protocol": "IPsec",
            "ike_version": "IKEv2",
            "mode": "Tunnel",
            "ip_version": "IPv4",
            "encryption": "DES",  # Mismatch
            "authentication": "AEAD",
            "dh_group": "DH Group 2",  # Mismatch
            "pfs": True,
            "replay_protection": True,
        },
        "traffic_intelligence": {
            "traffic_class": "ICMP",
        },
    }

    res = validate_analysis_against_ground_truth(
        ground_truth=gt,
        observed_analysis=observed,
        run_id="run-mismatch",
        output_dir=tmp_path,
    )

    assert res.accuracy == 0.8
    assert res.passed is True  # 80% threshold passed
    assert res.matched_checks == 8
