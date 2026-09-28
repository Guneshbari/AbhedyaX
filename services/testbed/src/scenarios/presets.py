"""Built-in canonical scenario definitions and presets for AbhedyaX testbed."""

from typing import Dict, List
from services.testbed.src.scenarios.models import (
    ExpectedSecurity,
    ScenarioDefinition,
    ScoreRange,
)

PRESET_SCENARIOS: Dict[str, ScenarioDefinition] = {
    "ts-secure-ikev2-gcm": ScenarioDefinition(
        scenario_id="ts-secure-ikev2-gcm",
        name="Secure IKEv2 AES-GCM",
        description="Production-grade IKEv2 tunnel using AES-256-GCM AEAD cipher, Diffie-Hellman Group 19 (ECP-256), Perfect Forward Secrecy enabled, and an 8-hour SA lifetime.",
        ike_version="IKEv2",
        mode="Tunnel",
        ip_version="IPv4",
        encryption="AES-256-GCM",
        authentication="AEAD",
        dh_group="DH Group 19",
        pfs=True,
        replay_protection=True,
        sa_lifetime_seconds=28800,
        traffic_profiles=["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"],
        expected_security=ExpectedSecurity(
            score_range=ScoreRange(min=88, max=96),
            risk_level="Low",
            expected_findings=[],
        ),
    ),
    "ts-aes256-cbc": ScenarioDefinition(
        scenario_id="ts-aes256-cbc",
        name="AES-256-CBC with HMAC",
        description="Enterprise IPsec tunnel utilizing AES-256-CBC with HMAC-SHA256 integrity, DH Group 14 (MODP-2048), but with PFS disabled.",
        ike_version="IKEv2",
        mode="Tunnel",
        ip_version="IPv4",
        encryption="AES-256-CBC",
        authentication="HMAC-SHA256",
        dh_group="DH Group 14",
        pfs=False,
        replay_protection=True,
        sa_lifetime_seconds=28800,
        traffic_profiles=["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"],
        expected_security=ExpectedSecurity(
            score_range=ScoreRange(min=65, max=80),
            risk_level="Medium",
            expected_findings=["PFS-001", "CRYPTO-002"],
        ),
    ),
    "ts-weak-dh": ScenarioDefinition(
        scenario_id="ts-weak-dh",
        name="Weak Diffie-Hellman Configuration",
        description="Vulnerable IPsec deployment using legacy Diffie-Hellman Group 2 (MODP-1024) susceptible to discrete logarithm cryptanalysis.",
        ike_version="IKEv2",
        mode="Tunnel",
        ip_version="IPv4",
        encryption="AES-128-CBC",
        authentication="HMAC-SHA256",
        dh_group="DH Group 2",
        pfs=False,
        replay_protection=True,
        sa_lifetime_seconds=28800,
        traffic_profiles=["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"],
        expected_security=ExpectedSecurity(
            score_range=ScoreRange(min=40, max=60),
            risk_level="High",
            expected_findings=["DH-001", "PFS-001"],
        ),
    ),
    "ts-legacy-ikev1": ScenarioDefinition(
        scenario_id="ts-legacy-ikev1",
        name="Legacy IKEv1",
        description="Deprecated IKEv1 protocol with weak 1024-bit DH Group 2, SHA-1 integrity, and excessive SA lifetime without replay protection.",
        ike_version="IKEv1",
        mode="Tunnel",
        ip_version="IPv4",
        encryption="AES-128-CBC",
        authentication="HMAC-SHA1",
        dh_group="DH Group 2",
        pfs=False,
        replay_protection=False,
        sa_lifetime_seconds=86400,
        traffic_profiles=["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"],
        expected_security=ExpectedSecurity(
            score_range=ScoreRange(min=15, max=35),
            risk_level="Critical",
            expected_findings=["IKE-001", "AUTH-001", "DH-001", "LIFE-001"],
        ),
    ),
    "ts-secure-ipv6": ScenarioDefinition(
        scenario_id="ts-secure-ipv6",
        name="Secure IPv6 IPsec",
        description="High-security IPv6 IPsec tunnel using AES-256-GCM AEAD, DH Group 20 (ECP-384), PFS, and strict replay protection.",
        ike_version="IKEv2",
        mode="Tunnel",
        ip_version="IPv6",
        encryption="AES-256-GCM",
        authentication="AEAD",
        dh_group="DH Group 20",
        pfs=True,
        replay_protection=True,
        sa_lifetime_seconds=28800,
        traffic_profiles=["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"],
        expected_security=ExpectedSecurity(
            score_range=ScoreRange(min=90, max=98),
            risk_level="Low",
            expected_findings=[],
        ),
    ),
}


def get_preset_scenario(scenario_id: str) -> ScenarioDefinition:
    """Retrieve a preset scenario by identifier."""
    if scenario_id not in PRESET_SCENARIOS:
        raise KeyError(f"Unknown scenario ID: {scenario_id}")
    return PRESET_SCENARIOS[scenario_id]


def list_preset_scenarios() -> List[ScenarioDefinition]:
    """List all available preset scenario definitions."""
    return list(PRESET_SCENARIOS.values())
