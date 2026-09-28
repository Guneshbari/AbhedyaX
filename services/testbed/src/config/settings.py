"""Global settings and path resolvers for the AbhedyaX strongSwan Testbed."""

import os
import shutil
from pathlib import Path
from services.testbed.src.config.models import BinaryLocations, TestbedPaths


def resolve_base_dir() -> Path:
    """Resolve the base directory of the testbed service."""
    # services/testbed/src/config/settings.py -> services/testbed
    return Path(__file__).resolve().parent.parent.parent


BASE_DIR = resolve_base_dir()

PATHS = TestbedPaths(
    base_dir=BASE_DIR,
    scenarios_dir=BASE_DIR / "scenarios" / "definitions",
    configs_dir=BASE_DIR / "configs" / "strongswan",
    generated_pcaps_dir=BASE_DIR / "generated" / "pcaps",
    generated_ground_truth_dir=BASE_DIR / "generated" / "ground_truth",
    generated_analysis_dir=BASE_DIR / "generated" / "analysis",
)

# Ensure essential output directories exist
for p in [
    PATHS.scenarios_dir,
    PATHS.configs_dir,
    PATHS.generated_pcaps_dir,
    PATHS.generated_ground_truth_dir,
    PATHS.generated_analysis_dir,
]:
    p.mkdir(parents=True, exist_ok=True)


def get_binary_locations() -> BinaryLocations:
    """Locate available network and analysis binaries on the system."""
    return BinaryLocations(
        ip=shutil.which("ip"),
        strongswan=shutil.which("strongswan") or shutil.which("charon"),
        swanctl=shutil.which("swanctl"),
        ipsec=shutil.which("ipsec"),
        tcpdump=shutil.which("tcpdump"),
        tshark=shutil.which("tshark") or shutil.which("tshark", path="/home/gnx/.local/bin"),
        ping=shutil.which("ping"),
        curl=shutil.which("curl"),
        iperf3=shutil.which("iperf3"),
    )
