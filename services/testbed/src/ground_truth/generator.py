"""Ground-truth metadata record generator and persistence."""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from services.testbed.src.capture.metadata import CaptureSessionMetadata
from services.testbed.src.config.settings import PATHS
from services.testbed.src.ground_truth.schema import (
    GroundTruthCapture,
    GroundTruthConfiguration,
    GroundTruthExpectedAnalysis,
    GroundTruthRecord,
    GroundTruthTraffic,
)
from services.testbed.src.scenarios.models import ScenarioDefinition
from services.testbed.src.traffic.profiles import TrafficExecutionRecord

logger = logging.getLogger("abhedyax.testbed.ground_truth")


def generate_ground_truth(
    scenario: ScenarioDefinition,
    traffic_record: TrafficExecutionRecord,
    capture_metadata: CaptureSessionMetadata,
    output_dir: Path = PATHS.generated_ground_truth_dir,
) -> GroundTruthRecord:
    """
    Construct independent ground-truth metadata from configured parameters
    and persist it to the ground_truth directory.
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    record = GroundTruthRecord(
        scenario_id=scenario.scenario_id,
        generated_at=datetime.now(timezone.utc).isoformat(),
        configuration=GroundTruthConfiguration(
            ike_version=scenario.ike_version,
            mode=scenario.mode,
            ip_version=scenario.ip_version,
            encryption=scenario.encryption,
            authentication=scenario.authentication,
            dh_group=scenario.dh_group,
            pfs=scenario.pfs,
            replay_protection=scenario.replay_protection,
            sa_lifetime_seconds=scenario.sa_lifetime_seconds,
        ),
        traffic=GroundTruthTraffic(
            traffic_class=traffic_record.profile_name,
            duration_seconds=traffic_record.duration_seconds,
        ),
        capture=GroundTruthCapture(
            file=capture_metadata.capture_file,
            format=capture_metadata.file_format,
            packet_count=capture_metadata.packet_count,
        ),
        expected_analysis=GroundTruthExpectedAnalysis(
            protocol="IPsec",
            ike_version=scenario.ike_version,
            mode=scenario.mode,
            ip_version=scenario.ip_version,
            encryption=scenario.encryption,
            authentication=scenario.authentication,
            dh_group=scenario.dh_group,
            pfs=scenario.pfs,
        ),
    )

    out_file = output_dir / f"{scenario.scenario_id}_{capture_metadata.run_id}.json"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(record.model_dump_json(by_alias=True, indent=2))

    logger.info("Ground-truth record generated at %s", out_file)
    return record
