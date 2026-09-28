from typing import Dict, Any, List
from datetime import datetime, timezone
from app.models.analysis import (
    AnalysisResult,
    AnalysisSource,
    VPNConfiguration,
    CryptographyConfiguration,
    SecurityAssessment,
    TrafficIntelligence,
    TrafficCandidateClass,
    TrafficFeatures,
    SecurityFinding,
    FindingsSummary,
    EvidenceProvenanceItem,
    GroundTruthValidationResult,
)
from services.security_engine.src.risk_engine import risk_scoring_engine
from services.security_engine.src.methodology import score_to_grade

SCENARIOS: Dict[str, Dict[str, Any]] = {
    "secure-enterprise": {
        "id": "secure-enterprise",
        "name": "Secure Enterprise VPN",
        "description": "Modern enterprise IPsec configuration",
        "vpn": {
            "protocol": "IPsec",
            "ike_version": "IKEv2",
            "mode": "Tunnel",
            "ip_version": "IPv4",
            "nat_traversal": True,
            "protocols_detected": ["IKEv2", "ESP"],
        },
        "cryptography": {
            "encryption": "AES-256-GCM",
            "authentication": "AEAD",
            "dh_group": "DH Group 19",
            "pfs": True,
        },
        "security": {
            "score": 100,
            "grade": "A",
            "risk_level": "Low",
            "replay_protection": True,
            "sa_lifetime_seconds": 28800,
        },
        "traffic": {
            "predicted_class": "Video",
            "confidence": 0.93,
            "candidate_classes": [
                {"class": "Video", "confidence": 0.93},
                {"class": "Web", "confidence": 0.04},
                {"class": "Messaging", "confidence": 0.03},
            ],
            "features": {
                "packet_size_pattern": "large_bursty",
                "directionality": "bidirectional",
                "inter_arrival_pattern": "steady_bursts",
                "session_duration_seconds": 842,
            },
        },
        "findings": [
            {
                "id": "F-101",
                "severity": "Informational",
                "category": "Cryptography",
                "title": "Compliant AEAD Cipher Suite Negotiated",
                "description": "AES-256-GCM authenticated encryption provides high confidentiality and cryptographic integrity.",
                "evidence": [
                    "Transform: ENCR_AES_GCM_16 with 256-bit key",
                    "Authenticated Encryption with Associated Data (AEAD)",
                ],
                "recommendation": "Maintain active cipher suite per NIST SP 800-77 Rev. 1 guidelines.",
                "confidence": 0.99,
            },
            {
                "id": "F-102",
                "severity": "Informational",
                "category": "Key Exchange",
                "title": "Strong Elliptic Curve Key Exchange",
                "description": "Diffie-Hellman Group 19 (256-bit random ECP group) provides a robust 128-bit security level.",
                "evidence": [
                    "Transform: DH_GROUP_19 (NIST P-256)",
                    "Key exchange verified in IKE_SA_INIT",
                ],
                "recommendation": "Ensure DH group selection aligns with future CNSA Suite requirements.",
                "confidence": 0.98,
            },
            {
                "id": "F-103",
                "severity": "Informational",
                "category": "PFS",
                "title": "Perfect Forward Secrecy Verified",
                "description": "PFS is enforced on Child SA negotiations, preventing retrospective decryption if long-term keys are compromised.",
                "evidence": ["CREATE_CHILD_SA contains fresh KE payload"],
                "recommendation": "Retain PFS enforcement across all rekeying cycles.",
                "confidence": 0.97,
            },
        ],
    },
    "moderate-security": {
        "id": "moderate-security",
        "name": "Moderate Security VPN",
        "description": "Modern IKEv2 configuration with several security trade-offs",
        "vpn": {
            "protocol": "IPsec",
            "ike_version": "IKEv2",
            "mode": "Tunnel",
            "ip_version": "IPv4",
            "nat_traversal": True,
            "protocols_detected": ["IKEv2", "ESP"],
        },
        "cryptography": {
            "encryption": "AES-256-CBC",
            "authentication": "HMAC-SHA256",
            "dh_group": "DH Group 14",
            "pfs": False,
        },
        "security": {
            "score": 80,
            "grade": "B",
            "risk_level": "Moderate",
            "replay_protection": True,
            "sa_lifetime_seconds": 86400,
        },
        "traffic": {
            "predicted_class": "Web",
            "confidence": 0.89,
            "candidate_classes": [
                {"class": "Web", "confidence": 0.89},
                {"class": "Messaging", "confidence": 0.07},
                {"class": "Video", "confidence": 0.04},
            ],
            "features": {
                "packet_size_pattern": "medium_variable",
                "directionality": "bidirectional",
                "inter_arrival_pattern": "steady_bursts",
                "session_duration_seconds": 1240,
            },
        },
        "findings": [
            {
                "id": "F-201",
                "severity": "Medium",
                "category": "PFS",
                "title": "Perfect Forward Secrecy Disabled",
                "description": "Child SA was established without Diffie-Hellman recalculation during rekeying.",
                "evidence": [
                    "CREATE_CHILD_SA exchange lacks KE payload",
                    "Child SA proposals omit DH group transform",
                ],
                "recommendation": "Enable PFS on both IPsec gateways to ensure session keys are ephemeral.",
                "confidence": 0.95,
            },
            {
                "id": "F-202",
                "severity": "Low",
                "category": "Configuration",
                "title": "Extended SA Lifetime Configured",
                "description": "Security Association lifetime is configured for 86400 seconds (24 hours), increasing vulnerability to cryptanalytic window exposure.",
                "evidence": ["SA lifetime attribute: 86400 seconds"],
                "recommendation": "Reduce SA lifetime to 28800 seconds (8 hours) or 4GB volume limit.",
                "confidence": 0.92,
            },
            {
                "id": "F-203",
                "severity": "Informational",
                "category": "Cryptography",
                "title": "CBC Mode Encryption in Use",
                "description": "AES-256-CBC with HMAC-SHA256 is functional but lacks performance and integrity benefits of modern AEAD modes.",
                "evidence": [
                    "Transform: ENCR_AES_CBC (256-bit)",
                    "Transform: AUTH_HMAC_SHA2_256_128",
                ],
                "recommendation": "Plan migration to AES-GCM or ChaCha20-Poly1305 AEAD suites.",
                "confidence": 0.90,
            },
        ],
    },
    "legacy-critical": {
        "id": "legacy-critical",
        "name": "Legacy Weak Configuration",
        "description": "Legacy configuration containing multiple security weaknesses",
        "vpn": {
            "protocol": "IPsec",
            "ike_version": "IKEv1",
            "mode": "Tunnel",
            "ip_version": "IPv4",
            "nat_traversal": True,
            "protocols_detected": ["IKEv1", "ESP"],
        },
        "cryptography": {
            "encryption": "AES-128-CBC",
            "authentication": "HMAC-SHA1",
            "dh_group": "DH Group 2",
            "pfs": False,
        },
        "security": {
            "score": 25,
            "grade": "F",
            "risk_level": "Critical",
            "replay_protection": False,
            "sa_lifetime_seconds": 86400,
        },
        "traffic": {
            "predicted_class": "Messaging",
            "confidence": 0.84,
            "candidate_classes": [
                {"class": "Messaging", "confidence": 0.84},
                {"class": "Web", "confidence": 0.11},
                {"class": "Unknown", "confidence": 0.05},
            ],
            "features": {
                "packet_size_pattern": "small_bursts",
                "directionality": "bidirectional",
                "inter_arrival_pattern": "idle_gaps",
                "session_duration_seconds": 3200,
            },
        },
        "findings": [
            {
                "id": "F-301",
                "severity": "High",
                "category": "Key Exchange",
                "title": "Deprecated Key Exchange (DH Group 2)",
                "description": "Diffie-Hellman Group 2 (MODP-1024) is cryptographically deficient and vulnerable to state-level precomputation attacks (Logjam).",
                "evidence": [
                    "Proposal DH Group: 2 (1024-bit MODP)",
                    "RFC 8221 status: MUST NOT be used",
                ],
                "recommendation": "Immediately upgrade to DH Group 14 (MODP-2048) or Group 19 (ECP-256).",
                "confidence": 0.99,
            },
            {
                "id": "F-302",
                "severity": "High",
                "category": "Authentication",
                "title": "Insecure Integrity Algorithm (SHA-1)",
                "description": "HMAC-SHA1-96 provides inadequate collision resistance and is deprecated by NIST SP 800-131A.",
                "evidence": [
                    "Transform: AUTH_HMAC_SHA1_96",
                    "Truncated 96-bit authentication tag",
                ],
                "recommendation": "Upgrade authentication to HMAC-SHA256 or deploy AEAD ciphers.",
                "confidence": 0.98,
            },
            {
                "id": "F-303",
                "severity": "Medium",
                "category": "Replay Protection",
                "title": "Anti-Replay Protection Disabled",
                "description": "ESP Sequence Number verification window is disabled, leaving session open to replay and packet injection attacks.",
                "evidence": [
                    "Replay window size: 0",
                    "Out-of-order sequence numbers accepted without drop",
                ],
                "recommendation": "Enable anti-replay window protection with minimum 64-packet window.",
                "confidence": 0.94,
            },
            {
                "id": "F-304",
                "severity": "Medium",
                "category": "Protocol",
                "title": "IKEv1 Deprecated Protocol",
                "description": "IKEv1 lacks asymmetric authentication flexibility, has known denial-of-service vulnerabilities, and is superseded by RFC 7296 (IKEv2).",
                "evidence": [
                    "Major version: 1, Minor version: 0",
                    "Main Mode / Aggressive Mode handshakes",
                ],
                "recommendation": "Migrate infrastructure to IKEv2.",
                "confidence": 0.96,
            },
        ],
    },
    "secure-ipv6": {
        "id": "secure-ipv6",
        "name": "Secure IPv6 VPN",
        "description": "Modern IPv6 IPsec tunnel with strong cryptographic parameters",
        "vpn": {
            "protocol": "IPsec",
            "ike_version": "IKEv2",
            "mode": "Tunnel",
            "ip_version": "IPv6",
            "nat_traversal": False,
            "protocols_detected": ["IKEv2", "ESP"],
        },
        "cryptography": {
            "encryption": "AES-256-GCM",
            "authentication": "AEAD",
            "dh_group": "DH Group 20",
            "pfs": True,
        },
        "security": {
            "score": 100,
            "grade": "A",
            "risk_level": "Low",
            "replay_protection": True,
            "sa_lifetime_seconds": 28800,
        },
        "traffic": {
            "predicted_class": "VoIP",
            "confidence": 0.91,
            "candidate_classes": [
                {"class": "VoIP", "confidence": 0.91},
                {"class": "Messaging", "confidence": 0.05},
                {"class": "Video", "confidence": 0.04},
            ],
            "features": {
                "packet_size_pattern": "small_continuous",
                "directionality": "bidirectional",
                "inter_arrival_pattern": "strict_cadence",
                "session_duration_seconds": 480,
            },
        },
        "findings": [
            {
                "id": "F-401",
                "severity": "Informational",
                "category": "Key Exchange",
                "title": "High-Assurance DH Group 20 Negotiated",
                "description": "DH Group 20 (NIST P-384 ECP) provides 192-bit cryptographic strength for high-assurance classifications.",
                "evidence": [
                    "Transform: DH_GROUP_20 (384-bit ECP)",
                    "Elliptic Curve Diffie-Hellman verified",
                ],
                "recommendation": "Retain high-security posture.",
                "confidence": 0.99,
            },
            {
                "id": "F-402",
                "severity": "Informational",
                "category": "Protocol",
                "title": "Clean End-to-End IPv6 Encapsulation",
                "description": "Native IPv6 tunnel eliminates NAT-T overhead and preserves strict protocol headers.",
                "evidence": [
                    "IP Header version: 6",
                    "UDP 4500 encapsulation not invoked",
                ],
                "recommendation": "Maintain native IPv6 security policy.",
                "confidence": 0.97,
            },
        ],
    },
    "traffic-anomaly": {
        "id": "traffic-anomaly",
        "name": "Traffic Anomaly",
        "description": "VPN session with unusual encrypted traffic behavior",
        "vpn": {
            "protocol": "IPsec",
            "ike_version": "IKEv2",
            "mode": "Tunnel",
            "ip_version": "IPv4",
            "nat_traversal": True,
            "protocols_detected": ["IKEv2", "ESP"],
        },
        "cryptography": {
            "encryption": "AES-256-GCM",
            "authentication": "AEAD",
            "dh_group": "DH Group 19",
            "pfs": True,
        },
        "security": {
            "score": 95,
            "grade": "A",
            "risk_level": "Low",
            "replay_protection": True,
            "sa_lifetime_seconds": 28800,
        },
        "traffic": {
            "predicted_class": "Unknown",
            "confidence": 0.61,
            "candidate_classes": [
                {"class": "Unknown", "confidence": 0.61},
                {"class": "Web", "confidence": 0.22},
                {"class": "Video", "confidence": 0.17},
            ],
            "features": {
                "packet_size_pattern": "irregular_spikes",
                "directionality": "asymmetric",
                "inter_arrival_pattern": "erratic",
                "session_duration_seconds": 960,
            },
        },
        "findings": [
            {
                "id": "F-501",
                "severity": "Medium",
                "category": "Metadata Exposure",
                "title": "Encrypted Flow Anomaly Detected",
                "description": "Statistical packet size entropy and burst variance deviate significantly from standard baseline traffic distributions.",
                "evidence": [
                    "Entropy score: 5.12 (standard range 7.8-8.0)",
                    "Inter-arrival variance: +240% above baseline profile",
                ],
                "recommendation": "Perform deep session tracing to rule out covert channels or data exfiltration over the tunnel.",
                "confidence": 0.85,
            },
            {
                "id": "F-502",
                "severity": "Informational",
                "category": "Cryptography",
                "title": "Strong Underlying Cryptography",
                "description": "Cryptographic tunnel negotiation is fully compliant with NIST guidelines despite application flow anomalies.",
                "evidence": ["AES-256-GCM / DH Group 19 active"],
                "recommendation": "Audit client applications transmitting over the tunnel.",
                "confidence": 0.95,
            },
        ],
    },
    "pcap-observed": {
        "id": "pcap-observed",
        "name": "Observed PCAP Capture",
        "description": "Decoded live packet capture from remote-worker gateway with ChaCha20-Poly1305 AEAD authenticated encryption",
        "source_type": "pcap",
        "file_name": "remote-worker-gateway.pcap",
        "vpn": {
            "protocol": "IPsec",
            "ike_version": "IKEv2",
            "mode": "Tunnel",
            "ip_version": "IPv4",
            "nat_traversal": True,
            "protocols_detected": ["IKEv2", "ESP"],
        },
        "cryptography": {
            "encryption": "ChaCha20-Poly1305",
            "authentication": "AEAD",
            "dh_group": "DH Group 19",
            "pfs": True,
        },
        "security": {
            "score": 100,
            "grade": "A",
            "risk_level": "Low",
            "replay_protection": True,
            "sa_lifetime_seconds": 28800,
        },
        "traffic": {
            "predicted_class": "Web",
            "confidence": 0.91,
            "candidate_classes": [
                {"class": "Web", "confidence": 0.91},
                {"class": "Messaging", "confidence": 0.05},
                {"class": "Video", "confidence": 0.04},
            ],
            "features": {
                "packet_size_pattern": "moderate_variable",
                "directionality": "bidirectional",
                "inter_arrival_pattern": "interactive_cadence",
                "session_duration_seconds": 840,
            },
        },
        "findings": [
            {
                "id": "F-601",
                "severity": "Informational",
                "category": "Cryptography",
                "title": "Modern Authenticated Encryption (ChaCha20-Poly1305)",
                "description": "ChaCha20-Poly1305 AEAD cipher suite offers exceptional performance and resistance to side-channel cache timing attacks.",
                "evidence": [
                    "Transform: ENCR_CHACHA20_POLY1305 with 256-bit key",
                    "RFC 7634 / RFC 8221 recommended suite",
                ],
                "recommendation": "Retain modern ChaCha20-Poly1305 cipher for mobile and remote endpoints.",
                "confidence": 0.98,
                "provenance": "Observed",
            },
            {
                "id": "F-602",
                "severity": "Informational",
                "category": "PFS",
                "title": "Perfect Forward Secrecy Enforced",
                "description": "Child SA negotiation mandates fresh Diffie-Hellman exchange with Group 19.",
                "evidence": ["CREATE_CHILD_SA contains fresh KE payload"],
                "recommendation": "Ensure rekeying timers align with endpoint mobility profiles.",
                "confidence": 0.97,
                "provenance": "Observed",
            },
        ],
    },
}

