"""Integration tests for FastAPI testbed endpoints."""

import asyncio
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_get_testbed_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/testbed/status")
        assert response.status_code == 200
        data = response.json()
        assert "is_linux" in data
        assert "default_mode" in data
        assert data["default_mode"] in ["simulation", "real"]
        assert "message" in data


@pytest.mark.asyncio
async def test_list_testbed_scenarios():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/testbed/scenarios")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5

        scenario_ids = [s["scenario_id"] for s in data]
        assert "ts-secure-ikev2-gcm" in scenario_ids
        assert "ts-legacy-ikev1" in scenario_ids


@pytest.mark.asyncio
async def test_create_and_poll_testbed_run():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        create_resp = await ac.post(
            "/api/v1/testbed/runs",
            json={
                "scenario_id": "ts-secure-ikev2-gcm",
                "traffic_profile": "ICMP",
                "execution_mode": "simulation",
            },
        )
        assert create_resp.status_code == 201
        run_data = create_resp.json()
        run_id = run_data["run_id"]
        assert run_data["scenario_id"] == "ts-secure-ikev2-gcm"
        assert run_data["execution_mode"] == "simulation"

        # Poll until completion (max 10 seconds)
        completed = False
        for _ in range(50):
            await asyncio.sleep(0.2)
            poll_resp = await ac.get(f"/api/v1/testbed/runs/{run_id}")
            assert poll_resp.status_code == 200
            current_run = poll_resp.json()
            if current_run["state"] == "Completed":
                completed = True
                assert current_run["progress"] == 100
                assert current_run["ground_truth"] is not None
                assert current_run["capture_metadata"] is not None
                assert current_run["validation_result"] is not None
                assert current_run["validation_result"]["passed"] is True
                assert current_run["validation_result"]["accuracy"] >= 0.8
                break
            elif current_run["state"] == "Failed":
                pytest.fail(f"Testbed run failed: {current_run.get('error_message')}")

        assert completed, f"Testbed run {run_id} timed out before completing"


@pytest.mark.asyncio
async def test_unknown_scenario_returns_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            "/api/v1/testbed/runs",
            json={"scenario_id": "nonexistent-scenario"},
        )
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_unknown_run_returns_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/testbed/runs/nonexistent-run-id")
        assert resp.status_code == 404
