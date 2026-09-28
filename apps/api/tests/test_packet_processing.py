"""Unit tests for packet normalization and feature extraction."""

import pytest
import os
from app.packet.tshark import run_tshark_json
from app.packet.normalizer import normalize_tshark_packets
from app.packet.extractor import ProtocolFeatureExtractor


@pytest.mark.asyncio
async def test_normalization_and_extraction_modern_ikev2():
    """Verify that modern IKEv2 capture is normalized and parameters correctly extracted."""
    pcap_path = os.path.abspath("../../datasets/scenarios/pcaps/modern-ikev2-aes256gcm.pcap")
    raw_packets = await run_tshark_json(pcap_path=pcap_path)
    normalized = normalize_tshark_packets(raw_packets)

    assert len(normalized) == 5
    assert normalized[0].ipsec_protocol == "IKE"
    assert normalized[0].ike_version == "IKEv2"
    assert normalized[2].ipsec_protocol == "ESP"
    assert normalized[2].spi == "0x0a1b2c3d"

    extractor = ProtocolFeatureExtractor()
    result = extractor.extract(
        packets=normalized,
        file_name="modern-ikev2-aes256gcm.pcap",
        file_size_bytes=1024,
    )

    assert result.vpn.ike_version == "IKEv2"
    assert "AES-256-GCM" in result.cryptography.encryption
    assert "DH Group 19" in result.cryptography.dh_group
    assert result.cryptography.pfs is True
    assert result.observations.esp_sessions > 0
    assert len(result.evidence) >= 3


@pytest.mark.asyncio
async def test_normalization_and_extraction_legacy_ikev1():
    """Verify that legacy IKEv1 capture extracts 3DES, SHA1, and DH2."""
    pcap_path = os.path.abspath("../../datasets/scenarios/pcaps/legacy-ikev1-3des-sha1.pcap")
    raw_packets = await run_tshark_json(pcap_path=pcap_path)
    normalized = normalize_tshark_packets(raw_packets)

    assert len(normalized) == 3
    assert normalized[0].ipsec_protocol == "IKE"
    assert normalized[0].ike_version == "IKEv1"

    extractor = ProtocolFeatureExtractor()
    result = extractor.extract(
        packets=normalized,
        file_name="legacy-ikev1-3des-sha1.pcap",
        file_size_bytes=800,
    )

    assert result.vpn.ike_version == "IKEv1"
    assert "3DES" in result.cryptography.encryption
    assert "SHA1" in result.cryptography.authentication
    assert "DH Group 2" in result.cryptography.dh_group
    assert result.raw_parameters.get("sa_lifetimes") == [(86400, 1)]


@pytest.mark.asyncio
async def test_nat_traversal_detection():
    """Verify UDP 4500 encapsulated traffic is recognized as NAT-Traversal."""
    pcap_path = os.path.abspath("../../datasets/scenarios/pcaps/natt-esp-traffic.pcap")
    raw_packets = await run_tshark_json(pcap_path=pcap_path)
    normalized = normalize_tshark_packets(raw_packets)

    extractor = ProtocolFeatureExtractor()
    result = extractor.extract(
        packets=normalized,
        file_name="natt-esp-traffic.pcap",
        file_size_bytes=500,
    )

    assert result.vpn.nat_traversal is True
    assert "NAT-T" in result.vpn.protocols_detected
