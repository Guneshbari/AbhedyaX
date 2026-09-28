import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.analysis_service import analysis_service
from app.engines.mock import MockAnalysisEngine


@pytest.fixture(autouse=True)
def setup_fast_engine():
    # Use zero delay for instant test execution
    analysis_service.engine = MockAnalysisEngine(step_delay=0.0)


@pytest.mark.asyncio
async def test_list_scenarios():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/analyses/scenarios")
        assert response.status_code == 200
        scenarios = response.json()
        assert len(scenarios) == 5
        scenario_ids = [s["id"] for s in scenarios]
        assert "secure-enterprise" in scenario_ids
        assert "weak-configuration" in scenario_ids


@pytest.mark.asyncio
async def test_create_and_poll_analysis():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create analysis
        create_resp = await client.post(
            "/api/v1/analyses",
            json={
                "source_type": "simulation",
                "scenario_id": "secure-enterprise",
            },
        )
        assert create_resp.status_code == 201
        create_data = create_resp.json()
        analysis_id = create_data["analysis_id"]
        assert analysis_id.startswith("AX-2026-")

        # 2. Wait for completion
        await asyncio.sleep(0.05)

        # 3. Poll status
        status_resp = await client.get(f"/api/v1/analyses/{analysis_id}/status")
        assert status_resp.status_code == 200
        status_data = status_resp.json()
        assert status_data["status"] == "completed"
        assert status_data["progress"] == 100

        # 4. Fetch result
        result_resp = await client.get(f"/api/v1/analyses/{analysis_id}")
        assert result_resp.status_code == 200
        result = result_resp.json()
        assert result["analysis_id"] == analysis_id
        assert result["security"]["score"] == 94
        assert result["security"]["grade"] == "A"
        assert result["traffic"]["predicted_class"] == "Video"
        assert len(result["findings"]) == 3


@pytest.mark.asyncio
async def test_unknown_analysis_returns_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        status_resp = await client.get("/api/v1/analyses/AX-NONEXISTENT/status")
        assert status_resp.status_code == 404

        result_resp = await client.get("/api/v1/analyses/AX-NONEXISTENT")
        assert result_resp.status_code == 404
