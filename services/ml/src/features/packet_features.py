"""Packet-level size and distribution feature extraction."""

from typing import Dict, List, Sequence
import numpy as np


def compute_packet_size_features(packet_lengths: Sequence[int]) -> Dict[str, float]:
    """
    Extract statistical and percentile features from observable packet lengths.
    No application payload data is processed or inspected.
    """
    if not packet_lengths:
        return {
            "packet_count": 0.0,
            "mean_packet_size": 0.0,
            "median_packet_size": 0.0,
            "std_packet_size": 0.0,
            "min_packet_size": 0.0,
            "max_packet_size": 0.0,
            "packet_size_p10": 0.0,
            "packet_size_p25": 0.0,
            "packet_size_p50": 0.0,
            "packet_size_p75": 0.0,
            "packet_size_p90": 0.0,
        }

    arr = np.array(packet_lengths, dtype=np.float64)

    return {
        "packet_count": float(len(arr)),
        "mean_packet_size": float(np.mean(arr)),
        "median_packet_size": float(np.median(arr)),
        "std_packet_size": float(np.std(arr)),
        "min_packet_size": float(np.min(arr)),
        "max_packet_size": float(np.max(arr)),
        "packet_size_p10": float(np.percentile(arr, 10)),
        "packet_size_p25": float(np.percentile(arr, 25)),
        "packet_size_p50": float(np.percentile(arr, 50)),
        "packet_size_p75": float(np.percentile(arr, 75)),
        "packet_size_p90": float(np.percentile(arr, 90)),
    }
