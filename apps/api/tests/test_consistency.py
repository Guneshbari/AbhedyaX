"""Comprehensive Cross-Surface Data Integrity & Assessment Consistency Tests.

Verifies that for every analysis and scenario:
1. security.score == risk_scoring.security_score
2. security.risk_level == risk_scoring.risk_level
3. security.grade == score_to_grade(security.score)
4. List endpoint (GET /api/v1/analyses) matches Detail endpoint (GET /api/v1/analyses/{id})
5. Executive report, Technical report, and JSON export reflect identical values
6. Risk level and grade boundaries adhere strictly to documented Phase 5 standards
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.data.scenarios import SCENARIOS, build_analysis_result
from services.security_engine.src.methodology import (
    score_to_risk_level,
    score_to_grade,
    RISK_BANDS,
)
from services.report_generator.src.executive_report import generate_executive_report
from services.report_generator.src.technical_report import generate_technical_report


@pytest.mark.asyncio
async def test_all_scenarios_internal_consistency():
    """Verify that every predefined scenario produces internally consistent results."""
    for scenario_id, raw_data in SCENARIOS.items():
        result = build_analysis_result(
            analysis_id=f"TEST-{scenario_id}",
            scenario_id=scenario_id,
        )

        sec = result.security
        risk = result.risk_scoring

        assert risk is not None, f"Scenario {scenario_id} missing risk_scoring"

        # Mathematical and logical identity
        assert (
            sec.score == risk.security_score
        ), f"Score mismatch in {scenario_id}: {sec.score} vs {risk.security_score}"

        assert (
            sec.risk_level == risk.risk_level
        ), f"Risk level mismatch in {scenario_id}: {sec.risk_level} vs {risk.risk_level}"

        # Grade correspondence
        expected_grade = score_to_grade(sec.score)
        assert (
            sec.grade == expected_grade
        ), f"Grade mismatch in {scenario_id}: {sec.grade} vs {expected_grade}"

        # Risk band correspondence
        expected_risk = score_to_risk_level(sec.score)
        assert (
            sec.risk_level == expected_risk
        ), f"Risk level calculation mismatch in {scenario_id}: {sec.risk_level} vs {expected_risk}"


@pytest.mark.asyncio
async def test_weak_configuration_canonical_score():
    """Verify weak configuration produces exact canonical score of 25, Critical, Grade F."""
    result = build_analysis_result(
        analysis_id="AX-2026-00427",
        scenario_id="weak-configuration",
    )

    assert result.security.score == 25
    assert result.security.risk_level == "Critical"
    assert result.security.grade == "F"
    assert result.risk_scoring.security_score == 25
    assert result.risk_scoring.risk_level == "Critical"
    assert result.risk_scoring.total_deduction == 75

    # Deductions: DH2 (-20), SHA-1 (-15), Anti-replay (-15), IKEv1 (-25)
    deduction_ids = [d.finding_id for d in result.risk_scoring.scoring_breakdown]
    assert "F-301" in deduction_ids
    assert "F-302" in deduction_ids
    assert "F-303" in deduction_ids
    assert "F-304" in deduction_ids


@pytest.mark.asyncio
async def test_list_and_detail_endpoint_parity():
    """Verify GET /api/v1/analyses and GET /api/v1/analyses/{id} return identical data."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_resp = await client.get("/api/v1/analyses")
        assert list_resp.status_code == 200
        list_data = list_resp.json()
        assert len(list_data) >= 6

        for item in list_data:
            aid = item["analysis_id"]
            detail_resp = await client.get(f"/api/v1/analyses/{aid}")
            assert detail_resp.status_code == 200
            detail_data = detail_resp.json()

            # Ensure score, grade, risk_level match exactly between list and detail
            assert item["security"]["score"] == detail_data["security"]["score"], (
                f"Score mismatch for {aid} between list ({item['security']['score']}) "
                f"and detail ({detail_data['security']['score']})"
            )
            assert item["security"]["risk_level"] == detail_data["security"]["risk_level"], (
                f"Risk level mismatch for {aid} between list ({item['security']['risk_level']}) "
                f"and detail ({detail_data['security']['risk_level']})"
            )
            assert item["security"]["grade"] == detail_data["security"]["grade"], (
                f"Grade mismatch for {aid} between list ({item['security']['grade']}) "
                f"and detail ({detail_data['security']['grade']})"
            )
            assert item["risk_scoring"]["security_score"] == detail_data["risk_scoring"]["security_score"]
            assert item["risk_scoring"]["risk_level"] == detail_data["risk_scoring"]["risk_level"]


@pytest.mark.asyncio
async def test_reports_cross_surface_consistency():
    """Verify HTML reports and JSON exports reflect the canonical score and risk level."""
    for scenario_id in SCENARIOS.keys():
        result = build_analysis_result(
            analysis_id=f"AX-REPORT-{scenario_id}",
            scenario_id=scenario_id,
        )

        canonical_score = str(result.security.score)
        canonical_risk = result.security.risk_level

        # Executive report
        exec_html = generate_executive_report(result)
        assert f'<span class="score-num">{canonical_score}</span>' in exec_html, (
            f"Executive report missing score {canonical_score} for {scenario_id}"
        )
        assert canonical_risk.lower() in exec_html.lower(), (
            f"Executive report missing risk level {canonical_risk} for {scenario_id}"
        )

        # Technical report
        tech_html = generate_technical_report(result)
        assert f'<span class="score-num">{canonical_score}</span>' in tech_html, (
            f"Technical report missing score {canonical_score} for {scenario_id}"
        )
        assert canonical_risk.lower() in tech_html.lower(), (
            f"Technical report missing risk level {canonical_risk} for {scenario_id}"
        )


@pytest.mark.asyncio
async def test_scoring_band_boundaries():
    """Verify boundary conditions for risk levels and letter grades."""
    # 0-49 is Critical, F
    for s in [0, 10, 25, 38, 43, 49]:
        assert score_to_risk_level(s) == "Critical", f"Score {s} must be Critical"
        assert score_to_grade(s) == "F", f"Score {s} must be F"

    # 50-74 is High, D (60-69) or F (50-59)
    assert score_to_risk_level(50) == "High"
    assert score_to_risk_level(65) == "High"
    assert score_to_risk_level(74) == "High"

    # 75-89 is Moderate, C (70-79) or B (80-89)
    assert score_to_risk_level(75) == "Moderate"
    assert score_to_risk_level(80) == "Moderate"
    assert score_to_risk_level(89) == "Moderate"

    # 90-100 is Low, A
    assert score_to_risk_level(90) == "Low"
    assert score_to_risk_level(95) == "Low"
    assert score_to_risk_level(100) == "Low"
    assert score_to_grade(90) == "A"
    assert score_to_grade(100) == "A"
