"""Security findings aggregation and summary generation for AbhedyaX."""

from typing import List
from app.models.analysis import SecurityFinding, FindingsSummary


def summarize_findings(findings: List[SecurityFinding]) -> FindingsSummary:
    """Compute counts of findings categorized by severity level."""
    counts = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "informational": 0,
    }

    for f in findings:
        sev = f.severity.lower()
        if sev in counts:
            counts[sev] += 1

    return FindingsSummary(
        total_findings=len(findings),
        critical=counts["critical"],
        high=counts["high"],
        medium=counts["medium"],
        low=counts["low"],
        informational=counts["informational"],
    )
