"""Data-leakage prevention and capture-level dataset splitting."""

import random
from typing import Dict, List, Tuple
import numpy as np

from services.ml.src.config.settings import CANONICAL_FEATURES
from services.ml.src.dataset.schema import DatasetSample


def split_dataset_by_capture(
    samples: List[DatasetSample],
    test_ratio: float = 0.2,
    val_ratio: float = 0.2,
    random_state: int = 42,
) -> Tuple[List[DatasetSample], List[DatasetSample], List[DatasetSample]]:
    """
    Split dataset strictly at the capture/session level to prevent data leakage.
    Ensures proportional class distribution across splits.
    """
    rng = random.Random(random_state)

    # Group samples by class to enable stratified capture allocation
    by_class: Dict[str, List[DatasetSample]] = {}
    for s in samples:
        by_class.setdefault(s.label, []).append(s)

    train_samples: List[DatasetSample] = []
    val_samples: List[DatasetSample] = []
    test_samples: List[DatasetSample] = []

    for label, class_samples in by_class.items():
        shuffled = list(class_samples)
        rng.shuffle(shuffled)
        n = len(shuffled)

        if n <= 2:
            # Small class: allocate at least 1 to train
            train_samples.append(shuffled[0])
            if n > 1:
                test_samples.append(shuffled[1])
            continue

        n_test = max(1, int(round(n * test_ratio)))
        n_val = max(1, int(round(n * val_ratio)))
        # Ensure train gets at least 1
        if n_test + n_val >= n:
            n_val = max(0, n - n_test - 1)

        test_part = shuffled[:n_test]
        val_part = shuffled[n_test : n_test + n_val]
        train_part = shuffled[n_test + n_val :]

        test_samples.extend(test_part)
        val_samples.extend(val_part)
        train_samples.extend(train_part)

    return train_samples, val_samples, test_samples


def extract_matrices(
    samples: List[DatasetSample],
    features: List[str] = CANONICAL_FEATURES,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Extract strictly numerical feature matrix X and label vector y.
    Prevents leakage of scenario_id, ground_truth parameters, or filenames into features.
    """
    X_rows = []
    y_rows = []

    for s in samples:
        row = [float(s.features.get(f, 0.0)) for f in features]
        X_rows.append(row)
        y_rows.append(s.label)

    return np.array(X_rows, dtype=np.float64), np.array(y_rows)
