"""Dataset loader reading labelled captures and extracting feature matrices."""

import json
import logging
from pathlib import Path
from typing import List, Optional
import polars as pl
from services.ml.src.config.settings import (
    CANONICAL_FEATURES,
    DATASET_GT_DIR,
    DATASET_MANIFEST_FILE,
    DATASET_PCAPS_DIR,
    TARGET_CLASSES,
)
from services.ml.src.dataset.schema import DatasetSample
from services.ml.src.features.extractor import UnifiedFeatureExtractor

logger = logging.getLogger("abhedyax.ml.dataset")


def load_dataset_from_manifest(
    manifest_path: Path = DATASET_MANIFEST_FILE,
    extractor: Optional[UnifiedFeatureExtractor] = None,
) -> List[DatasetSample]:
    """
    Load dataset entries defined in dataset_manifest.json and extract features.
    """
    ext = extractor or UnifiedFeatureExtractor()
    samples: List[DatasetSample] = []

    if not manifest_path.exists():
        logger.warning("Dataset manifest %s not found", manifest_path)
        return samples

    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)

        entries = manifest.get("entries", [])
        for entry in entries:
            pcap_file = entry.get("capture_file", "")
            traffic_class = entry.get("traffic_class", "")
            scenario_id = entry.get("scenario_id", "")
            entry_id = entry.get("entry_id", f"sample-{len(samples)}")
            gt_file = entry.get("ground_truth_file")

            # Extract features from PCAP
            features = ext.extract_from_pcap(pcap_file)

            sample = DatasetSample(
                sample_id=entry_id,
                scenario_id=scenario_id,
                traffic_class=traffic_class,
                pcap_path=pcap_file,
                ground_truth_path=gt_file,
                features=features,
                label=traffic_class,
            )
            samples.append(sample)

        logger.info("Loaded %d samples from manifest %s", len(samples), manifest_path)
    except Exception as e:
        logger.error("Failed to load dataset from manifest: %s", e)

    return samples


def load_dataset_from_directory(
    gt_dir: Path = DATASET_GT_DIR,
    pcaps_dir: Path = DATASET_PCAPS_DIR,
    extractor: Optional[UnifiedFeatureExtractor] = None,
) -> List[DatasetSample]:
    """
    Load dataset by discovering matching ground-truth JSON files and PCAP captures.
    """
    ext = extractor or UnifiedFeatureExtractor()
    samples: List[DatasetSample] = []

    if not gt_dir.exists():
        return samples

    for gt_path in gt_dir.glob("*.json"):
        try:
            with open(gt_path, "r", encoding="utf-8") as f:
                gt_data = json.load(f)

            sc_id = gt_data.get("scenario_id", "")
            t_class = gt_data.get("traffic", {}).get("class", "")
            cap_info = gt_data.get("capture", {})
            cap_file = cap_info.get("file", "")

            # If cap_file not absolute or not found, search in pcaps_dir
            pcap_path = Path(cap_file)
            if not pcap_path.exists():
                candidate = pcaps_dir / pcap_path.name
                if candidate.exists():
                    pcap_path = candidate

            if not pcap_path.exists():
                logger.debug("PCAP %s for ground truth %s not found, skipping", cap_file, gt_path.name)
                continue

            features = ext.extract_from_pcap(pcap_path)

            sample = DatasetSample(
                sample_id=f"{sc_id}_{gt_path.stem}",
                scenario_id=sc_id,
                traffic_class=t_class,
                pcap_path=str(pcap_path),
                ground_truth_path=str(gt_path),
                features=features,
                label=t_class,
            )
            samples.append(sample)
        except Exception as e:
            logger.warning("Error processing %s: %s", gt_path, e)

    return samples


def samples_to_polars(samples: List[DatasetSample]) -> pl.DataFrame:
    """Convert dataset samples into a Polars DataFrame for processing."""
    rows = []
    for s in samples:
        row = {"sample_id": s.sample_id, "scenario_id": s.scenario_id, "label": s.label}
        row.update(s.features)
        rows.append(row)
    return pl.DataFrame(rows)
