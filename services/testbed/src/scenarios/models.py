"""Pydantic data models for testbed scenario definitions."""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class ScoreRange(BaseModel):
    min: int = Field(..., ge=0, le=100)
    max: int = Field(..., ge=0, le=100)


class ExpectedSecurity(BaseModel):
    score_range: ScoreRange
    risk_level: Literal["Low", "Medium", "High", "Critical"]
    expected_findings: List[str] = Field(default_factory=list)


class ScenarioDefinition(BaseModel):
    """Canonical testbed scenario definition specification."""

    scenario_id: str
    name: str
    description: str
    ike_version: Literal["IKEv1", "IKEv2"]
    mode: Literal["Tunnel", "Transport"] = "Tunnel"
    ip_version: Literal["IPv4", "IPv6"] = "IPv4"
    encryption: str
    authentication: str
    dh_group: str
    pfs: bool = True
    replay_protection: bool = True
    sa_lifetime_seconds: int = 28800
    traffic_profiles: List[
        Literal["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"]
    ] = Field(
        default_factory=lambda: [
            "ICMP",
            "Web",
            "Email",
            "VoIP",
            "Video",
            "Messaging",
        ]
    )
    expected_security: ExpectedSecurity
