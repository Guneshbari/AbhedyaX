"""Comparator module for multi-analysis comparisons and curated presets."""

from typing import List, Dict, Any, Optional
from app.models.analysis import AnalysisResult
from services.security_twin.src.drift_engine import compute_configuration_drift
from services.security_twin.src.models.drift import DriftComparisonResult
from services.security_twin.src.models.comparison import DemoComparisonPreset

CURATED_DEMO_COMPARISONS: List[DemoComparisonPreset] = [
    DemoComparisonPreset(
        id="secure-to-moderate",
        name="Secure Enterprise vs Moderate Security",
        description="Demonstrates operational trade-offs: disabling PFS and lengthening SA lifetime causes score drop from 100 to 80 (Grade A -> B).",
        baseline_id="AX-2026-00428",
        current_id="AX-2026-00426",
        expected_score_transition="100 -> 80 (-20 deductions: F-201, F-202)",
        key_takeaway="Exposes how disabling PFS weakens forward secrecy without triggering false alarms on unaffected encryption.",
    ),
    DemoComparisonPreset(
        id="secure-to-legacy",
        name="Secure Enterprise vs Legacy Weak Configuration",
        description="Demonstrates severe protocol obsolescence: IKEv1 downgrade, 1024-bit DH Group 2, SHA-1, and no anti-replay window plummet score from 100 to 25 (Grade A -> F).",
        baseline_id="AX-2026-00428",
        current_id="AX-2026-00427",
        expected_score_transition="100 -> 25 (-75 deductions: F-304, F-301, F-302, F-303)",
        key_takeaway="Exposes compound vulnerabilities across protocol negotiation, key exchange, and session protection.",
    ),
    DemoComparisonPreset(
        id="secure-to-traffic-anomaly",
        name="Secure Enterprise vs Encrypted Traffic Anomaly",
        description="Demonstrates behavioral anomaly isolation: strong cryptography remains intact while metadata cadence anomaly triggers a targeted -5 deduction (Score 100 -> 95).",
        baseline_id="AX-2026-00428",
        current_id="AX-2026-00424",
        expected_score_transition="100 -> 95 (-5 deduction: F-501)",
        key_takeaway="Proves zero-payload flow telemetry flags operational anomalies without falsely claiming broken encryption.",
    ),
    DemoComparisonPreset(
        id="ipv4-to-ipv6",
        name="IPv4 Secure vs Native IPv6 Secure",
        description="Demonstrates clean protocol modernization: transitioning from IPv4 to IPv6 Suite B (DH Group 20) with zero security penalties (100 -> 100).",
        baseline_id="AX-2026-00428",
        current_id="AX-2026-00425",
        expected_score_transition="100 -> 100 (0 deductions)",
        key_takeaway="Confirms modern transport transitions are classified as neutral/strengthened rather than vulnerabilities.",
    ),
]


def compare_analyses(
    baseline: AnalysisResult,
    current: AnalysisResult,
) -> DriftComparisonResult:
    """Compare two canonical analyses and return an auditable drift result."""
    return compute_configuration_drift(baseline, current)
