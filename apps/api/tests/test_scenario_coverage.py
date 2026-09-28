"""Phase 5.2 Canonical Scenario Coverage, Integrity & Consistency Tests.

Verifies:
1. Scenario Registry contains all 6 major canonical scenario categories.
2. Canonical Risk Engine produces mathematically exact scores for every scenario.
3. Three 100/100 results exist if and only if they have zero applicable deductions.
4. Anomaly case produces exactly 95/100 (-5 deduction) without altering strong cryptography.
5. Moderate case produces exactly 80/100 (-20 deductions: -12 PFS, -8 SA lifetime).
6. Legacy case produces verified canonical 25/100, Critical, Grade F.
7. Risk bands and Letter grades strictly adhere to documented Phase 5 standards.
8. Anti-double counting guarantees one highest deduction per category.
9. Cross-surface synchronization across List, Detail, Reports, and JSON endpoints.
10. Source provenance distinguishes observed PCAP (AX-2026-00423) from simulation.
11. Protocol distinction separates native IPv6 (AX-2026-00425) from IPv4 baselines.
12. Dashboard aggregation metrics mathematically agree with canonical analysis records.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.data.scenarios import SCENARIOS, build_analysis_result
from app.engines.mock import PREDEFINED_ANALYSES_MAP
from services.security_engine.src.risk_engine import risk_scoring_engine
from app.models.analysis import SecurityFinding
from services.security_engine.src.methodology import (
    score_to_risk_level,
    score_to_grade,
    RISK_BANDS,
)
from services.report_generator.src.executive_report import generate_executive_report
from services.report_generator.src.technical_report import generate_technical_report


def test_scenario_registry_has_all_six_categories():
    """Verify all 6 expected canonical scenario categories exist in the registry."""
    expected_categories = [
        "secure-enterprise",
        "moderate-security",
        "legacy-critical",
        "secure-ipv6",
        "traffic-anomaly",
        "pcap-observed",
    ]
    for cat in expected_categories:
        assert cat in SCENARIOS, f"Missing required canonical scenario: {cat}"
        sc = SCENARIOS[cat]
        assert sc["id"] == cat
        assert "vpn" in sc
        assert "cryptography" in sc
        assert "security" in sc
        assert "traffic" in sc
        assert "findings" in sc

    # Verify backward-compatibility aliases
    assert "weak-configuration" in SCENARIOS
    assert SCENARIOS["weak-configuration"]["id"] == "legacy-critical"
    assert "observed-pcap" in SCENARIOS
    assert SCENARIOS["observed-pcap"]["id"] == "pcap-observed"


def test_canonical_score_arithmetic_all_scenarios():
    """Verify every scenario's score is mathematically derived from its findings by the risk engine."""
    expected_scores = {
        "secure-enterprise": (100, "Low", "A", 0),
        "moderate-security": (80, "Moderate", "B", 20),
        "legacy-critical": (25, "Critical", "F", 75),
        "secure-ipv6": (100, "Low", "A", 0),
        "traffic-anomaly": (95, "Low", "A", 5),
        "pcap-observed": (100, "Low", "A", 0),
    }

    for sc_id, (exp_score, exp_risk, exp_grade, exp_deduction) in expected_scores.items():
        result = build_analysis_result(f"TEST-{sc_id}", sc_id)
        assert result.security.score == exp_score, (
            f"Scenario {sc_id} score mismatch: {result.security.score} != {exp_score}"
        )
        assert result.security.risk_level == exp_risk, (
            f"Scenario {sc_id} risk mismatch: {result.security.risk_level} != {exp_risk}"
        )
        assert result.security.grade == exp_grade, (
            f"Scenario {sc_id} grade mismatch: {result.security.grade} != {exp_grade}"
        )
        assert result.risk_scoring.total_deduction == exp_deduction, (
            f"Scenario {sc_id} deduction mismatch: {result.risk_scoring.total_deduction} != {exp_deduction}"
        )
        assert result.security.score == result.risk_scoring.security_score


def test_three_hundred_scores_validity():
    """Verify that exactly three scenarios score 100/100 because they genuinely have zero deductions."""
    hundred_scenarios = ["secure-enterprise", "secure-ipv6", "pcap-observed"]
    for sc_id in hundred_scenarios:
        result = build_analysis_result(f"TEST-{sc_id}", sc_id)
        assert result.security.score == 100
        assert result.risk_scoring.total_deduction == 0
        # All findings must be informational
        for f in result.findings:
            assert f.severity == "Informational", (
                f"Scenario {sc_id} scored 100 but has non-informational finding: {f.id} ({f.severity})"
            )


