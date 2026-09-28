"""Environment prerequisite detection and capability validation."""

import os
import shutil
import subprocess
import sys
from typing import Optional, Tuple
from services.testbed.src.config.models import TestbedEnvironmentStatus
from services.testbed.src.config.settings import get_binary_locations


def is_linux() -> bool:
    """Check if host OS is Linux."""
    return sys.platform.startswith("linux")


def has_root() -> bool:
    """Check if current process has root privileges."""
    return hasattr(os, "geteuid") and os.geteuid() == 0


def get_command_version(binary: Optional[str], flag: str = "--version") -> Optional[str]:
    """Safely query version string from a binary."""
    if not binary:
        return None
    try:
        res = subprocess.run(
            [binary, flag],
            capture_output=True,
            text=True,
            timeout=3,
        )
        output = (res.stdout or res.stderr or "").strip().split("\n")[0]
        return output[:80] if output else None
    except Exception:
        return None


def can_manage_netns() -> bool:
    """Check whether process has capability to create and delete network namespaces."""
    if not is_linux() or not shutil.which("ip"):
        return False
    if has_root():
        test_ns = f"abhedyax_probe_{os.getpid()}"
        try:
            add_res = subprocess.run(
                ["ip", "netns", "add", test_ns],
                capture_output=True,
                timeout=3,
            )
            if add_res.returncode == 0:
                subprocess.run(["ip", "netns", "del", test_ns], capture_output=True, timeout=3)
                return True
        except Exception:
            return False
    return False


def evaluate_testbed_environment(active_runs: int = 0) -> TestbedEnvironmentStatus:
    """Evaluate full host readiness for real vs simulation testbed operations."""
    binaries = get_binary_locations()

    linux_ok = is_linux()
    root_ok = has_root()
    netns_ok = can_manage_netns()
    strongswan_ok = bool(binaries.strongswan or binaries.swanctl or binaries.ipsec)
    tcpdump_ok = bool(binaries.tcpdump)
    tshark_ok = bool(binaries.tshark)

    strongswan_ver = None
    if binaries.swanctl:
        strongswan_ver = get_command_version(binaries.swanctl, "--version")
    elif binaries.strongswan:
        strongswan_ver = get_command_version(binaries.strongswan, "version")

    tcpdump_ver = get_command_version(binaries.tcpdump, "--version") if tcpdump_ok else None
    tshark_ver = get_command_version(binaries.tshark, "--version") if tshark_ok else None

    # Real mode requires Linux, netns permissions, strongSwan, and tcpdump
    real_capable = linux_ok and netns_ok and strongswan_ok and tcpdump_ok

    default_mode = "real" if real_capable else "simulation"

    if real_capable:
        message = "Real strongSwan testbed environment ready (Linux namespaces + strongSwan + tcpdump available)"
    else:
        missing = []
        if not netns_ok:
            missing.append("CAP_NET_ADMIN/root privileges for network namespaces")
        if not strongswan_ok:
            missing.append("strongSwan/charon/swanctl")
        if not tcpdump_ok:
            missing.append("tcpdump")
        message = f"Operating in Simulation Mode. Missing real prerequisites: {', '.join(missing)}"

    return TestbedEnvironmentStatus(
        is_linux=linux_ok,
        has_root=root_ok,
        can_manage_netns=netns_ok,
        has_strongswan=strongswan_ok,
        has_tcpdump=tcpdump_ok,
        has_tshark=tshark_ok,
        strongswan_version=strongswan_ver,
        tcpdump_version=tcpdump_ver,
        tshark_version=tshark_ver,
        default_mode=default_mode,
        active_runs=active_runs,
        message=message,
    )
