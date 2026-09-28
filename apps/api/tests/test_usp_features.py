"""Phase 6 USP Layer Unit and Integration Tests.

Validates:
1. Security Twin creation, alignment evaluation, and provenance preservation.
2. Configuration Drift detection, change classification, and canonical score delta.
3. Auditable Security Reasoning chain integrity and evidence linking.
4. Encrypted Traffic Metadata Exposure calculation without payload decryption.
5. Posture Timeline longitudinal metrics and transition detection.
6. REST API endpoints for all USP features.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.data.scenarios import build_analysis_result
from services.security_twin.src.builder import build_security_twin
from services.security_twin.src.drift_engine import compute_configuration_drift
from services.security_twin.src.comparator import compare_analyses, CURATED_DEMO_COMPARISONS
from services.security_twin.src.impact_mapper import build_auditable_reasoning
from services.security_twin.src.metadata_engine import evaluate_metadata_exposure
from services.security_twin.src.posture_engine import build_posture_timeline


def test_security_twin_secure_baseline():
    """Verify Security Twin for secure enterprise baseline (AX-2026-00428)."""
    analysis = build_analysis_result("AX-2026-00428", "secure-enterprise")
    twin = build_security_twin(analysis)

    assert twin.analysis_id == "AX-2026-00428"
    assert twin.twin_id == "TWIN-AX-2026-00428"
    assert twin.mode == "simulation"
    assert twin.expected_state.ike_version == "IKEv2"
    assert twin.expected_state.encryption == "AES-256-GCM"
    assert twin.expected_state.pfs is True
    assert twin.expected_state.replay_protection is True

    assert twin.observed_state.ike_version == "IKEv2"
    assert twin.observed_state.encryption == "AES-256-GCM"
    assert twin.observed_state.pfs is True

    assert twin.alignment.overall == "aligned"
    assert twin.alignment.matched_count == 9
    assert twin.alignment.mismatched_count == 0

    assert twin.security_impact.risk_score == 100
    assert twin.security_impact.risk == "Low"
    assert twin.security_impact.grade == "A"
    assert len(twin.security_impact.affected_properties) == 0

    assert twin.provenance.expected_state == "GroundTruth"
    assert twin.provenance.observed_state == "Simulated"


def test_security_twin_legacy_drifted():
    """Verify Security Twin detects severe configuration drift on legacy scenario."""
    analysis = build_analysis_result("AX-2026-00427", "legacy-critical")
    twin = build_security_twin(analysis)

    assert twin.alignment.overall == "drifted"
    assert twin.alignment.mismatched_count > 0

    # Verify mismatches on deprecated parameters
    mismatched_props = [item.property for item in twin.alignment.items if item.status == "mismatch"]
    assert "IKE Version" in mismatched_props
    assert "Diffie-Hellman Group" in mismatched_props
    assert "Perfect Forward Secrecy" in mismatched_props
    assert "Replay Protection" in mismatched_props

    # Canonical score must match exactly
    assert twin.security_impact.risk_score == 25
    assert twin.security_impact.risk == "Critical"
    assert twin.security_impact.grade == "F"


def test_security_twin_observed_pcap_provenance():
    """Verify observed PCAP (AX-2026-00423) has Observed mode and provenance."""
    analysis = build_analysis_result("AX-2026-00423", "pcap-observed", source_type="pcap")
    twin = build_security_twin(analysis)

    assert twin.mode == "observed"
    assert twin.provenance.observed_state == "Observed"
    assert twin.observed_state.encryption == "ChaCha20-Poly1305"
    assert twin.alignment.overall == "aligned"
    assert twin.security_impact.risk_score == 100


def test_drift_secure_to_legacy():
    """Verify drift detection between secure enterprise (100) and legacy critical (25)."""
    baseline = build_analysis_result("AX-2026-00428", "secure-enterprise")
    current = build_analysis_result("AX-2026-00427", "legacy-critical")
    drift = compute_configuration_drift(baseline, current)

    assert drift.compatibility.compatible is True
    assert drift.security_impact.baseline_score == 100
    assert drift.security_impact.current_score == 25
    assert drift.security_impact.score_delta == -75
    assert drift.security_impact.baseline_risk == "Low"
    assert drift.security_impact.current_risk == "Critical"

    # Must classify weakened changes
    assert drift.summary.weakened_changes >= 4
    changes_by_prop = {c.property: c for c in drift.changes}

    ike_c = changes_by_prop["IKE Version"]
    assert ike_c.change_type == "weakened"
    assert ike_c.severity == "critical"
    assert ike_c.finding_id == "F-304"

    dh_c = changes_by_prop["DH Group"]
    assert dh_c.change_type == "weakened"
    assert dh_c.severity == "critical"
    assert dh_c.finding_id == "F-301"

    pfs_c = changes_by_prop["PFS"]
    assert pfs_c.change_type == "weakened"
    assert pfs_c.finding_id == "F-201"

    replay_c = changes_by_prop["Replay Protection"]
    assert replay_c.change_type == "weakened"
    assert replay_c.finding_id == "F-303"


def test_drift_secure_to_moderate():
    """Verify drift detection between secure enterprise (100) and moderate security (80)."""
    baseline = build_analysis_result("AX-2026-00428", "secure-enterprise")
    current = build_analysis_result("AX-2026-00426", "moderate-security")
    drift = compute_configuration_drift(baseline, current)

    assert drift.security_impact.score_delta == -20
    assert drift.security_impact.current_score == 80
    assert drift.security_impact.current_risk == "Moderate"

    changes_by_prop = {c.property: c for c in drift.changes}
    assert changes_by_prop["PFS"].change_type == "weakened"
    assert changes_by_prop["PFS"].finding_id == "F-201"
    assert changes_by_prop["SA Lifetime"].change_type == "weakened"
    assert changes_by_prop["SA Lifetime"].finding_id == "F-202"


def test_drift_secure_to_traffic_anomaly():
    """Verify drift detection isolates flow anomaly without falsely blaming cryptography."""
    baseline = build_analysis_result("AX-2026-00428", "secure-enterprise")
    current = build_analysis_result("AX-2026-00424", "traffic-anomaly")
    drift = compute_configuration_drift(baseline, current)

    assert drift.security_impact.score_delta == -5
    assert drift.security_impact.current_score == 95
    assert drift.security_impact.current_risk == "Low"

    # Crypto properties remain unchanged
    changes_by_prop = {c.property: c for c in drift.changes}
    assert changes_by_prop["Encryption"].change_type == "unchanged"
    assert changes_by_prop["DH Group"].change_type == "unchanged"
    assert changes_by_prop["PFS"].change_type == "unchanged"

    # Flow behavior is flagged
    assert "Traffic Flow Behavior" in changes_by_prop
    assert changes_by_prop["Traffic Flow Behavior"].finding_id == "F-501"


def test_drift_ipv4_to_ipv6():
    """Verify IP modernization is classified as changed without security penalty."""
    baseline = build_analysis_result("AX-2026-00428", "secure-enterprise")
    current = build_analysis_result("AX-2026-00425", "secure-ipv6")
    drift = compute_configuration_drift(baseline, current)

    assert drift.security_impact.score_delta == 0
    assert drift.security_impact.current_score == 100
    assert drift.security_impact.current_risk == "Low"

    changes_by_prop = {c.property: c for c in drift.changes}
    assert changes_by_prop["IP Version"].change_type == "changed"
    assert changes_by_prop["IP Version"].severity == "informational"


def test_auditable_reasoning_chains():
    """Verify reasoning chains connect evidence to rule, deduction, and final score."""
    analysis = build_analysis_result("AX-2026-00427", "legacy-critical")
    reasoning = build_auditable_reasoning(analysis)

    assert reasoning.base_score == 100
    assert reasoning.final_score == 25
    assert reasoning.total_deduction == 75
    assert len(reasoning.chains) == 4

    # Verify chain steps
    f304 = next(c for c in reasoning.chains if c.finding_id == "F-304")
    assert f304.risk_rule_id == "RULE_IKEV1_DEPRECATED"
    assert f304.deduction == 25
    assert len(f304.evidence) > 0
    assert f304.recommendation != ""

    f301 = next(c for c in reasoning.chains if c.finding_id == "F-301")
    assert f301.risk_rule_id == "RULE_WEAK_DH"
    assert f301.deduction == 20


def test_metadata_exposure_dimensions():
    """Verify metadata exposure engine computes all 5 dimensions without payload decryption."""
    analysis = build_analysis_result("AX-2026-00428", "secure-enterprise")
    meta = evaluate_metadata_exposure(analysis)

    assert meta.indicator in ["Low", "Moderate", "High"]
    assert meta.score is not None
    assert 0 <= meta.score <= 100
    assert len(meta.dimensions) == 5

    dim_names = [d.name for d in meta.dimensions]
    assert "Timing Observability" in dim_names
    assert "Size Pattern Observability" in dim_names
    assert "Directionality Observability" in dim_names
    assert "Burst Pattern Observability" in dim_names
    assert "Flow Duration Observability" in dim_names

    # Check disclaimer
    assert "does NOT decrypt ESP payloads" in meta.disclaimer


def test_posture_timeline_aggregation():
    """Verify Posture Timeline orders sessions and computes transitions."""
    analyses = [
        build_analysis_result("AX-2026-00428", "secure-enterprise"),
        build_analysis_result("AX-2026-00426", "moderate-security"),
        build_analysis_result("AX-2026-00427", "legacy-critical"),
    ]
    posture = build_posture_timeline(analyses)

    assert posture.total_sessions == 3
    assert len(posture.timeline) == 3
    assert len(posture.transitions) == 2
    assert posture.highest_score == 100
    assert posture.lowest_score == 25


@pytest.mark.asyncio
async def test_usp_rest_api_endpoints():
    """Verify all new Phase 6 REST API endpoints respond correctly."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Security Twin endpoint
        twin_resp = await client.get("/api/v1/analyses/AX-2026-00428/security-twin")
        assert twin_resp.status_code == 200
        twin_data = twin_resp.json()
        assert twin_data["analysis_id"] == "AX-2026-00428"
        assert twin_data["alignment"]["overall"] == "aligned"

        # 2. Analysis Drift endpoint
        drift_resp = await client.get("/api/v1/analyses/AX-2026-00427/drift?baseline_id=AX-2026-00428")
        assert drift_resp.status_code == 200
        drift_data = drift_resp.json()
        assert drift_data["security_impact"]["score_delta"] == -75

        # 3. Metadata Exposure endpoint
        meta_resp = await client.get("/api/v1/analyses/AX-2026-00428/metadata-exposure")
        assert meta_resp.status_code == 200
        meta_data = meta_resp.json()
        assert len(meta_data["dimensions"]) == 5

        # 4. Auditable Reasoning endpoint
        reason_resp = await client.get("/api/v1/analyses/AX-2026-00427/reasoning")
        assert reason_resp.status_code == 200
        reason_data = reason_resp.json()
        assert reason_data["final_score"] == 25
        assert len(reason_data["chains"]) == 4

        # 5. Demo Comparisons endpoint
        presets_resp = await client.get("/api/v1/security-twin/demo-comparisons")
        assert presets_resp.status_code == 200
        presets = presets_resp.json()
        assert len(presets) >= 4

        # 6. Compare POST endpoint
        cmp_resp = await client.post(
            "/api/v1/security-twin/compare",
            json={"baseline_id": "AX-2026-00428", "current_id": "AX-2026-00426"},
        )
        assert cmp_resp.status_code == 200
        cmp_data = cmp_resp.json()
        assert cmp_data["security_impact"]["score_delta"] == -20

        # 7. Posture Timeline endpoint
        posture_resp = await client.get("/api/v1/posture")
        assert posture_resp.status_code == 200
        posture_data = posture_resp.json()
        assert posture_data["total_sessions"] >= 6
