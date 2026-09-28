"""Unit tests for AbhedyaX Report Generator subsystem."""

import pytest
from apps.api.app.data.scenarios import build_analysis_result, SCENARIOS
from services.report_generator.src.executive_report import generate_executive_report
from services.report_generator.src.technical_report import generate_technical_report
from services.report_generator.src.template_loader import get_report_css, get_template_env


def test_get_report_css():
    """Verify that report.css is read correctly and has styles."""
    css = get_report_css()
    assert len(css) > 100
    assert ":root" in css
    assert "@media print" in css


def test_template_env_filters():
    """Verify Jinja2 template environment custom filters."""
    env = get_template_env()
    assert "format_duration" in env.filters
    assert "format_bytes" in env.filters
    assert env.filters["format_duration"](125) == "2m 5s"
    assert env.filters["format_bytes"](2048) == "2.0 KB"


def test_generate_executive_report_success():
    """Verify executive report generation from simulated scenario."""
    result = build_analysis_result("test-sim-001", "secure-enterprise")
    html = generate_executive_report(result)

    assert "<!DOCTYPE html>" in html
    assert "AbhedyaX Executive Security Assessment" in html
    assert "test-sim-001" in html
    assert str(result.risk_scoring.security_score) in html
    assert "Executive VPN Security Assessment" in html
    assert "window.print()" in html


def test_generate_technical_report_success():
    """Verify technical report generation from simulated scenario."""
    result = build_analysis_result("test-sim-002", "moderate-security")
    html = generate_technical_report(result)

    assert "<!DOCTYPE html>" in html
    assert "AbhedyaX Technical Audit Report" in html
    assert "test-sim-002" in html
    assert "Technical IPsec Protocol & Traffic Audit" in html
    assert "window.print()" in html
    assert "Auditable Risk Scoring Breakdown" in html


def test_generate_reports_all_scenarios():
    """Verify both reports render without errors for all 5 demo scenarios."""
    for i, s_id in enumerate(SCENARIOS.keys()):
        result = build_analysis_result(f"scenario-test-{i}", s_id)
        exec_html = generate_executive_report(result)
        tech_html = generate_technical_report(result)

        assert f"scenario-test-{i}" in exec_html
        assert f"scenario-test-{i}" in tech_html
        assert len(exec_html) > 1000
        assert len(tech_html) > 1000

