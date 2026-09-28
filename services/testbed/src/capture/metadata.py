"""Metadata schema for network packet captures."""

from typing import List, Optional
from pydantic import BaseModel, Field


class CaptureSessionMetadata(BaseModel):
    """Metadata recorded from a tcpdump or synthetic capture session."""

    scenario_id: str
    run_id: str
    capture_file: str
    file_format: str = "pcapng"
    file_size_bytes: int = 0
    packet_count: int = 0
    start_time: str
    end_time: str
    duration_seconds: float = 0.0
    interface: str = "veth_r_init"
    traffic_profiles: List[str] = Field(default_factory=list)