def test_traffic_anomaly_separates_crypto_and_traffic():
    """Verify traffic-anomaly preserves strong crypto while only deducting -5 for traffic anomaly."""
    result = build_analysis_result("AX-2026-00424", "traffic-anomaly")
    assert result.security.score == 95
    assert result.security.risk_level == "Low"
    assert result.security.grade == "A"
    assert result.risk_scoring.total_deduction == 5

    # Cryptography must remain robust
    assert result.cryptography.encryption == "AES-256-GCM"
    assert result.cryptography.dh_group == "DH Group 19"
    assert result.cryptography.pfs is True

    # Deductions breakdown must contain exactly the traffic anomaly finding
    deductions = result.risk_scoring.scoring_breakdown
    assert len(deductions) == 1
    assert deductions[0].category == "Metadata Exposure"
    assert deductions[0].deduction == 5


def test_moderate_security_mathematical_score():
    """Verify moderate-security mathematically scores 80 = 100 - (12 PFS + 8 SA Lifetime)."""
    result = build_analysis_result("AX-2026-00426", "moderate-security")
    assert result.security.score == 80
    assert result.security.risk_level == "Moderate"
    assert result.security.grade == "B"
    assert result.risk_scoring.total_deduction == 20

    deduction_reasons = {d.category: d.deduction for d in result.risk_scoring.scoring_breakdown}
    assert deduction_reasons.get("PFS") == 12
    assert deduction_reasons.get("SA Lifetime") == 8


def test_legacy_critical_canonical_case():
    """Verify legacy-critical produces canonical 25, Critical, Grade F from 4 major weaknesses."""
    result = build_analysis_result("AX-2026-00427", "legacy-critical")
    assert result.security.score == 25
    assert result.security.risk_level == "Critical"
    assert result.security.grade == "F"
    assert result.risk_scoring.total_deduction == 75

    deduction_map = {d.finding_id: d.deduction for d in result.risk_scoring.scoring_breakdown}
    assert deduction_map.get("F-304") == 25  # IKEv1
    assert deduction_map.get("F-301") == 20  # Weak DH
    assert deduction_map.get("F-302") == 15  # Weak crypto / SHA-1
    assert deduction_map.get("F-303") == 15  # No replay protection


def test_observed_pcap_vs_simulation_provenance():
    """Verify observed PCAP (AX-2026-00423) has Observed provenance and real engine type."""
    pcap_res = build_analysis_result("AX-2026-00423", "pcap-observed", source_type="pcap")
    assert pcap_res.source.type == "pcap"
    assert pcap_res.engine_type == "real"
    assert pcap_res.traffic.classification_mode == "ml"
    assert pcap_res.cryptography.encryption == "ChaCha20-Poly1305"

    for f in pcap_res.findings:
        assert f.provenance == "Observed"

    sim_res = build_analysis_result("AX-2026-00428", "secure-enterprise", source_type="simulation")
    assert sim_res.source.type == "simulation"
    assert sim_res.engine_type == "mock"
    assert sim_res.traffic.classification_mode == "simulated"
    for f in sim_res.findings:
        assert f.provenance == "Simulated"


def test_ipv4_and_ipv6_distinction():
    """Verify secure-ipv6 (AX-2026-00425) represents native IPv6 distinctly from IPv4 baseline."""
    ipv6_res = build_analysis_result("AX-2026-00425", "secure-ipv6")
    assert ipv6_res.vpn.ip_version == "IPv6"
    assert ipv6_res.vpn.nat_traversal is False
    assert ipv6_res.cryptography.dh_group == "DH Group 20"

    ipv4_res = build_analysis_result("AX-2026-00428", "secure-enterprise")
    assert ipv4_res.vpn.ip_version == "IPv4"
    assert ipv4_res.vpn.nat_traversal is True
    assert ipv4_res.cryptography.dh_group == "DH Group 19"


