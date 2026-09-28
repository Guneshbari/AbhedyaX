"""Deterministic IPsec security assessment rules.

Evaluates observed IPsec configuration against cybersecurity standards
(NIST SP 800-77 Rev. 1, ANSSI, RFC 7296). Only triggers findings when concrete
evidence is present.
"""

from typing import List, Dict, Any
from app.models.analysis import SecurityFinding, FindingSeverityType, FindingCategoryType
from app.packet.extractor import ProtocolExtractionResult


def evaluate_security_rules(extraction: ProtocolExtractionResult) -> List[SecurityFinding]:
    """Run deterministic security audit rules against extracted protocol parameters."""
    findings: List[SecurityFinding] = []
    crypto = extraction.cryptography
    vpn = extraction.vpn
    raw = extraction.raw_parameters

    # IKE-001: Legacy IKEv1 usage
    if vpn.ike_version == "IKEv1":
        ike_frames = [
            f.packet_numbers
            for f in extraction.evidence
            if f.field == "ike_version"
        ]
        flattened_frames = [item for sublist in ike_frames for item in sublist]
        frame_ref = (
            f"Observed in frame(s) {flattened_frames[:5]}"
            if flattened_frames
            else "Observed in packet headers"
        )
        findings.append(
            SecurityFinding(
                id="IKE-001",
                severity="High",
                category="Protocol",
                title="Legacy IKEv1 Protocol Active",
                description="The session negotiated parameters using IKEv1 (RFC 2409), which lacks modern collision resistance, DoS prevention cookies, and efficient re-keying mechanisms.",
                evidence=[
                    f"IKE major version 1 observed in ISAKMP header",
                    frame_ref,
                    "RFC 7296 recommends deprecation of IKEv1 in favor of IKEv2",
                ],
                recommendation="Migrate IPsec gateway and client configuration to IKEv2 (RFC 7296) to enable modern cryptographic suites, reduced round trips, and robust DoS cookie exchange.",
                confidence=1.0,
            )
        )

    # CRYPTO-001: Weak or Deprecated Encryption Algorithm
    encr_lower = crypto.encryption.lower()
    weak_ciphers = ["3des", "des", "blowfish", "idea", "rc5", "null"]
    if any(wc in encr_lower for wc in weak_ciphers):
        findings.append(
            SecurityFinding(
                id="CRYPTO-001",
                severity="Critical",
                category="Cryptography",
                title=f"Deprecated Cipher Suite ({crypto.encryption})",
                description=f"Session negotiates {crypto.encryption}, which possesses known structural vulnerabilities (e.g., Sweet32 collision attacks against 64-bit block ciphers).",
                evidence=[
                    f"Observed Transform: {crypto.encryption}",
                    "NIST SP 800-131A Rev. 2 disallows 3DES and DES for cryptographic protection",
                ],
                recommendation="Replace legacy ciphers with authenticated encryption (AEAD) algorithms such as AES-256-GCM or ChaCha20-Poly1305.",
                confidence=0.98,
            )
        )
    elif "aes-128-cbc" in encr_lower:
        findings.append(
            SecurityFinding(
                id="CRYPTO-002",
                severity="Low",
                category="Cryptography",
                title="Sub-optimal Cipher Suite (AES-128-CBC)",
                description="AES-128-CBC is cryptographically sound but susceptible to padding oracle attacks if not paired with strict Encrypt-then-MAC authentication.",
                evidence=[
                    f"Observed Transform: {crypto.encryption}",
                    "CBC mode requires separate HMAC verification and explicit IV management",
                ],
                recommendation="Upgrade to AES-256-GCM (AEAD) to combine high-performance confidentiality and integrity validation in a single cryptographic operation.",
                confidence=0.95,
            )
        )

    # DH-001: Weak Diffie-Hellman Group
    dh_lower = crypto.dh_group.lower()
    if any(wg in dh_lower for wg in ["group 1 ", "group 2 ", "group 5 ", "modp-768", "modp-1024"]):
        findings.append(
            SecurityFinding(
                id="DH-001",
                severity="High",
                category="Key Exchange",
                title=f"Insecure Key Exchange Group ({crypto.dh_group})",
                description=f"Diffie-Hellman {crypto.dh_group} provides fewer than 112 bits of security, making it vulnerable to pre-computation and discrete logarithm attacks (Logjam).",
                evidence=[
                    f"Observed Transform ID (KE): {crypto.dh_group}",
                    "NIST SP 800-77 Rev. 1 requires MODP group 14 (2048-bit) as the absolute minimum",
                ],
                recommendation="Mandate Diffie-Hellman Group 19 (256-bit ECP), Group 20 (384-bit ECP), or Group 14 (2048-bit MODP) in IKE Phase 1 and Phase 2 proposals.",
                confidence=1.0,
            )
        )
    elif "group 14" in dh_lower:
        findings.append(
            SecurityFinding(
                id="DH-002",
                severity="Informational",
                category="Key Exchange",
                title="Legacy Baseline Diffie-Hellman (MODP-2048)",
                description="DH Group 14 (MODP-2048) provides acceptable 112-bit security but incurs significantly higher computational and transmission overhead than modern elliptic curve groups.",
                evidence=[
                    f"Observed Key Exchange Group: {crypto.dh_group}",
                    "RFC 8247 recommends transition from MODP to Curve25519 (Group 31) or ECP-256 (Group 19)",
                ],
                recommendation="Consider adopting DH Group 19 (ECP-256) or Group 31 (Curve25519) for faster handshake latency and post-quantum forward security transition.",
                confidence=0.90,
            )
        )

    # AUTH-001: Weak Authentication / Integrity Hash
    auth_lower = crypto.authentication.lower()
    if "md5" in auth_lower:
        findings.append(
            SecurityFinding(
                id="AUTH-001",
                severity="Critical",
                category="Authentication",
                title="Broken Hash Algorithm (HMAC-MD5)",
                description="HMAC-MD5 provides severely compromised collision resistance and is banned under all major cybersecurity compliance frameworks.",
                evidence=[
                    f"Observed Integrity Algorithm: {crypto.authentication}",
                    "RFC 6151 deprecates MD5 in Internet protocols",
                ],
                recommendation="Immediately enforce HMAC-SHA2-256 or migrate to an integrated AEAD suite.",
                confidence=1.0,
            )
        )
    elif "sha1" in auth_lower:
        findings.append(
            SecurityFinding(
                id="AUTH-002",
                severity="High",
                category="Authentication",
                title="Deprecated Hash Algorithm (HMAC-SHA1)",
                description="HMAC-SHA1 is formally deprecated due to practical theoretical collision vectors and organizational compliance guidelines (NIST SP 800-131A).",
                evidence=[
                    f"Observed Integrity Algorithm: {crypto.authentication}",
                    "NIST deprecates SHA-1 for digital signatures and protocol integrity",
                ],
                recommendation="Configure HMAC-SHA2-256-128 or upgrade to an AEAD cipher suite (AES-GCM).",
                confidence=0.95,
            )
        )

    # PFS-001: Perfect Forward Secrecy Disabled
    if not crypto.pfs and vpn.ike_version != "Unknown":
        findings.append(
            SecurityFinding(
                id="PFS-001",
                severity="Medium",
                category="PFS",
                title="Perfect Forward Secrecy Not Enforced in Child SA",
                description="The Child SA rekeys without executing an independent Diffie-Hellman exchange, meaning compromise of the master IKE SA key exposes subsequent data traffic.",
                evidence=[
                    "No Diffie-Hellman transform present in CREATE_CHILD_SA proposal",
                    "RFC 7296 recommends distinct KE payload for Child SA negotiations",
                ],
                recommendation="Enable Perfect Forward Secrecy (PFS) in Phase 2 / Child SA proposals so that each IPsec SA generates ephemeral session keys.",
                confidence=0.90,
            )
        )

    # LIFE-001: Excessive SA Lifetime
    lifetimes = raw.get("sa_lifetimes", [])
    if lifetimes:
        for dur, frame in lifetimes:
            if dur > 28800:  # > 8 hours
                findings.append(
                    SecurityFinding(
                        id="LIFE-001",
                        severity="Medium",
                        category="Configuration",
                        title=f"Excessive Security Association Lifetime ({dur}s)",
                        description=f"SA lifetime of {dur} seconds ({round(dur / 3600, 1)} hours) exceeds recommended operational limits, extending attacker replay and cryptanalysis windows.",
                        evidence=[
                            f"SA Lifetime duration: {dur}s (observed in frame {frame})",
                            "Best-practice guidelines recommend maximum 8 hours (28800s) or 1 hour for high-threat environments",
                        ],
                        recommendation="Configure gateway SA rekeying intervals between 3600s (1h) and 28800s (8h) to limit cryptographic exposure.",
                        confidence=0.95,
                    )
                )
                break

    # If no findings triggered, add an Informational hardening finding
    if not findings:
        findings.append(
            SecurityFinding(
                id="AUDIT-001",
                severity="Informational",
                category="Protocol",
                title="Robust Cryptographic Alignment",
                description="All observed protocol parameters comply with NIST SP 800-77 Rev. 1 and RFC 7296 guidelines.",
                evidence=[
                    f"IKE Version: {vpn.ike_version}",
                    f"Cipher: {crypto.encryption}",
                    f"Key Exchange: {crypto.dh_group}",
                ],
                recommendation="Continue periodic audits and monitor for emerging post-quantum hybrid key exchange recommendations.",
                confidence=1.0,
            )
        )

    return findings
