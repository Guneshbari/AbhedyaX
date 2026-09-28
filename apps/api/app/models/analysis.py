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
    ike_version: Literal["IKEv1", "IKEv2"] = "IKEv2"
    mode: Literal["Tunnel", "Transport"] = "Tunnel"
    ip_version: Literal["IPv4", "IPv6"] = "IPv4"
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

    model_config = ConfigDict(populate_by_name=True)