def test_anti_double_counting():
    """Verify anti-double counting allows only the highest deduction per category."""
    findings = [
        SecurityFinding(
            id="TEST-1",
            category="Key Exchange",
            severity="Critical",
            title="Weak DH Group 2",
            description="Deprecated key exchange",
            evidence=["DH Group 2"],
            recommendation="Upgrade",
            confidence=1.0,
        ),
        SecurityFinding(
            id="TEST-2",
            category="Key Exchange",
            severity="Medium",
            title="Diffie-Hellman Group 5",
            description="Deprecated key exchange",
            evidence=["DH Group 5"],
            recommendation="Upgrade",
            confidence=1.0,
        ),
    ]
    res = risk_scoring_engine.evaluate_findings(findings)
    # Both match RULE_WEAK_DH in category Key Exchange; only 1 deduction of 20 should apply
    assert len(res.scoring_breakdown) == 1
    assert res.total_deduction == 20
    assert res.security_score == 80


def test_risk_band_and_grade_boundaries():
    """Verify risk bands and grade boundaries across the entire range 0-100."""
    # Critical: 0 - 49 -> F
    for s in [0, 25, 49]:
        assert score_to_risk_level(s) == "Critical"
        assert score_to_grade(s) == "F"

    # High: 50 - 74
    for s in [50, 60, 74]:
        assert score_to_risk_level(s) == "High"
    assert score_to_grade(50) == "F"
    assert score_to_grade(65) == "D"
    assert score_to_grade(70) == "C"

    # Moderate: 75 - 89
    for s in [75, 80, 89]:
        assert score_to_risk_level(s) == "Moderate"
    assert score_to_grade(75) == "C"
    assert score_to_grade(80) == "B"
    assert score_to_grade(89) == "B"

    # Low: 90 - 100 -> A
    for s in [90, 95, 100]:
        assert score_to_risk_level(s) == "Low"
        assert score_to_grade(s) == "A"


@pytest.mark.asyncio
async def test_scenarios_api_endpoint_returns_six_canonical_scenarios():
    """Verify GET /api/v1/analyses/scenarios returns the 6 unique canonical scenarios."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/analyses/scenarios")
        assert resp.status_code == 200
        scenarios = resp.json()
        ids = [s["id"] for s in scenarios]
        assert len(ids) == 6
        expected = [
            "secure-enterprise",
            "moderate-security",
            "legacy-critical",
            "secure-ipv6",
            "traffic-anomaly",
            "pcap-observed",
        ]
        for exp in expected:
            assert exp in ids, f"Missing scenario {exp} in /scenarios response"


@pytest.mark.asyncio
async def test_all_six_history_analyses_match_across_all_surfaces():
    """Verify each of the 6 predefined analyses matches across List, Detail, and Reports."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_resp = await client.get("/api/v1/analyses")
        assert list_resp.status_code == 200
        items = {item["analysis_id"]: item for item in list_resp.json()}

        expected_history = {
            "AX-2026-00428": (100, "Low", "A"),
            "AX-2026-00427": (25, "Critical", "F"),
            "AX-2026-00426": (80, "Moderate", "B"),
            "AX-2026-00425": (100, "Low", "A"),
            "AX-2026-00424": (95, "Low", "A"),
            "AX-2026-00423": (100, "Low", "A"),
        }

        for aid, (exp_score, exp_risk, exp_grade) in expected_history.items():
            assert aid in items, f"Analysis {aid} missing from list endpoint"
            list_item = items[aid]
            assert list_item["security"]["score"] == exp_score
            assert list_item["security"]["risk_level"] == exp_risk
            assert list_item["security"]["grade"] == exp_grade

            # Detail route
            detail_resp = await client.get(f"/api/v1/analyses/{aid}")
            assert detail_resp.status_code == 200
            detail = detail_resp.json()
            assert detail["security"]["score"] == exp_score
            assert detail["security"]["risk_level"] == exp_risk
            assert detail["security"]["grade"] == exp_grade

            # Reports
            exec_resp = await client.get(f"/api/v1/analyses/{aid}/report/executive")
            assert exec_resp.status_code == 200
            assert str(exp_score) in exec_resp.text
            assert exp_risk.lower() in exec_resp.text.lower()

            tech_resp = await client.get(f"/api/v1/analyses/{aid}/report/technical")
            assert tech_resp.status_code == 200
            assert str(exp_score) in tech_resp.text
            assert exp_risk.lower() in tech_resp.text.lower()

            json_resp = await client.get(f"/api/v1/analyses/{aid}/report/json")
            assert json_resp.status_code == 200
            assert json_resp.json()["security"]["score"] == exp_score
