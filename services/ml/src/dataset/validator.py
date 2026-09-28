"""Dataset integrity validation and reporting."""

from collections import Counter
from typing import List
from services.ml.src.config.settings import CANONICAL_FEATURES, TARGET_CLASSES
from services.ml.src.dataset.schema import DatasetReport, DatasetSample


def validate_dataset(samples: List[DatasetSample]) -> DatasetReport:
    """
    Validate dataset integrity according to cybersecurity research standards.
    Checks ground-truth consistency, label set compliance, feature schema adherence,
    missing values, and duplicate records.
    """
    if not samples:
        return DatasetReport(
            total_samples=0,
            feature_count=len(CANONICAL_FEATURES),
            classes=[],
            samples_per_class={},
            is_valid=False,
            validation_messages=["Dataset is empty"],
        )

    messages: List[str] = []
    class_counts = Counter([s.label for s in samples])
    seen_ids = set()
    duplicates = 0
    missing_vals = 0
    corrupted = 0

    for s in samples:
        # 1. Duplicate check
        if s.sample_id in seen_ids:
            duplicates += 1
        seen_ids.add(s.sample_id)

        # 2. Label validity
        if s.label not in TARGET_CLASSES:
            corrupted += 1
            messages.append(f"Sample {s.sample_id} has invalid label: '{s.label}'")

        # 3. Features check
        for feat in CANONICAL_FEATURES:
            val = s.features.get(feat)
            if val is None:
                missing_vals += 1

        # Check for empty packet counts
        if s.features.get("packet_count", 0.0) <= 0:
            corrupted += 1
            messages.append(f"Sample {s.sample_id} has 0 packets in primary flow")

    is_valid = (corrupted == 0) and (duplicates == 0) and (len(samples) >= 5)

    if not is_valid and not messages:
        messages.append("Dataset does not meet minimum sample size or contains integrity anomalies")

    return DatasetReport(
        total_samples=len(samples),
        feature_count=len(CANONICAL_FEATURES),
        classes=sorted(list(class_counts.keys())),
        samples_per_class=dict(class_counts),
        missing_values_count=missing_vals,
        duplicate_samples_count=duplicates,
        corrupted_samples_count=corrupted,
        is_valid=is_valid,
        validation_messages=messages,
    )
