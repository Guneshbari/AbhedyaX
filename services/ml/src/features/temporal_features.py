"""Temporal and inter-arrival time (IAT) feature extraction."""

from typing import Dict, Sequence
import numpy as np


def compute_temporal_features(
    timestamps: Sequence[float], total_bytes: float
) -> Dict[str, float]:
    """
    Extract flow timing, pacing, and rate features from packet arrival times.
    """
    if len(timestamps) < 2:
        return {
            "flow_duration": 0.0,
            "mean_inter_arrival_time": 0.0,
            "std_inter_arrival_time": 0.0,
            "median_inter_arrival_time": 0.0,
            "packet_rate": 0.0,
            "byte_rate": 0.0,
            "iat_p25": 0.0,
            "iat_p50": 0.0,
            "iat_p75": 0.0,
        }

    ts = np.array(timestamps, dtype=np.float64)
    # Ensure monotonically increasing
    ts = np.sort(ts)

    duration = float(ts[-1] - ts[0])
    if duration <= 0.0:
        duration = 1e-4  # Avoid divide-by-zero for sub-millisecond bursts

    iats = np.diff(ts)
    if len(iats) == 0:
        iats = np.array([0.0])

    packet_rate = float(len(ts) / duration)
    byte_rate = float(total_bytes / duration)

    return {
        "flow_duration": float(duration),
        "mean_inter_arrival_time": float(np.mean(iats)),
        "std_inter_arrival_time": float(np.std(iats)),
        "median_inter_arrival_time": float(np.median(iats)),
        "packet_rate": float(packet_rate),
        "byte_rate": float(byte_rate),
        "iat_p25": float(np.percentile(iats, 25)),
        "iat_p50": float(np.percentile(iats, 50)),
        "iat_p75": float(np.percentile(iats, 75)),
    }
