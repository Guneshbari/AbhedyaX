"""Deterministic Security Risk Scoring Methodology definition and documentation."""

from typing import Dict, Any
from services.security_engine.src.models import RiskLevelType

METHODOLOGY_VERSION = "v1.2.0-deterministic"

RISK_BANDS: Dict[str, Dict[str, Any]] = {
    "Low": {
        "range": (90, 100),
        "description": "Robust cryptographic posture. Compliant modern IKEv2, AEAD cipher suites (AES-GCM / ChaCha20), strong Diffie-Hellman (ECP or MODP >= 2048), enforced Perfect Forward Secrecy, and active anti-replay window.",
        "action": "Maintain current security posture. Regular compliance audit cadence.",
        "color": "#10B981",  # Emerald
    },
    "Moderate": {
        "range": (75, 89),
        "description": "Acceptable security posture with non-critical configuration trade-offs. Encryption remains secure, but secondary controls such as PFS, SA lifetime limits, or cipher modes (CBC vs AEAD) deviate from best practice.",
        "action": "Schedule planned migration to AEAD suites and enable PFS on Child SAs during next maintenance window.",
        "color": "#3B82F6",  # Blue / Sky
    },
    "High": {
        "range": (50, 74),
        "description": "Elevated vulnerability exposure. Configuration contains deprecated algorithms (e.g., DH Group 2 / MODP-1024), disabled anti-replay protection, or combinations of missing forward secrecy and legacy CBC integrity.",
        "action": "Prioritize remediation. Upgrade Diffie-Hellman groups and enable anti-replay protection within 72 hours.",
        "color": "#F59E0B",  # Amber
    },
    "Critical": {
        "range": (0, 49),
        "description": "Severe security compromise risk. Obsolete protocol versions (IKEv1), broken cryptographic primitives (3DES, DES, MD5, SHA-1), or unauthenticated tunneling exposing session traffic to passive decryption or active interception.",
        "action": "Immediate emergency escalation. Decommission or rebuild VPN tunnel gateway configuration immediately.",
        "color": "#EF4444",  # Red
    },
}


def score_to_risk_level(score: int) -> RiskLevelType:
    """Map a numerical score (0-100) to its corresponding operational risk level.

    Scoring Bands:
      90 - 100 -> Low
      75 -  89 -> Moderate
      50 -  74 -> High
       0 -  49 -> Critical
    """
    clamped_score = max(0, min(100, score))
    if clamped_score >= 90:
        return "Low"
    elif clamped_score >= 75:
        return "Moderate"
    elif clamped_score >= 50:
        return "High"
    else:
        return "Critical"


def score_to_grade(score: int) -> str:
    """Map a numerical score (0-100) to its letter grade.

    Grading Bands:
      90 - 100 -> A
      80 -  89 -> B
      70 -  79 -> C
      60 -  69 -> D
       0 -  59 -> F
    """
    clamped_score = max(0, min(100, score))
    if clamped_score >= 90:
        return "A"
    elif clamped_score >= 80:
        return "B"
    elif clamped_score >= 70:
        return "C"
    elif clamped_score >= 60:
        return "D"
    else:
        return "F"
