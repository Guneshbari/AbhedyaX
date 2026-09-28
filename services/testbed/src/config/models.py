"""Configuration models for AbhedyaX strongSwan Testbed."""

from pathlib import Path
from typing import Literal, Optional
from pydantic import BaseModel, Field


class TestbedPaths(BaseModel):
    """File system paths used by testbed operations."""

    base_dir: Path
    scenarios_dir: Path
    configs_dir: Path
    generated_pcaps_dir: Path
    generated_ground_truth_dir: Path
    generated_analysis_dir: Path


class BinaryLocations(BaseModel):
    """Resolved paths for system tools."""

    ip: Optional[str] = None
    strongswan: Optional[str] = None
    swanctl: Optional[str] = None
    ipsec: Optional[str] = None
    tcpdump: Optional[str] = None
    tshark: Optional[str] = None
    ping: Optional[str] = None
    curl: Optional[str] = None
    iperf3: Optional[str] = None


class TestbedEnvironmentStatus(BaseModel):
    """Environment capability and prerequisite readiness report."""

    is_linux: bool
    has_root: bool
    can_manage_netns: bool
    has_strongswan: bool
    has_tcpdump: bool
    has_tshark: bool
    strongswan_version: Optional[str] = None
    tcpdump_version: Optional[str] = None
    tshark_version: Optional[str] = None
    default_mode: Literal["real", "simulation"] = "simulation"
    active_runs: int = 0
    message: str = "Testbed status evaluated"
