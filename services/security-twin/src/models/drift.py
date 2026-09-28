"""Data models for Configuration Drift and Multi-Analysis Comparisons."""

from typing import List, Literal, Optional, Any
from pydantic import BaseModel, Field

ChangeType = Literal["strengthened", "weakened", "changed", "added", "removed", "unchanged"]
SeverityType = Literal["informational", "low", "moderate", "high", "critical"]


class DriftChange(BaseModel):
    """An individual property change detected between two analyses."""

    property: str
    before: Any
    after: Any
    change_type: ChangeType
    severity: SeverityType
    finding_id: Optional[str] = None
    reason: Optional[str] = None
    evidence: List[str] = Field(default_factory=list)


class ComparisonCompatibility(BaseModel):
    """Compatibility verification between baseline and target analyses."""

    compatible: bool
    reason: str


class DriftSummary(BaseModel):
    """Aggregate counts of detected configuration drift items."""

    total_changes: int = 0
    security_relevant_changes: int = 0
    strengthened_changes: int = 0
    weakened_changes: int = 0


class DriftSecurityImpact(BaseModel):
    """Deterministic security impact metrics comparing baseline and current state."""

    baseline_score: int
    current_score: int
    score_delta: int  # current_score - baseline_score
    baseline_risk: str
    current_risk: str
    baseline_grade: Optional[str] = None
    current_grade: Optional[str] = None


class DriftComparisonResult(BaseModel):
    """Full auditable drift comparison between two IPsec analyses."""

    comparison_id: str
    baseline_analysis_id: str
    current_analysis_id: str
    baseline_name: Optional[str] = None
    current_name: Optional[str] = None
    compatibility: ComparisonCompatibility
    changes: List[DriftChange] = Field(default_factory=list)
    summary: DriftSummary
    security_impact: DriftSecurityImpact
    provenance: str = "Demo Comparison"
