"""Unit tests for deterministic security rules and explainable risk scoring."""

import pytest
import os
from app.packet.tshark import run_tshark_json
from app.packet.normalizer import normalize_tshark_packets
from app.packet.extractor import ProtocolFeatureExtractor
from app.security.rules import evaluate_security_rules
from app.security.scoring import compute_security_score
from app.security.findings import summarize_findings


@pytest.mark.asyncio
async def test_modern_suite_security_assessment():
    """Verify modern suite scores high (Grade A / Low Risk) with 0 critical findings."""
    pcap_path = os.path.abspath("../../datasets/scenarios/pcaps/modern-ikev2-aes256gcm.pcap")
    raw_packets = await run_tshark_json(pcap_path=pcap_path)
    normalized = normalize_tshark_packets(raw_packets)

    extractor = ProtocolFeatureExtractor()
    extraction = extractor.extract(
        packets=normalized,
        file_name="modern-ikev2-aes256gcm.pcap",
        file_size_bytes=1024,
    )

    findings = evaluate_security_rules(extraction)
    summary = summarize_findings(findings)
    assessment, factors = compute_security_score(extraction)

    assert assessment.score >= 90
    assert assessment.grade == "A"
    assert assessment.risk_level == "Low"
    assert summary.critical == 0
    assert summary.high == 0
    assert len(factors) == 7


@pytest.mark.asyncio
async def test_legacy_suite_security_assessment():
    """Verify legacy 3DES/SHA1/DH2/IKEv1 triggers critical findings and Grade F."""
    pcap_path = os.path.abspath("../../datasets/scenarios/pcaps/legacy-ikev1-3des-sha1.pcap")
    raw_packets = await run_tshark_json(pcap_path=pcap_path)
    normalized = normalize_tshark_packets(raw_packets)

    extractor = ProtocolFeatureExtractor()
    extraction = extractor.extract(
        packets=normalized,
        file_name="legacy-ikev1-3des-sha1.pcap",
        file_size_bytes=800,
    )

    findings = evaluate_security_rules(extraction)
    finding_ids = [f.id for f in findings]

    assert "IKE-001" in finding_ids
    assert "CRYPTO-001" in finding_ids
    assert "DH-001" in finding_ids
    assert "AUTH-002" in finding_ids
    assert "LIFE-001" in finding_ids

    assessment, factors = compute_security_score(extraction)
    assert assessment.score < 50
    assert assessment.grade == "F"
    assert assessment.risk_level == "Critical"
