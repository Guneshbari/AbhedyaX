"""Ground-truth metadata schema for AbhedyaX testbed datasets."""

from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class GroundTruthConfiguration(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ike_version: str
    mode: str
    ip_version: str
    encryption: str
    authentication: str
    dh_group: str
    pfs: bool
    replay_protection: bool
    sa_lifetime_seconds: int


class GroundTruthTraffic(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    traffic_class: Literal["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"] = Field(
        ..., serialization_alias="class", validation_alias="class"
    )
    duration_seconds: float


class GroundTruthCapture(BaseModel):
    file: str
    format: str = "pcapng"
    packet_count: int


class GroundTruthExpectedAnalysis(BaseModel):
    protocol: str = "IPsec"
    ike_version: str
    mode: str
    ip_version: str
    encryption: str
    authentication: str
    dh_group: str
    pfs: bool


class GroundTruthRecord(BaseModel):
    """Canonical ground-truth specification for an individual testbed run."""

    model_config = ConfigDict(populate_by_name=True)

    scenario_id: str
    generated_at: str
    configuration: GroundTruthConfiguration
    traffic: GroundTruthTraffic
    capture: GroundTruthCapture
    expected_analysis: GroundTruthExpectedAnalysis
