"""Data models for Auditable Security Reasoning Chains in AbhedyaX."""

from typing import List, Optional
from pydantic import BaseModel, Field


class AuditableReasoningChain(BaseModel):
    """An end-to-end explainable deduction chain connecting wire evidence to score."""

    id: str
    finding_id: str
    category: str
    severity: str
    evidence: List[str] = Field(default_factory=list)
    protocol_observation: str
    finding_title: str
    risk_rule_id: str
    rule_description: str
    deduction: int
    score_before: int
    score_after: int
    risk_band_after: str
    grade_after: str
    recommendation: str
    provenance: str = "Observed"


class AuditableReasoningResult(BaseModel):
    """Full reasoning report for an analysis."""

    analysis_id: str
    base_score: int = 100
    final_score: int
    final_risk: str
    final_grade: str
    total_deduction: int
    chains: List[AuditableReasoningChain] = Field(default_factory=list)
    anti_double_counting_applied: bool = True
    methodology_version: str = "v1.2.0-deterministic"
