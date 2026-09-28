"""Security Twin Builder.

Constructs canonical SecurityTwin objects by correlating intended security policy
with observed wire/session parameters from canonical AnalysisResult instances.
"""

from typing import Optional, Dict, Any, List
from app.models.analysis import AnalysisResult
from services.security_twin.src.models.security_twin import (
    SecurityState,
    AlignmentItem,
    TwinAlignment,
    TwinSecurityImpact,
    TwinProvenance,
    SecurityTwin,
)

# Standard NIST SP 800-77 Rev 1 Recommended Enterprise Security Policy Baseline
STANDARD_ENTERPRISE_INTENDED_POLICY = {
    "ipsec": True,
    "ike_version": "IKEv2",
    "mode": "Tunnel",
    "ip_version": "IPv4",
    "encryption": "AES-256-GCM",
    "authentication": "AEAD",
    "dh_group": "DH Group 19",
    "pfs": True,
    "replay_protection": True,
    "sa_lifetime": 28800,
}


def build_security_twin(
    analysis: AnalysisResult,
    expected_override: Optional[Dict[str, Any]] = None,
) -> SecurityTwin:
    """Build a canonical SecurityTwin from an AnalysisResult.

    Consumes the canonical analysis without modifying or recalculating risk scores.
    """
    # 1. Determine Intended / Expected State
    exp_dict = expected_override or STANDARD_ENTERPRISE_INTENDED_POLICY

    # For native IPv6 scenario, intended policy is IPv6
    if analysis.vpn.ip_version == "IPv6" and not expected_override:
        exp_dict = {
            **exp_dict,
            "ip_version": "IPv6",
            "dh_group": "DH Group 20",
        }

    # For ChaCha20-Poly1305 observed PCAP, intended policy accepts modern RFC 7634 AEAD
    if analysis.cryptography.encryption == "ChaCha20-Poly1305" and not expected_override:
        exp_dict = {
            **exp_dict,
            "encryption": "ChaCha20-Poly1305",
        }

    expected_state = SecurityState(
        ipsec=True,
        ike_version=exp_dict.get("ike_version"),
        mode=exp_dict.get("mode"),
        ip_version=exp_dict.get("ip_version"),
        encryption=exp_dict.get("encryption"),
        authentication=exp_dict.get("authentication"),
        dh_group=exp_dict.get("dh_group"),
        pfs=exp_dict.get("pfs"),
        replay_protection=exp_dict.get("replay_protection"),
        sa_lifetime=exp_dict.get("sa_lifetime"),
    )

    # 2. Extract Observed State from Canonical AnalysisResult
    observed_state = SecurityState(
        ipsec=True,
        ike_version=analysis.vpn.ike_version,
        mode=analysis.vpn.mode,
        ip_version=analysis.vpn.ip_version,
        encryption=analysis.cryptography.encryption,
        authentication=analysis.cryptography.authentication,
        dh_group=analysis.cryptography.dh_group,
        pfs=analysis.cryptography.pfs,
        replay_protection=analysis.security.replay_protection,
        sa_lifetime=analysis.security.sa_lifetime_seconds,
    )

    # 3. Evaluate Property Alignment
    prop_checks = [
        ("IKE Version", expected_state.ike_version, observed_state.ike_version, ["PROV-001"]),
        ("IPsec Mode", expected_state.mode, observed_state.mode, ["PROV-001"]),
        ("IP Protocol Version", expected_state.ip_version, observed_state.ip_version, ["PROV-001"]),
        ("Encryption Algorithm", expected_state.encryption, observed_state.encryption, ["PROV-002"]),
        ("Integrity/Authentication", expected_state.authentication, observed_state.authentication, ["PROV-002"]),
        ("Diffie-Hellman Group", expected_state.dh_group, observed_state.dh_group, ["PROV-003"]),
        ("Perfect Forward Secrecy", expected_state.pfs, observed_state.pfs, ["PROV-003"]),
        ("Replay Protection", expected_state.replay_protection, observed_state.replay_protection, ["PROV-004"]),
        ("SA Lifetime (s)", expected_state.sa_lifetime, observed_state.sa_lifetime, ["PROV-004"]),
    ]

    items: List[AlignmentItem] = []
    matched = 0
    mismatched = 0

    for prop_name, exp_val, obs_val, ev_ids in prop_checks:
        is_match = exp_val == obs_val
        status_val = "match" if is_match else "mismatch"
        if is_match:
            matched += 1
            note = f"Observed '{obs_val}' strictly aligns with intended enterprise baseline."
        else:
            mismatched += 1
            note = f"Configuration drift: Expected '{exp_val}', but observed '{obs_val}'."

        items.append(
            AlignmentItem(
                property=prop_name,
                expected=exp_val,
                observed=obs_val,
                status=status_val,
                evidence_ids=ev_ids,
                impact_note=note,
            )
        )

    # Determine overall alignment status
    if mismatched == 0:
        overall = "aligned"
    elif mismatched <= 2 and analysis.security.score >= 75:
        overall = "partial"
    else:
        overall = "drifted"

    alignment = TwinAlignment(
        overall=overall,
        items=items,
        matched_count=matched,
        mismatched_count=mismatched,
        unknown_count=0,
    )

    # 4. Canonical Security Impact (Strictly consumes analysis.security / findings)
    affected_props = [it.property for it in items if it.status == "mismatch"]
    remediation = [f.recommendation for f in analysis.findings if f.recommendation]
    if not remediation and mismatched == 0:
        remediation.append("Current posture fully conforms to enterprise security baseline; maintain active monitoring.")

    impact = TwinSecurityImpact(
        affected_properties=affected_props,
        finding_ids=[f.id for f in analysis.findings],
        risk_score=analysis.security.score,
        risk=analysis.security.risk_level,
        grade=analysis.security.grade,
        remediation_advice=remediation,
    )

    # 5. Provenance
    is_pcap = analysis.source.type == "pcap"
    mode_val = "observed" if is_pcap else "simulation"
    provenance = TwinProvenance(
        expected_state="GroundTruth",
        observed_state="Observed" if is_pcap else "Simulated",
    )

    twin_id = f"TWIN-{analysis.analysis_id}"

    return SecurityTwin(
        analysis_id=analysis.analysis_id,
        twin_id=twin_id,
        mode=mode_val,
        expected_state=expected_state,
        observed_state=observed_state,
        alignment=alignment,
        security_impact=impact,
        provenance=provenance,
    )
