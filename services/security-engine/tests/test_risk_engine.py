"""Unit tests for the RiskScoringEngine."""

import pytest
from services.security_engine.src.risk_engine import RiskScoringEngine
from services.security_engine.src.models import ScoringDeduction


class DummyFinding:
    def __init__(self, id, category, severity, title, description, evidence=None):
        self.id = id
        self.category = category
        self.severity = severity
        self.title = title
        self.description = description
        self.evidence = evidence or []


def test_clean_enterprise_vpn_score():
    """Verify that informational findings result in 0 deductions and score 100 (Low risk)."""
    engine = RiskScoringEngine()
    findings = [
        DummyFinding("F-101", "Cryptography", "Informational", "Compliant AEAD Cipher Suite Negotiated", "AES-256-GCM authenticated encryption active"),
        DummyFinding("F-102", "Key Exchange", "Informational", "Strong Elliptic Curve Key Exchange", "DH Group 19 active"),
        DummyFinding("F-103", "PFS", "Informational", "Perfect Forward Secrecy Verified", "PFS is enforced on Child SA negotiations"),
    ]
    res = engine.evaluate_findings(findings)
    assert res.security_score == 100
    assert res.risk_level == "Low"
    assert res.total_deduction == 0
    assert len(res.scoring_breakdown) == 0


def test_weak_legacy_vpn_score():
    """Verify weak legacy VPN with IKEv1, DH2, SHA1, and disabled replay protection incurs heavy deductions."""
    engine = RiskScoringEngine()
    findings = [
        DummyFinding("F-301", "Key Exchange", "High", "Deprecated Key Exchange (DH Group 2)", "DH Group 2 (MODP-1024) is cryptographically deficient"),
        DummyFinding("F-302", "Authentication", "High", "Insecure Integrity Algorithm (SHA-1)", "HMAC-SHA1-96 provides inadequate collision resistance"),
        DummyFinding("F-303", "Replay Protection", "Medium", "Anti-Replay Protection Disabled", "Replay window size: 0"),
        DummyFinding("F-304", "Protocol", "Medium", "IKEv1 Deprecated Protocol", "IKEv1 lacks asymmetric authentication flexibility"),
    ]
    res = engine.evaluate_findings(findings)
    # Deductions:
    # DH2: -20
    # SHA-1: -15
    # Replay disabled: -15
    # IKEv1: -25
    # Total = 75 deduction -> Final score = 25 -> Critical
    assert res.total_deduction == 75
    assert res.security_score == 25
    assert res.risk_level == "Critical"
    assert len(res.scoring_breakdown) == 4


def test_anti_double_counting():
    """Verify that multiple findings describing the same root condition do not double-deduct."""
    engine = RiskScoringEngine()
    findings = [
        DummyFinding("F-301A", "Key Exchange", "High", "Deprecated DH Group 2", "DH Group 2 vulnerable to Logjam"),
        DummyFinding("F-301B", "Key Exchange", "High", "MODP-1024 Key Size Deficient", "MODP-1024 has weak entropy"),
    ]
    res = engine.evaluate_findings(findings)
    assert res.total_deduction == 20  # Deducted only once
    assert res.security_score == 80
    assert res.risk_level == "Moderate"
    assert len(res.scoring_breakdown) == 1


def test_boundary_score_clamping():
    """Verify that cumulative deductions exceeding 100 clamp cleanly to 0 (Critical risk)."""
    engine = RiskScoringEngine()
    # Construct multiple severe findings
    findings = [
        DummyFinding("F-1", "Protocol", "Critical", "IKEv1 Protocol", "IKEv1 detected"),  # -25
        DummyFinding("F-2", "Key Exchange", "High", "DH Group 2", "DH Group 2"),  # -20
        DummyFinding("F-3", "Cryptography", "High", "3DES Cipher", "3DES detected"),  # -15
        DummyFinding("F-4", "Replay Protection", "High", "Anti-replay disabled", "disabled"),  # -15
        DummyFinding("F-5", "Authentication", "High", "Weak PSK", "weak psk auth"),  # -15
        DummyFinding("F-6", "PFS", "High", "PFS Disabled", "without diffie-hellman"),  # -12
        DummyFinding("F-7", "Configuration", "Medium", "Extended SA Lifetime", "86400 seconds lifetime"),  # -8
    ]
    # Sum: 25+20+15+15+15+12+8 = 110 deduction
    res = engine.evaluate_findings(findings)
    assert res.total_deduction == 110
    assert res.security_score == 0
    assert res.risk_level == "Critical"