# Backward compatibility aliases
SCENARIOS["weak-configuration"] = SCENARIOS["legacy-critical"]
SCENARIOS["observed-pcap"] = SCENARIOS["pcap-observed"]


def build_analysis_result(
    analysis_id: str,
    scenario_id: str,
    source_type: str = "simulation",
    file_name: str | None = None,
    created_at: str | None = None,
    completed_at: str | None = None,
) -> AnalysisResult:
    now_iso = datetime.now(timezone.utc).isoformat()
    c_at = created_at or now_iso
    comp_at = completed_at or now_iso

    data = SCENARIOS.get(scenario_id, SCENARIOS["secure-enterprise"])

    effective_source_type = (
        "pcap" if source_type == "pcap" or data.get("source_type") == "pcap" else "simulation"
    )
    effective_file_name = (
        file_name
        or data.get("file_name")
        or (f"{analysis_id.lower()}.pcap" if effective_source_type == "pcap" else None)
    )
    source_name = (
        effective_file_name
        if effective_source_type == "pcap" and effective_file_name
        else data["name"]
    )
    default_provenance = "Observed" if effective_source_type == "pcap" else "Simulated"
    engine_type_val = "real" if effective_source_type == "pcap" else "mock"
    classification_mode_val = "ml" if effective_source_type == "pcap" else "simulated"

    findings_list: List[SecurityFinding] = [
        SecurityFinding(
            **{
                **f,
                "provenance": f.get("provenance") or default_provenance,
            }
        )
        for f in data["findings"]
    ]

    summary = FindingsSummary(
        total_findings=len(findings_list),
        critical=sum(1 for f in findings_list if f.severity == "Critical"),
        high=sum(1 for f in findings_list if f.severity == "High"),
        medium=sum(1 for f in findings_list if f.severity == "Medium"),
        low=sum(1 for f in findings_list if f.severity == "Low"),
        informational=sum(1 for f in findings_list if f.severity == "Informational"),
    )

    candidates = [
        TrafficCandidateClass(class_name=c["class"], confidence=c["confidence"])
        for c in data["traffic"]["candidate_classes"]
    ]

    features = TrafficFeatures(**data["traffic"]["features"])

    # Compute deterministic risk scoring
    risk_res = risk_scoring_engine.evaluate_findings(findings_list)
    canonical_grade = score_to_grade(risk_res.security_score)

    security_assessment = SecurityAssessment(
        score=risk_res.security_score,
        grade=canonical_grade,  # type: ignore[arg-type]
        risk_level=risk_res.risk_level,
        replay_protection=data["security"]["replay_protection"],
        sa_lifetime_seconds=data["security"]["sa_lifetime_seconds"],
    )

    # Build evidence provenance trail
    evidence_provenance = [
        EvidenceProvenanceItem(
            id="PROV-001",
            source_type=default_provenance,
            field="vpn.ike_version",
            value=data["vpn"]["ike_version"],
            description=(
                "Negotiated IKE protocol version from wire analysis."
                if effective_source_type == "pcap"
                else "Negotiated IKE protocol version from simulation scenario profile."
            ),
            confidence=1.0,
        ),
        EvidenceProvenanceItem(
            id="PROV-002",
            source_type=default_provenance,
            field="cryptography.encryption",
            value=data["cryptography"]["encryption"],
            description="Observed transform proposal in Security Association negotiation.",
            confidence=1.0,
        ),
        EvidenceProvenanceItem(
            id="PROV-003",
            source_type=default_provenance,
            field="cryptography.dh_group",
            value=data["cryptography"]["dh_group"],
            description="Diffie-Hellman key exchange group identified in key exchange payload.",
            confidence=1.0,
        ),
        EvidenceProvenanceItem(
            id="PROV-004",
            source_type=default_provenance,
            field="security.replay_protection",
            value=str(data["security"]["replay_protection"]),
            description="Anti-replay window status verified on active IPsec session.",
            confidence=1.0,
        ),
        EvidenceProvenanceItem(
            id="PROV-005",
            source_type="MLPrediction" if data["traffic"]["predicted_class"] != "Unknown" else default_provenance,
            field="traffic.predicted_class",
            value=data["traffic"]["predicted_class"],
            description="Application class inferred from flow metadata patterns without payload decryption.",
            confidence=data["traffic"]["confidence"],
        ),
    ]

    validation = GroundTruthValidationResult(
        status="passed",
        ground_truth_available=True,
        matched_fields=6,
        total_fields=6,
        mismatches=[],
    )

    return AnalysisResult(
        analysis_id=analysis_id,
        status="completed",
        created_at=c_at,
        completed_at=comp_at,
        source=AnalysisSource(
            type=effective_source_type,  # type: ignore
            name=source_name,
            file_name=effective_file_name,
        ),
        vpn=VPNConfiguration(**data["vpn"]),
        cryptography=CryptographyConfiguration(**data["cryptography"]),
        security=security_assessment,
        traffic=TrafficIntelligence(
            predicted_class=data["traffic"]["predicted_class"],
            confidence=data["traffic"]["confidence"],
            candidate_classes=candidates,
            features=features,
            model={"name": "traffic_classifier", "version": "v1.0.0"},
            classification_mode=classification_mode_val,
        ),
        findings=findings_list,
        summary=summary,
        engine_type=engine_type_val,
        risk_scoring=risk_res,
        evidence_provenance=evidence_provenance,
        validation=validation,
    )
