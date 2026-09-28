"""Directionality and traffic burst feature extraction."""

from typing import Dict, List, Sequence, Tuple
import numpy as np


def compute_direction_and_burst_features(
    packets: Sequence[Tuple[float, int, int]],  # (timestamp, length, direction: 0 for fwd, 1 for rev)
    flow_duration: float,
    burst_threshold_seconds: float = 0.05,
) -> Dict[str, float]:
    """
    Extract direction volume distributions and micro-burst characteristics.
    direction == 0: Forward (Initiator -> Responder)
    direction == 1: Reverse (Responder -> Initiator)
    """
    if not packets:
        return {
            "forward_packet_count": 0.0,
            "reverse_packet_count": 0.0,
            "forward_bytes": 0.0,
            "reverse_bytes": 0.0,
            "direction_ratio": 0.0,
            "burst_count": 0.0,
            "mean_burst_size": 0.0,
            "burst_rate": 0.0,
        }

    fwd_pkts = 0
    rev_pkts = 0
    fwd_bytes = 0
    rev_bytes = 0

    bursts: List[int] = []
    current_burst_len = 0
    last_ts = None
    last_dir = None

    for ts, length, direction in packets:
        if direction == 0:
            fwd_pkts += 1
            fwd_bytes += length
        else:
            rev_pkts += 1
            rev_bytes += length

        # Micro-burst detection
        if last_ts is None:
            current_burst_len = 1
        else:
            dt = ts - last_ts
            if direction == last_dir and dt <= burst_threshold_seconds:
                current_burst_len += 1
            else:
                bursts.append(current_burst_len)
                current_burst_len = 1

        last_ts = ts
        last_dir = direction

    if current_burst_len > 0:
        bursts.append(current_burst_len)

    burst_count = float(len(bursts))
    mean_burst_size = float(np.mean(bursts)) if bursts else 0.0
    safe_duration = max(flow_duration, 0.01)
    burst_rate = float(burst_count / safe_duration)

    direction_ratio = float(fwd_bytes / (rev_bytes + 1.0))

    return {
        "forward_packet_count": float(fwd_pkts),
        "reverse_packet_count": float(rev_pkts),
        "forward_bytes": float(fwd_bytes),
        "reverse_bytes": float(rev_bytes),
        "direction_ratio": float(direction_ratio),
        "burst_count": float(burst_count),
        "mean_burst_size": float(mean_burst_size),
        "burst_rate": float(burst_rate),
    }
