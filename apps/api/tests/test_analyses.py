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

        # 2. Poll status until completed
        for _ in range(80):
            status_resp = await client.get(f"/api/v1/analyses/{analysis_id}/status")
            assert status_resp.status_code == 200
            status_data = status_resp.json()
            if status_data["status"] == "completed":
                break
            await asyncio.sleep(0.05)

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


@pytest.mark.asyncio
async def test_get_active_ml_model():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/analyses/ml/model")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ["ready", "unloaded"]
        if data["status"] == "ready":
            assert data["model_name"] == "traffic_classifier"
            assert data["model_version"] == "v1.0.0"
            assert len(data["classes"]) == 6
            assert data["feature_count"] == 28
            assert "metrics" in data
            assert "test_macro_f1" in data["metrics"]
            assert data["metrics"]["test_macro_f1"] > 0


@pytest.mark.asyncio
async def test_analysis_report_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create and complete an analysis
        create_resp = await client.post(
            "/api/v1/analyses",
            json={
                "source_type": "simulation",
                "scenario_id": "secure-enterprise",
            },
        )
        assert create_resp.status_code == 201
        analysis_id = create_resp.json()["analysis_id"]

        for _ in range(80):
            st = await client.get(f"/api/v1/analyses/{analysis_id}/status")
            if st.json()["status"] == "completed":
                break
            await asyncio.sleep(0.05)

        # 1. Executive HTML report
        exec_resp = await client.get(f"/api/v1/analyses/{analysis_id}/report/executive")
        assert exec_resp.status_code == 200
        assert "text/html" in exec_resp.headers["content-type"]
        assert "<!DOCTYPE html>" in exec_resp.text
        assert "Executive VPN Security Assessment" in exec_resp.text
        assert analysis_id in exec_resp.text

        # 2. Technical HTML report
        tech_resp = await client.get(f"/api/v1/analyses/{analysis_id}/report/technical")
        assert tech_resp.status_code == 200
        assert "text/html" in tech_resp.headers["content-type"]
        assert "<!DOCTYPE html>" in tech_resp.text
        assert "Technical IPsec Protocol & Traffic Audit" in tech_resp.text
        assert analysis_id in tech_resp.text

        # 3. JSON Export
        json_resp = await client.get(f"/api/v1/analyses/{analysis_id}/report/json")
        assert json_resp.status_code == 200
        assert "application/json" in json_resp.headers["content-type"]
        assert f"abhedyax_analysis_{analysis_id}.json" in json_resp.headers.get("content-disposition", "")
        json_data = json_resp.json()
        assert json_data["analysis_id"] == analysis_id
        assert "risk_scoring" in json_data
        assert "evidence_provenance" in json_data


@pytest.mark.asyncio
async def test_report_endpoints_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r1 = await client.get("/api/v1/analyses/AX-NONEXISTENT/report/executive")
        assert r1.status_code == 404

        r2 = await client.get("/api/v1/analyses/AX-NONEXISTENT/report/technical")
        assert r2.status_code == 404

        r3 = await client.get("/api/v1/analyses/AX-NONEXISTENT/report/json")
        assert r3.status_code == 404

