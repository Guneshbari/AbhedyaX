from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

SourceType = Literal["simulation", "pcap", "live"]
AnalysisStatusType = Literal["queued", "processing", "completed", "failed"]
RiskLevelType = Literal["Low", "Medium", "High", "Critical"]
GradeType = Literal["A", "B", "C", "D", "F"]
FindingSeverityType = Literal["Critical", "High", "Medium", "Low", "Informational"]
FindingCategoryType = Literal[
    "Cryptography",
    "Key Exchange",
    "Authentication",
    "PFS",
    "Replay Protection",
    "Configuration",
    "Metadata Exposure",
    "Protocol",
]


class CreateAnalysisRequest(BaseModel):
    source_type: Literal["simulation", "pcap"] = "simulation"
    scenario_id: Optional[str] = None
    file_name: Optional[str] = None


class CreateAnalysisResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatusType
    source_type: Literal["simulation", "pcap"]


class AnalysisStatusResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatusType
    progress: int
    current_step: str
    message: str


class AnalysisSource(BaseModel):
    type: SourceType
    name: str
    file_name: Optional[str] = None


class VPNConfiguration(BaseModel):
    protocol: str = "IPsec"
    ike_version: Literal["IKEv1", "IKEv2", "Unknown"] = "IKEv2"
    mode: Literal["Tunnel", "Transport", "Unknown"] = "Tunnel"
    ip_version: Literal["IPv4", "IPv6", "Dual-Stack", "Unknown"] = "IPv4"
    nat_traversal: bool = True
    protocols_detected: List[str] = Field(default_factory=lambda: ["IKEv2", "ESP"])


class CryptographyConfiguration(BaseModel):
    encryption: str
    authentication: str
    dh_group: str
    pfs: bool


class SecurityAssessment(BaseModel):
    score: int
    grade: GradeType
    risk_level: RiskLevelType
    replay_protection: bool
    sa_lifetime_seconds: int


class TrafficCandidateClass(BaseModel):
    class_name: str = Field(alias="class")
    confidence: float

    model_config = ConfigDict(populate_by_name=True)


class TrafficFeatures(BaseModel):
    packet_size_pattern: str
    directionality: str
    inter_arrival_pattern: str
    session_duration_seconds: int


class TrafficIntelligence(BaseModel):
    predicted_class: str
    confidence: float
    candidate_classes: List[TrafficCandidateClass] = Field(default_factory=list)
    features: Optional[TrafficFeatures] = None


class SecurityFinding(BaseModel):
    id: str
    severity: FindingSeverityType
    category: FindingCategoryType
    title: str
    description: str
    evidence: List[str] = Field(default_factory=list)
    recommendation: str
    confidence: float = 0.95


class FindingsSummary(BaseModel):
    total_findings: int
    critical: int
    high: int
    medium: int
    low: int
    informational: int


class CaptureMetadata(BaseModel):
    file_name: str
    file_size_bytes: int
    packet_count: int
    duration_seconds: float
    first_packet_time: Optional[str] = None
    last_packet_time: Optional[str] = None


class ProtocolObservations(BaseModel):
    ike_sessions: int = 0
    esp_sessions: int = 0
    ah_sessions: int = 0
    nat_traversal_detected: bool = False
    observed_spis: List[str] = Field(default_factory=list)


class ProtocolEvidence(BaseModel):
    source: str = "TShark"
    field: str
    value: str
    packet_numbers: List[int] = Field(default_factory=list)


class ScoreFactor(BaseModel):
    category: str
    weight: int
    score: int
    description: str


class AnalysisResult(BaseModel):
    analysis_id: str
    status: AnalysisStatusType
    created_at: str
    completed_at: Optional[str] = None
    source: AnalysisSource
    vpn: VPNConfiguration
    cryptography: CryptographyConfiguration
    security: SecurityAssessment
    traffic: TrafficIntelligence
    findings: List[SecurityFinding] = Field(default_factory=list)
    summary: FindingsSummary
    # Phase 2 Extensions
    engine_type: Optional[str] = "mock"
    capture_metadata: Optional[CaptureMetadata] = None
    protocol_observations: Optional[ProtocolObservations] = None
    evidence: List[ProtocolEvidence] = Field(default_factory=list)
    score_factors: List[ScoreFactor] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)
