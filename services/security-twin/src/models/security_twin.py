"""Data models for Security Twin representation in AbhedyaX."""

from typing import List, Literal, Optional, Union, Any
from pydantic import BaseModel, Field


class SecurityState(BaseModel):
    """Normalized security properties of an IPsec configuration."""

    ipsec: bool = True
    ike_version: Optional[str] = None
    mode: Optional[str] = None
    ip_version: Optional[str] = None
    encryption: Optional[str] = None
    authentication: Optional[str] = None
    dh_group: Optional[Union[str, int]] = None
    pfs: Optional[bool] = None
    replay_protection: Optional[bool] = None
    sa_lifetime: Optional[int] = None


class AlignmentItem(BaseModel):
    """Property-level alignment comparison between expected and observed state."""

    property: str
    expected: Any
    observed: Any
    status: Literal["match", "mismatch", "unknown"]
    evidence_ids: List[str] = Field(default_factory=list)
    impact_note: Optional[str] = None


class TwinAlignment(BaseModel):
    """Aggregate alignment evaluation."""

    overall: Literal["aligned", "partial", "drifted", "unknown"]
    items: List[AlignmentItem] = Field(default_factory=list)
    matched_count: int = 0
    mismatched_count: int = 0
    unknown_count: int = 0


class TwinSecurityImpact(BaseModel):
    """Security risk impact derived strictly from canonical analysis findings."""

    affected_properties: List[str] = Field(default_factory=list)
    finding_ids: List[str] = Field(default_factory=list)
    risk_score: int
    risk: str
    grade: str
    remediation_advice: List[str] = Field(default_factory=list)


class TwinProvenance(BaseModel):
    """Explicit evidence and scenario provenance labels."""

    expected_state: Literal["GroundTruth", "Simulated", "Unknown"]
    observed_state: Literal["Observed", "Inferred", "Simulated"]


class SecurityTwin(BaseModel):
    """Canonical Security Twin representing intended vs observed IPsec security posture."""

    analysis_id: str
    twin_id: str
    mode: Literal["simulation", "observed", "hybrid"]
    expected_state: SecurityState
    observed_state: SecurityState
    alignment: TwinAlignment
    security_impact: TwinSecurityImpact
    provenance: TwinProvenance
