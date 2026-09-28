"""Data models for Security Posture Timeline in AbhedyaX."""

from typing import List, Literal, Optional, Dict, Any
from pydantic import BaseModel, Field


class PostureTimelineEntry(BaseModel):
    """An individual historical security assessment point in time."""

    analysis_id: str
    timestamp: str
    scenario: str
    score: int
    risk: str
    grade: str
    finding_count: int
    configuration_summary: str
    source: Literal["PCAP", "Simulation", "Testbed"]
    provenance: str
    pfs: bool = False
    replay_protection: bool = True
    ike_version: str = "IKEv2"
    encryption: str = "AES-256-GCM"


class PostureTransition(BaseModel):
    """Transition between consecutive posture assessment points."""

    from_id: str
    to_id: str
    from_score: int
    to_score: int
    score_delta: int
    risk_transition: str
    grade_transition: str
    key_changes: List[str] = Field(default_factory=list)


class PostureTimelineResult(BaseModel):
    """Aggregated multi-session security posture over time."""

    timeline: List[PostureTimelineEntry] = Field(default_factory=list)
    transitions: List[PostureTransition] = Field(default_factory=list)
    total_sessions: int = 0
    average_score: float = 0.0
    highest_score: int = 0
    lowest_score: int = 0
    risk_distribution: Dict[str, int] = Field(default_factory=dict)
    posture_summary: str
    disclaimer: str = "Historical timeline reflects completed canonical scenario sessions. Prototype mode: does not imply continuous background fleet monitoring."
