"""Deterministic rule evaluations and anti-double-counting logic."""

from typing import Any, Callable, Dict, List, Optional
from services.security_engine.src.models import ScoringDeduction

# Standard deduction definitions according to AbhedyaX Phase 5 Specification
RULE_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "RULE_IKEV1": {
        "condition": "IKEv1 protocol detected",
        "category": "Protocol",
        "severity": "Critical",
        "deduction": 25,
        "reason": "IKEv1 is obsolete (RFC 7296), vulnerable to offline dictionary attacks, aggressive mode identity leaks, and denial-of-service.",
    },
    "RULE_WEAK_DH": {
        "condition": "Weak or deprecated Diffie-Hellman group",
        "category": "Key Exchange",
        "severity": "Critical",
        "deduction": 20,
        "reason": "Diffie-Hellman groups < 2048-bit (MODP-768/1024 or Group 1/2/5) provide inadequate security margins vulnerable to precomputation (Logjam).",
    },
    "RULE_WEAK_CRYPTO": {
        "condition": "Weak/deprecated cipher or integrity algorithm",
        "category": "Cryptography",
        "severity": "High",
        "deduction": 15,
        "reason": "Legacy cipher/hash algorithms (3DES, DES, SHA-1, MD5) are vulnerable to collision attacks, Sweet32, or bit-flipping attacks.",
    },
    "RULE_NO_REPLAY": {
        "condition": "Anti-replay protection disabled",
        "category": "Replay Protection",
        "severity": "High",
        "deduction": 15,
        "reason": "Anti-replay sequence number checking is disabled, permitting malicious packet injection, tunnel state desynchronization, and replay attacks.",
    },
    "RULE_WEAK_AUTH": {
        "condition": "Weak authentication configuration",
        "category": "Authentication",
        "severity": "High",
        "deduction": 15,
        "reason": "Weak pre-shared key, aggressive mode PSK negotiation, or deprecated signature algorithm exposes tunnel credentials to dictionary attacks.",
    },
    "RULE_NO_PFS": {
        "condition": "Perfect Forward Secrecy disabled",
        "category": "PFS",
        "severity": "High",
        "deduction": 12,
        "reason": "Child SA negotiations omit fresh Diffie-Hellman exchange, permitting retrospective bulk decryption if long-term gateway keys are compromised.",
    },
    "RULE_EXTENDED_SA": {
        "condition": "Excessive Security Association lifetime",
        "category": "SA Lifetime",
        "severity": "Medium",
        "deduction": 8,
        "reason": "Configured SA lifetime exceeds 28,800 seconds (8 hours), expanding the cryptanalytic attack surface and cryptoperiod window.",
    },
    "RULE_TRAFFIC_ANOMALY": {
        "condition": "Encrypted flow behavioral anomaly",
        "category": "Metadata Exposure",
        "severity": "Medium",
        "deduction": 5,
        "reason": "Statistical packet timing/size profile exhibits significant entropy deviation or anomalous burst patterns warranting investigation.",
    },
}


def match_finding_to_rule(finding: Any) -> Optional[str]:
    """Inspect finding attributes (ID, category, title, description) and match to a standard rule.

    Returns:
        The matched rule key (e.g. 'RULE_IKEV1') or None if the finding is Informational or non-deductible.
    """
    fid = getattr(finding, "id", "").upper()
    cat = getattr(finding, "category", "").lower()
    sev = getattr(finding, "severity", "")
    title = getattr(finding, "title", "").lower()
    desc = getattr(finding, "description", "").lower()
    text = f"{title} {desc}"

    # Do not deduct for Informational findings
    if sev.lower() == "informational":
        return None

    # 1. IKEv1 Rule
    if "ikev1" in text or "ike v1" in text or (cat == "protocol" and "v1" in text):
        return "RULE_IKEV1"

    # 2. Weak DH Rule
    if cat == "key exchange" or "diffie-hellman" in text or "dh group" in text:
        if any(term in text for term in ["group 1", "group 2", "group 5", "modp-768", "modp-1024", "deprecated key exchange", "logjam"]):
            return "RULE_WEAK_DH"

    # 3. Weak Crypto Rule
    if cat in ["cryptography", "authentication"]:
        if any(term in text for term in ["3des", "des", "sha-1", "sha1", "md5", "blowfish", "sweet32", "insecure integrity"]):
            return "RULE_WEAK_CRYPTO"

    # 4. Replay Protection Rule
    if cat == "replay protection" or "replay" in text:
        if any(term in text for term in ["disabled", "window size: 0", "lacks anti-replay"]):
            return "RULE_NO_REPLAY"

    # 5. Weak Auth Rule
    if cat == "authentication" or "psk" in text:
        if any(term in text for term in ["weak psk", "pre-shared key", "aggressive mode", "weak authentication"]):
            return "RULE_WEAK_AUTH"

    # 6. PFS Rule
    if cat == "pfs" or "forward secrecy" in text:
        if any(term in text for term in ["disabled", "lacks", "omitted", "without diffie-hellman"]):
            return "RULE_NO_PFS"

    # 7. Extended SA Lifetime Rule
    if cat in ["configuration", "sa lifetime"] or "lifetime" in text:
        if any(term in text for term in ["extended sa", "lifetime attribute", "86400", "excessive", "24 hours"]):
            return "RULE_EXTENDED_SA"

    # 8. Traffic Anomaly Rule
    if cat in ["metadata exposure", "traffic intelligence"] or "anomaly" in text:
        if any(term in text for term in ["anomaly", "entropy", "irregular", "deviate"]):
            return "RULE_TRAFFIC_ANOMALY"

    return None
