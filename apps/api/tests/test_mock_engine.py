import pytest
import asyncio
from app.engines.mock import MockAnalysisEngine
from app.data.scenarios import SCENARIOS


@pytest.mark.asyncio
async def test_mock_engine_scenarios_deterministic():
    engine = MockAnalysisEngine(step_delay=0.0)

    for scenario_id, expected in SCENARIOS.items():
        resp = await engine.create_analysis(
            source_type="simulation",
            scenario_id=scenario_id,
        )
        assert resp.analysis_id.startswith("AX-2026-")
        assert resp.status == "queued"

        # Allow background simulation task to finish immediately
        await asyncio.sleep(0.05)

        status = await engine.get_status(resp.analysis_id)
        assert status is not None
        assert status.status == "completed"
        assert status.progress == 100

        result = await engine.get_result(resp.analysis_id)
        assert result is not None
        assert result.security.score == expected["security"]["score"]
        assert result.security.grade == expected["security"]["grade"]
        assert result.security.risk_level == expected["security"]["risk_level"]
        assert result.traffic.predicted_class == expected["traffic"]["predicted_class"]
        assert len(result.findings) == len(expected["findings"])


@pytest.mark.asyncio
async def test_mock_engine_pcap_source():
    engine = MockAnalysisEngine(step_delay=0.0)
    resp = await engine.create_analysis(
        source_type="pcap",
        scenario_id="secure-enterprise",
        file_name="capture-vpn-site-to-site.pcap",
    )
    assert resp.analysis_id.startswith("AX-2026-")

    await asyncio.sleep(0.05)

    result = await engine.get_result(resp.analysis_id)
    assert result is not None
    assert result.source.type == "pcap"
    assert result.source.file_name == "capture-vpn-site-to-site.pcap"
    assert result.source.name == "capture-vpn-site-to-site.pcap"
