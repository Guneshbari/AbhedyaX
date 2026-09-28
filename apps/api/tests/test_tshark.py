"""Unit tests for TShark availability, process execution, and error handling."""

import pytest
import os
from app.packet.tshark import (
    is_tshark_available,
    get_tshark_version,
    run_tshark_json,
    TSharkExecutionError,
    TSharkNotFoundError,
)


def test_tshark_availability():
    """Verify that TShark is discoverable in PATH and reports a valid version."""
    available = is_tshark_available()
    assert available is True

    version = get_tshark_version()
    assert version is not None
    assert "TShark" in version


@pytest.mark.asyncio
async def test_run_tshark_missing_file():
    """Verify that attempting to analyze a non-existent file raises a clear TSharkExecutionError."""
    with pytest.raises(TSharkExecutionError) as exc_info:
        await run_tshark_json("/tmp/definitely_not_a_real_file_12345.pcap")
    assert "does not exist" in str(exc_info.value)


@pytest.mark.asyncio
async def test_run_tshark_on_real_capture():
    """Verify structured JSON output on a synthesized benchmark capture."""
    pcap_path = os.path.abspath("../../datasets/scenarios/pcaps/modern-ikev2-aes256gcm.pcap")
    assert os.path.isfile(pcap_path)

    packets = await run_tshark_json(pcap_path=pcap_path)
    assert isinstance(packets, list)
    assert len(packets) == 5

    # Check first packet layers
    first_pkt = packets[0]
    assert "_source" in first_pkt
    assert "layers" in first_pkt["_source"]
    layers = first_pkt["_source"]["layers"]
    assert "frame" in layers
    assert "ip" in layers
    assert "ike" in layers
