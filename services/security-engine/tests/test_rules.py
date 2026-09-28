"""Unit tests for individual rule matching logic."""

import pytest
from services.security_engine.src.rules import (
    RULE_DEFINITIONS,
    match_finding_to_rule,
)


class DummyFinding:
    def __init__(self, id, category, severity, title, description):
        self.id = id
        self.category = category
        self.severity = severity
        self.title = title
        self.description = description


def test_match_ikev1():
    f = DummyFinding("F-1", "Protocol", "Critical", "IKEv1 Deprecated Protocol", "Major version 1 detected")
    assert match_finding_to_rule(f) == "RULE_IKEV1"


def test_match_weak_dh():
    f = DummyFinding("F-2", "Key Exchange", "High", "Insecure Diffie-Hellman", "DH Group 2 (MODP-1024) is deficient")
    assert match_finding_to_rule(f) == "RULE_WEAK_DH"


def test_match_weak_cipher():
    f = DummyFinding("F-3", "Cryptography", "High", "Deprecated Cipher Suite", "3DES cipher vulnerable to Sweet32")
    assert match_finding_to_rule(f) == "RULE_WEAK_CRYPTO"


def test_match_no_pfs():
    f = DummyFinding("F-4", "PFS", "Medium", "Perfect Forward Secrecy Disabled", "Child SA without Diffie-Hellman")
    assert match_finding_to_rule(f) == "RULE_NO_PFS"


def test_match_informational_ignored():
    f = DummyFinding("F-5", "Cryptography", "Informational", "AEAD Active", "AES-GCM is modern and secure")
    assert match_finding_to_rule(f) is None
