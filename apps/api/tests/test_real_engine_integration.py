"""Integration tests for RealAnalysisEngine and PCAP upload endpoint."""

import pytest
import asyncio
import os
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.engines.real import RealAnalysisEngine
from app.models.analysis import CreateAnalysisRequest


@pytest.mark.asyncio
async def test_real_engine_standalone_pipeline():
    """Verify that RealAnalysisEngine independently runs the pipeline to completion."""
    pcap_path = os.path.abspath("../../datasets/scenarios/pcaps/modern-ikev2-aes256gcm.pcap")
    engine = RealAnalysisEngine(step_delay=0.01)

    resp = await engine.create_analysis(
        source_type="pcap",
        file_name="modern-ikev2-aes256gcm.pcap",
        pcap_path=pcap_path,
    )

    aid = resp.analysis_id
    assert "REAL" in aid

    # Poll until completed
    for _ in range(50):
        status_resp = await engine.get_status(aid)
        assert status_resp is not None
        if status_resp.status == "completed":
            break
        await asyncio.sleep(0.05)

    assert status_resp.status == "completed"
    assert status_resp.progress == 100

    result = await engine.get_result(aid)
    assert result is not None
    assert result.engine_type == "real"
    assert result.capture_metadata is not None
    assert result.capture_metadata.packet_count == 5
    assert len(result.evidence) > 0


@pytest.mark.asyncio
async def test_pcap_upload_endpoint():
    """Verify POST /api/v1/analyses/upload multipart endpoint."""
    pcap_path = os.path.abspath("../../datasets/scenarios/pcaps/modern-ikev2-aes256gcm.pcap")
    with open(pcap_path, "rb") as f:
        file_bytes = f.read()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Environment status check
        env_resp = await client.get("/api/v1/analyses/environment")
        assert env_resp.status_code == 200
        env_data = env_resp.json()
        assert env_data["tshark_available"] is True

        # 2. Upload PCAP
        files = {"file": ("test_upload.pcap", file_bytes, "application/vnd.tcpdump.pcap")}
        upload_resp = await client.post("/api/v1/analyses/upload", files=files)
        assert upload_resp.status_code == 201
        upload_data = upload_resp.json()
        aid = upload_data["analysis_id"]

        # 3. Poll status
        for _ in range(50):
            st_resp = await client.get(f"/api/v1/analyses/{aid}/status")
            assert st_resp.status_code == 200
            st_data = st_resp.json()
            if st_data["status"] == "completed":
                break
            await asyncio.sleep(0.05)

        assert st_data["status"] == "completed"

        # 4. Fetch final result
        res_resp = await client.get(f"/api/v1/analyses/{aid}")
        assert res_resp.status_code == 200
        res_data = res_resp.json()
        assert res_data["analysis_id"] == aid
        assert res_data["engine_type"] == "real"
        assert res_data["capture_metadata"]["file_name"] == "test_upload.pcap"
        assert res_data["capture_metadata"]["packet_count"] == 5
