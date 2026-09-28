"""Known IPsec, IKEv1, IKEv2, ESP, and AH protocol field definitions and registries.

References:
- RFC 7296: Internet Key Exchange Protocol Version 2 (IKEv2)
- RFC 2409: The Internet Key Exchange (IKEv1)
- RFC 4301: Security Architecture for the Internet Protocol
- RFC 4303: IP Encapsulating Security Payload (ESP)
- RFC 4302: IP Authentication Header (AH)
- IANA IKEv2 Parameters Registry
"""

from typing import Dict, Any

# IKE Versions
IKE_VERSIONS: Dict[int, str] = {
    0x10: "IKEv1",
    1: "IKEv1",
    0x20: "IKEv2",
    2: "IKEv2",
}

# IKEv2 Exchange Types (RFC 7296 Section 3.1)
IKEV2_EXCHANGE_TYPES: Dict[int, str] = {
    34: "IKE_SA_INIT",
    35: "IKE_AUTH",
    36: "CREATE_CHILD_SA",
    37: "INFORMATIONAL",
}

# IKEv1 Exchange Types (RFC 2409 Section 3.1)
IKEV1_EXCHANGE_TYPES: Dict[int, str] = {
    2: "Identity Protection (Main Mode)",
    4: "Aggressive Mode",
    5: "Informational",
    32: "Quick Mode",
    33: "New Group Mode",
}

# IKEv2 Transform Types (RFC 7296 Section 3.3.2)
IKEV2_TRANSFORM_TYPES: Dict[int, str] = {
    1: "ENCR",
    2: "PRF",
    3: "INTEG",
    4: "D-H",
    5: "ESN",
}

# IKEv2 Encryption Transform IDs (ENCR)
IKEV2_ENCR_ALGORITHMS: Dict[int, str] = {
    1: "DES-IV64",
    2: "DES",
    3: "3DES-CBC",
    4: "RC5",
    5: "IDEA",
    6: "CAST",
    7: "BLOWFISH",
    11: "NULL",
    12: "AES-CBC",
    14: "AES-CBC",
    18: "AES-CTR",
    19: "AES-CCM-8",
    20: "AES-GCM-16",
    28: "CHACHA20-POLY1305",
}

# IKEv2 Pseudo-random Function Transform IDs (PRF)
IKEV2_PRF_ALGORITHMS: Dict[int, str] = {
    1: "PRF_HMAC_MD5",
    2: "PRF_HMAC_SHA1",
    3: "PRF_HMAC_TIGER",
    4: "PRF_AES128_XCBC",
    5: "PRF_HMAC_SHA2_256",
    6: "PRF_HMAC_SHA2_384",
    7: "PRF_HMAC_SHA2_512",
}

# IKEv2 Integrity Transform IDs (INTEG)
IKEV2_INTEG_ALGORITHMS: Dict[int, str] = {
    0: "NONE (AEAD Suite)",
    1: "AUTH_HMAC_MD5_96",
    2: "AUTH_HMAC_SHA1_96",
    3: "AUTH_DES_MAC",
    4: "AUTH_KPDK_MD5",
    5: "AUTH_AES_XCBC_96",
    12: "AUTH_HMAC_SHA2_256_128",
    13: "AUTH_HMAC_SHA2_384_192",
    14: "AUTH_HMAC_SHA2_512_256",
}

# Diffie-Hellman Groups (Transform Type 4 / Key Exchange)
DH_GROUPS: Dict[int, str] = {
    1: "DH Group 1 (MODP-768)",
    2: "DH Group 2 (MODP-1024)",
    5: "DH Group 5 (MODP-1536)",
    14: "DH Group 14 (MODP-2048)",
    15: "DH Group 15 (MODP-3072)",
    16: "DH Group 16 (MODP-4096)",
    19: "DH Group 19 (ECP-256)",
    20: "DH Group 20 (ECP-384)",
    21: "DH Group 21 (ECP-521)",
    31: "DH Group 31 (Curve25519)",
}

# IKEv1 Attributes (RFC 2409)
IKEV1_ENCR_ALGORITHMS: Dict[int, str] = {
    1: "DES-CBC",
    2: "IDEA-CBC",
    3: "Blowfish-CBC",
    4: "RC5-R16-B64-CBC",
    5: "3DES-CBC",
    6: "CAST-128-CBC",
    7: "AES-CBC",
}

IKEV1_HASH_ALGORITHMS: Dict[int, str] = {
    1: "MD5",
    2: "SHA1",
    3: "Tiger",
    4: "SHA2-256",
    5: "SHA2-384",
    6: "SHA2-512",
}

IKEV1_AUTH_METHODS: Dict[int, str] = {
    1: "Pre-Shared Key",
    2: "DSS Signatures",
    3: "RSA Signatures",
    4: "Encryption with RSA",
    5: "Revised encryption with RSA",
    64221: "Hybrid Mode",
    65001: "XAUTH",
}


def resolve_ike_version(val: Any) -> str:
    """Resolve raw version byte or hex into canonical version string."""
    if val is None:
        return "Unknown"
    try:
        if isinstance(val, str):
            if val.startswith("0x") or val.startswith("0X"):
                num = int(val, 16)
            else:
                num = int(val)
        else:
            num = int(val)
        # Check major version bits or exact value
        major = (num >> 4) if num > 2 else num
        if major == 1 or num in (1, 0x10):
            return "IKEv1"
        elif major == 2 or num in (2, 0x20):
            return "IKEv2"
    except (ValueError, TypeError):
        pass
    return "Unknown"


def resolve_dh_group_name(group_id: int) -> str:
    """Map DH group ID to standard canonical name."""
    return DH_GROUPS.get(group_id, f"DH Group {group_id} (Unknown)")
