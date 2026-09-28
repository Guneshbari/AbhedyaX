"""Data models and schemas for the Deterministic Security Risk Engine."""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field

RiskLevelType = Literal["Low", "Moderate", "High", "Critical"]

FindingCategoryType = Literal[
    "Protocol",
    "Cryptography",
    "Key Exchange",
    "PFS",
    "Replay Protection",
    "Authentication",
    "SA Lifetime",
    "Configuration",
    "Metadata Exposure",
    "Traffic Intelligence",
]


class ScoringDeduction(BaseModel):
    """An auditable deduction applied against the base score of 100."""

    finding_id: str
    category: str
    severity: str
    deduction: int
    reason: str
    evidence_ref: Optional[str] = None


class RiskScoringResult(BaseModel):
    """Standardized deterministic security score and auditable breakdown."""

    security_score: int = Field(..., ge=0, le=100, description="Overall security posture score (0-100)")
    risk_level: RiskLevelType = Field(..., description="Normalized operational risk level")
    base_score: int = Field(default=100, description="Starting maximum baseline score")
    total_deduction: int = Field(default=0, ge=0, description="Sum of all applicable condition deductions")
    scoring_breakdown: List[ScoringDeduction] = Field(
        default_factory=list, description="Itemized, auditable list of score deductions"
    )
    methodology_version: str = Field(
        default="v1.2.0-deterministic", description="Identifier of the deterministic risk scoring methodology"
    )
