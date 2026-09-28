"""Validation engine comparing expected ground-truth against AbhedyaX analysis results."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from services.testbed.src.config.settings import PATHS
from services.testbed.src.ground_truth.schema import GroundTruthRecord

logger = logging.getLogger("abhedyax.testbed.validation")


class FieldCheck(BaseModel):
    field: str
    expected: Any
    observed: Any
    match: bool
    details: Optional[str] = None


class ValidationResult(BaseModel):
    """Result of comparing ground-truth configuration with AbhedyaX observed analysis."""

    scenario_id: str
    run_id: str
    passed: bool
    accuracy: float
    total_checks: int
    matched_checks: int
    checks: List[FieldCheck]
    analysis_id: Optional[str] = None


def normalize_val(val: Any) -> str:
    """Normalize string values for resilient comparison."""
    if val is None:
        return ""
    if isinstance(val, bool):
        return "true" if val else "false"
    return str(val).strip().lower().replace("-", "").replace(" ", "").replace("_", "")


def validate_analysis_against_ground_truth(
    ground_truth: GroundTruthRecord,
    observed_analysis: Dict[str, Any],
    run_id: str,
    analysis_id: Optional[str] = None,
    output_dir: Path = PATHS.generated_analysis_dir,
) -> ValidationResult:
    """
    Compare configured ground-truth attributes against observed AnalysisResult.
    Computes field-by-field accuracy and persists validation report.
    """
    checks: List[FieldCheck] = []
    cfg = ground_truth.configuration

    # Extract observed VPN configuration safely
    vpn_config = observed_analysis.get("vpn_configuration", {})
    if not isinstance(vpn_config, dict):
        vpn_config = {}

    traffic_intel = observed_analysis.get("traffic_intelligence", {})
    if not isinstance(traffic_intel, dict):
        traffic_intel = {}

    obs_protocol = vpn_config.get("protocol") or observed_analysis.get("protocol_type", "IPsec")
    obs_ike = vpn_config.get("ike_version") or observed_analysis.get("ike_version", "")
    obs_mode = vpn_config.get("mode") or observed_analysis.get("vpn_mode", "")
    obs_ip_ver = vpn_config.get("ip_version", "IPv4")
    obs_encr = vpn_config.get("encryption", "")
    obs_auth = vpn_config.get("authentication", "")
    obs_dh = vpn_config.get("dh_group", "")
    obs_pfs = vpn_config.get("pfs", False)
    obs_replay = vpn_config.get("replay_protection", True)
    obs_traffic = traffic_intel.get("traffic_class", "")

    # Define validation rules
    check_specs = [
        ("protocol", "IPsec", obs_protocol),
        ("ike_version", cfg.ike_version, obs_ike),
        ("mode", cfg.mode, obs_mode),
        ("ip_version", cfg.ip_version, obs_ip_ver),
        ("encryption", cfg.encryption, obs_encr),
        ("authentication", cfg.authentication, obs_auth),
        ("dh_group", cfg.dh_group, obs_dh),
        ("pfs", cfg.pfs, obs_pfs),
        ("replay_protection", cfg.replay_protection, obs_replay),
        ("traffic_profile", ground_truth.traffic.traffic_class, obs_traffic),
    ]

    matched_count = 0
    for field_name, expected, observed in check_specs:
        match = False
        if isinstance(expected, bool):
            match = (bool(expected) == bool(observed))
        else:
            exp_norm = normalize_val(expected)
            obs_norm = normalize_val(observed)
            # Substring match or exact normalized match
            match = (exp_norm == obs_norm) or (exp_norm in obs_norm) or (obs_norm in exp_norm and len(obs_norm) > 2)

        if match:
            matched_count += 1

        checks.append(
            FieldCheck(
                field=field_name,
                expected=expected,
                observed=observed if observed is not None else "Unknown",
                match=match,
            )
        )

    accuracy = round(matched_count / len(checks), 4)
    # Passed if 80% or greater fields match
    passed = accuracy >= 0.80

    result = ValidationResult(
        scenario_id=ground_truth.scenario_id,
        run_id=run_id,
        passed=passed,
        accuracy=accuracy,
        total_checks=len(checks),
        matched_checks=matched_count,
        checks=checks,
        analysis_id=analysis_id,
    )

    # Persist report
    try:
        output_dir.mkdir(parents=True, exist_ok=True)
        out_file = output_dir / f"{ground_truth.scenario_id}_{run_id}_validation.json"
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(result.model_dump_json(indent=2))
        logger.info("Validation report written to %s", out_file)
    except Exception as e:
        logger.warning("Could not persist validation report: %s", e)

    return result
