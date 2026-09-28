"""TShark process execution and structured output handling.

Adheres strictly to safe subprocess execution principles:
- Subprocess argument arrays only (never shell=True or string concatenation).
- Separate stdout and stderr capture.
- Configurable timeout enforcement.
- Structured JSON output parsing (-T json).
- Clear diagnostic errors for missing binary, timeouts, or corrupt captures.
"""

import asyncio
import json
import os
import shutil
import subprocess
from typing import List, Dict, Any, Optional, Tuple
from app.config import settings
from app.core.logging import logger


class TSharkExecutionError(Exception):
    """Raised when TShark subprocess fails or produces invalid output."""
    pass


class TSharkNotFoundError(TSharkExecutionError):
    """Raised when TShark binary is not installed or not in PATH."""
    pass


class TSharkTimeoutError(TSharkExecutionError):
    """Raised when TShark execution exceeds the configured timeout."""
    pass


def is_tshark_available(binary_name: Optional[str] = None) -> bool:
    """Check if the tshark binary is discoverable in PATH or specified location."""
    binary = binary_name or settings.tshark_binary
    return shutil.which(binary) is not None


def get_tshark_version(binary_name: Optional[str] = None) -> Optional[str]:
    """Retrieve the installed TShark version string."""
    binary = binary_name or settings.tshark_binary
    if not is_tshark_available(binary):
        return None
    try:
        proc = subprocess.run(
            [binary, "--version"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        if proc.returncode == 0 and proc.stdout:
            for line in proc.stdout.splitlines():
                if "TShark (Wireshark)" in line or "TShark" in line:
                    return line.strip()
    except Exception as e:
        logger.warning(f"Failed to query TShark version: {e}")
    return None


async def run_tshark_json(
    pcap_path: str,
    display_filter: Optional[str] = None,
    timeout_seconds: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """Execute TShark against a capture file and parse structured JSON output.

    Args:
        pcap_path: Path to the target PCAP/PCAPNG file on disk.
        display_filter: Optional Wireshark display filter (e.g. 'isakmp || esp || ah').
        timeout_seconds: Subprocess execution timeout in seconds.

    Returns:
        List of packet dictionaries decoded by TShark.

    Raises:
        TSharkNotFoundError: If tshark is not in PATH.
        TSharkTimeoutError: If execution exceeds timeout.
        TSharkExecutionError: If capture is unreadable or process returns non-zero.
    """
    binary = settings.tshark_binary
    if not is_tshark_available(binary):
        raise TSharkNotFoundError(
            f"TShark binary '{binary}' is not installed or not available in the system PATH. "
            "Please ensure Wireshark/TShark CLI is installed."
        )

    if not os.path.isfile(pcap_path):
        raise TSharkExecutionError(f"Target capture file does not exist: {pcap_path}")

    timeout = timeout_seconds or settings.tshark_timeout_seconds

    # Construct safe command argument list (no shell injection possible)
    cmd: List[str] = [
        binary,
        "-r",
        os.path.abspath(pcap_path),
        "-T",
        "json",
        "--no-duplicate-keys",
    ]

    if display_filter:
        cmd.extend(["-Y", display_filter])

    logger.info(f"Invoking TShark subprocess: {cmd[0]} -r {pcap_path} -T json")

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout_data, stderr_data = await asyncio.wait_for(
                proc.communicate(),
                timeout=float(timeout),
            )
        except asyncio.TimeoutError:
            try:
                proc.kill()
                await proc.wait()
            except ProcessLookupError:
                pass
            raise TSharkTimeoutError(
                f"TShark processing timed out after {timeout} seconds for file: {pcap_path}"
            )

        stderr_text = stderr_data.decode("utf-8", errors="replace")
        stdout_text = stdout_data.decode("utf-8", errors="replace").strip()

        # Check returncode
        if proc.returncode != 0 and not stdout_text:
            raise TSharkExecutionError(
                f"TShark execution failed with exit code {proc.returncode}: {stderr_text.strip()}"
            )

        if not stdout_text:
            logger.warning(f"TShark produced empty output for capture: {pcap_path}")
            return []

        try:
            packets = json.loads(stdout_text)
            if not isinstance(packets, list):
                logger.warning("TShark JSON output was not a list of packet records.")
                return []
            return packets
        except json.JSONDecodeError as jde:
            logger.error(f"Failed to parse TShark JSON output: {jde}")
            # If JSON is slightly truncated or has warnings prepended, attempt recovery
            start_bracket = stdout_text.find("[")
            end_bracket = stdout_text.rfind("]")
            if start_bracket != -1 and end_bracket != -1 and end_bracket > start_bracket:
                try:
                    recovered = json.loads(stdout_text[start_bracket : end_bracket + 1])
                    return recovered
                except Exception:
                    pass
            raise TSharkExecutionError(
                f"TShark JSON deserialization failed: {jde}. Raw stderr: {stderr_text[:200]}"
            )

    except (TSharkNotFoundError, TSharkTimeoutError, TSharkExecutionError):
        raise
    except Exception as e:
        logger.error(f"Unexpected error executing TShark: {e}")
        raise TSharkExecutionError(f"Unexpected error executing TShark: {str(e)}")
