"""Dataset generator creating reproducible labelled IPsec PCAP datasets for ML training."""

import asyncio
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from services.testbed.src.capture.manager import CaptureManager
from services.testbed.src.config.settings import PATHS
from services.testbed.src.ground_truth.generator import generate_ground_truth
from services.testbed.src.scenarios.loader import load_all_scenarios
from services.testbed.src.traffic.generators import ControlledTrafficGenerator
from services.testbed.src.traffic.profiles import TRAFFIC_PROFILES, TrafficClass

logger = logging.getLogger("abhedyax.testbed.dataset")


class DatasetEntry(BaseModel):
    entry_id: str
    scenario_id: str
    traffic_class: str
    configuration: Dict[str, Any]
    capture_file: str
    file_format: str
    packet_count: int
    duration_seconds: float
    ground_truth_file: str
    generation_timestamp: str


class DatasetManifest(BaseModel):
    version: str = "1.0.0"
    generated_at: str
    total_samples: int
    scenarios_count: int
    traffic_classes_count: int
    entries: List[DatasetEntry] = Field(default_factory=list)


async def generate_dataset(
    limit: Optional[int] = None,
    output_dir: Path = PATHS.base_dir / "generated",
    is_simulation: bool = True,
) -> DatasetManifest:
    """
    Generate the 5 x 6 (30 captures) benchmark labelled dataset matrix
    or a limited subset for testing.
    """
    scenarios = load_all_scenarios()
    traffic_classes: List[TrafficClass] = ["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"]

    entries: List[DatasetEntry] = []
    manifest_path = output_dir / "dataset_manifest.json"

    count = 0
    for sc_id, scenario in scenarios.items():
        for t_class in traffic_classes:
            if limit is not None and count >= limit:
                break

            entry_id = f"ds-{sc_id[:8]}-{t_class.lower()}"
            run_id = f"ds-{count+1:02d}"

            logger.info("Generating dataset entry [%d/30]: %s (%s)", count + 1, sc_id, t_class)

            # 1. Capture
            cap_mgr = CaptureManager(
                scenario=scenario,
                run_id=run_id,
                traffic_profile=t_class,
                is_simulation=is_simulation,
            )
            cap_mgr.start_capture()

            # 2. Traffic
            traffic_gen = ControlledTrafficGenerator(profile_name=t_class, seed=42 + count)
            traffic_record = await traffic_gen.run(duration_seconds=0.2, is_simulation=is_simulation)

            # 3. Stop Capture
            cap_meta = cap_mgr.stop_capture(traffic_packets=traffic_record.packets_transmitted)

            # 4. Ground Truth
            gt_record = generate_ground_truth(
                scenario=scenario,
                traffic_record=traffic_record,
                capture_metadata=cap_meta,
            )
            gt_file = PATHS.generated_ground_truth_dir / f"{scenario.scenario_id}_{cap_meta.run_id}.json"

            entry = DatasetEntry(
                entry_id=entry_id,
                scenario_id=sc_id,
                traffic_class=t_class,
                configuration={
                    "ike_version": scenario.ike_version,
                    "mode": scenario.mode,
                    "ip_version": scenario.ip_version,
                    "encryption": scenario.encryption,
                    "authentication": scenario.authentication,
                    "dh_group": scenario.dh_group,
                    "pfs": scenario.pfs,
                    "replay_protection": scenario.replay_protection,
                    "sa_lifetime_seconds": scenario.sa_lifetime_seconds,
                },
                capture_file=cap_meta.capture_file,
                file_format=cap_meta.file_format,
                packet_count=cap_meta.packet_count,
                duration_seconds=cap_meta.duration_seconds,
                ground_truth_file=str(gt_file),
                generation_timestamp=datetime.now(timezone.utc).isoformat(),
            )
            entries.append(entry)
            count += 1

        if limit is not None and count >= limit:
            break

    manifest = DatasetManifest(
        version="1.0.0",
        generated_at=datetime.now(timezone.utc).isoformat(),
        total_samples=len(entries),
        scenarios_count=len(scenarios),
        traffic_classes_count=len(traffic_classes),
        entries=entries,
    )

    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(manifest.model_dump_json(indent=2))

    logger.info("Dataset generation completed: %d samples recorded in %s", len(entries), manifest_path)
    return manifest
