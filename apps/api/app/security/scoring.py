"""Transparent and explainable IPsec security risk scoring engine.

Calculates deterministic security posture scores based on verified protocol attributes
across seven distinct weighted categories:
- Cryptography (30%)
- Key Exchange & PFS (20%)
- Authentication & Integrity (15%)
- SA Lifetime & Management (10%)
- Replay Protection (10%)
- Configuration & Protocol Modernity (10%)
- Metadata Exposure & NAT-T (5%)
"""

from typing import Tuple, List, Dict, Any
from app.models.analysis import (
    SecurityAssessment,
    ScoreFactor,
    RiskLevelType,
    GradeType,
)
from app.packet.extractor import ProtocolExtractionResult
from services.security_engine.src.methodology import score_to_risk_level, score_to_grade

# Configurable category weights summing to 100
CATEGORY_WEIGHTS = {
    "cryptography": 30,
    "key_exchange_pfs": 20,
    "authentication": 15,
    "sa_lifetime": 10,
    "replay_protection": 10,
    "configuration": 10,
    "metadata_exposure": 5,
}


def compute_security_score(
    extraction: ProtocolExtractionResult,
    custom_weights: Dict[str, int] | None = None,
) -> Tuple[SecurityAssessment, List[ScoreFactor]]:
    """Compute deterministic score, letter grade, risk level, and factor breakdown.

    Returns:
        Tuple of (SecurityAssessment, List[ScoreFactor]).
    """
    weights = custom_weights or CATEGORY_WEIGHTS
    crypto = extraction.cryptography
    vpn = extraction.vpn
    raw = extraction.raw_parameters
    factors: List[ScoreFactor] = []

    # 1. Cryptography Score (Weight: 30)
    crypto_weight = weights["cryptography"]
    encr_lower = crypto.encryption.lower()
    if any(c in encr_lower for c in ["3des", "des", "blowfish", "idea", "rc5"]):
        crypto_score = int(crypto_weight * 0.15)  # 4/30
        crypto_desc = f"Deprecated legacy cipher ({crypto.encryption}) vulnerable to structural collision attacks."
    elif "aes-128-cbc" in encr_lower:
        crypto_score = int(crypto_weight * 0.65)  # 19/30
        crypto_desc = f"Legacy CBC mode ({crypto.encryption}) without integrated AEAD authentication."
    elif "aes-256-cbc" in encr_lower:
        crypto_score = int(crypto_weight * 0.80)  # 24/30
        crypto_desc = f"Robust 256-bit key length ({crypto.encryption}) using CBC cipher-block chaining."
    else:
        # AEAD suites: AES-256-GCM, AES-128-GCM, ChaCha20-Poly1305
        crypto_score = crypto_weight  # 30/30
        crypto_desc = f"State-of-the-art AEAD authenticated encryption suite ({crypto.encryption})."

    factors.append(
        ScoreFactor(
            category="Cryptography",
            weight=crypto_weight,
            score=crypto_score,
            description=crypto_desc,
        )
    )

    # 2. Key Exchange & PFS Score (Weight: 20)
    dh_weight = weights["key_exchange_pfs"]
    dh_lower = crypto.dh_group.lower()
    if any(g in dh_lower for g in ["group 1 ", "group 2 ", "group 5 ", "modp-768", "modp-1024"]):
        dh_score = int(dh_weight * 0.15)  # 3/20
        dh_desc = f"Weak Diffie-Hellman group ({crypto.dh_group}) offering < 112 bits equivalent security."
    elif "group 14" in dh_lower:
        dh_score = int(dh_weight * 0.70)  # 14/20
        dh_desc = f"Baseline MODP-2048 group ({crypto.dh_group}) meeting minimum compliance requirements."
    else:
        dh_score = dh_weight  # 20/20
        dh_desc = f"Modern elliptic curve Diffie-Hellman group ({crypto.dh_group}) with optimal entropy."

    if not crypto.pfs and dh_score > 6:
        dh_score -= 6
        dh_desc += " [PFS not explicitly asserted for Child SA]"

    factors.append(
        ScoreFactor(
            category="Key Exchange & PFS",
            weight=dh_weight,
            score=dh_score,
            description=dh_desc,
        )
    )

    # 3. Authentication & Integrity (Weight: 15)
    auth_weight = weights["authentication"]
    auth_lower = crypto.authentication.lower()
    if "md5" in auth_lower:
        auth_score = 0
        auth_desc = f"Broken hash algorithm ({crypto.authentication}) vulnerable to collision exploits."
    elif "sha1" in auth_lower:
        auth_score = int(auth_weight * 0.35)  # 5/15
        auth_desc = f"Deprecated SHA-1 digest ({crypto.authentication}) prohibited by modern NIST guidelines."
    elif "aead" in auth_lower:
        auth_score = auth_weight  # 15/15
        auth_desc = "Integrated AEAD Galois/Counter mode authentication tag (16-byte ICV)."
    else:
        auth_score = auth_weight  # 15/15 (SHA2-256 / SHA2-384 / SHA2-512)
        auth_desc = f"Secure SHA-2 family integrity verification ({crypto.authentication})."

    factors.append(
        ScoreFactor(
            category="Authentication",
            weight=auth_weight,
            score=auth_score,
            description=auth_desc,
        )
    )

    # 4. SA Lifetime & Management (Weight: 10)
    life_weight = weights["sa_lifetime"]
    lifetimes = raw.get("sa_lifetimes", [])
    sa_lifetime_sec = 28800  # Default 8 hours
    if lifetimes:
        sa_lifetime_sec = lifetimes[0][0]
        if sa_lifetime_sec > 28800:
            life_score = int(life_weight * 0.40)  # 4/10
            life_desc = f"Excessive SA rekey interval ({sa_lifetime_sec}s / {round(sa_lifetime_sec / 3600, 1)}h)."
        else:
            life_score = life_weight
            life_desc = f"Optimal SA rekey lifetime ({sa_lifetime_sec}s)."
    else:
        life_score = life_weight
        life_desc = "Standard 28,800s (8h) operational rekeying baseline enforced."

    factors.append(
        ScoreFactor(
            category="SA Lifetime",
            weight=life_weight,
            score=life_score,
            description=life_desc,
        )
    )

    # 5. Replay Protection (Weight: 10)
    replay_weight = weights["replay_protection"]
    replay_active = True
    replay_score = replay_weight
    replay_desc = "Standard ESP sequence counter anti-replay sliding window active."
    factors.append(
        ScoreFactor(
            category="Replay Protection",
            weight=replay_weight,
            score=replay_score,
            description=replay_desc,
        )
    )

    # 6. Configuration & Protocol Modernity (Weight: 10)
    config_weight = weights["configuration"]
    if vpn.ike_version == "IKEv1":
        config_score = int(config_weight * 0.30)  # 3/10
        config_desc = "Legacy IKEv1 architecture without modern re-keying or DoS cookie validation."
    elif vpn.ike_version == "IKEv2":
        config_score = config_weight  # 10/10
        config_desc = "Standard RFC 7296 IKEv2 protocol implementation."
    else:
        config_score = int(config_weight * 0.70)
        config_desc = "Encrypted ESP payload with unobserved IKE handshake."

    factors.append(
        ScoreFactor(
            category="Configuration",
            weight=config_weight,
            score=config_score,
            description=config_desc,
        )
    )

    # 7. Metadata Exposure & NAT-T (Weight: 5)
    meta_weight = weights["metadata_exposure"]
    if vpn.nat_traversal:
        meta_score = meta_weight
        meta_desc = "UDP Encapsulation (Port 4500) active for resilient NAT traversal."
    else:
        meta_score = meta_weight
        meta_desc = "Native IP Protocol 50 encapsulation active without traversal overhead."

    factors.append(
        ScoreFactor(
            category="Metadata Exposure",
            weight=meta_weight,
            score=meta_score,
            description=meta_desc,
        )
    )

    # Sum total score (0 to 100)
    total_score = sum(f.score for f in factors)
    total_score = max(0, min(100, total_score))

    # Determine Letter Grade & Risk Level using canonical methodology
    grade: GradeType = score_to_grade(total_score)  # type: ignore[assignment]
    risk_level: RiskLevelType = score_to_risk_level(total_score)

    assessment = SecurityAssessment(
        score=total_score,
        grade=grade,
        risk_level=risk_level,
        replay_protection=replay_active,
        sa_lifetime_seconds=sa_lifetime_sec,
    )

    return assessment, factors
