"""Unified feature extraction pipeline for encrypted IPsec traffic classification."""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import numpy as np

from services.ml.src.config.settings import CANONICAL_FEATURES
from services.ml.src.features.burst_features import compute_direction_and_burst_features
from services.ml.src.features.flow_features import reconstruct_ipsec_flows
from services.ml.src.features.packet_features import compute_packet_size_features
from services.ml.src.features.temporal_features import compute_temporal_features

logger = logging.getLogger("abhedyax.ml.features")


class UnifiedFeatureExtractor:
    """
    Extracts canonical 28-feature metadata vectors from encrypted IPsec packet streams.
    Adheres strictly to zero-payload inspection rules.
    """

    def __init__(self, canonical_features: Optional[List[str]] = None):
        self.feature_names = canonical_features or CANONICAL_FEATURES

    def extract_from_packets(
        self, normalized_packets: List[Any]
    ) -> Dict[str, float]:
        """
        Extract features from a list of NormalizedPacket objects or dictionaries.
        Focuses on encrypted user traffic (ESP / UDP 4500) while incorporating flow context.
        """
        if not normalized_packets:
            return self._empty_feature_dict()

        # Reconstruct flows
        flows = reconstruct_ipsec_flows(normalized_packets)

        # Select the primary traffic flow (largest total bytes)
        primary_flow = max(flows.values(), key=lambda f: f.total_bytes) if flows else None

        if not primary_flow or not primary_flow.packets:
            return self._empty_feature_dict()

        # Extract packet lengths, timestamps, direction records
        lengths = [p[1] for p in primary_flow.packets]
        timestamps = [p[0] for p in primary_flow.packets]
        dir_records = [(p[0], p[1], p[2]) for p in primary_flow.packets]
        total_bytes = sum(lengths)

        # 1. Packet features
        pkt_feats = compute_packet_size_features(lengths)

        # 2. Temporal features
        temp_feats = compute_temporal_features(timestamps, total_bytes)

        # 3. Burst & Direction features
        burst_feats = compute_direction_and_burst_features(
            dir_records, flow_duration=temp_feats.get("flow_duration", 0.0)
        )

        # Merge all extracted features
        combined = {**pkt_feats, **temp_feats, **burst_feats}

        # Align to canonical feature set and handle NaNs
        aligned: Dict[str, float] = {}
        for feat in self.feature_names:
            val = combined.get(feat, 0.0)
            if val is None or np.isnan(val) or np.isinf(val):
                val = 0.0
            aligned[feat] = float(val)

        return aligned

    def extract_from_pcap(self, pcap_path: Union[str, Path]) -> Dict[str, float]:
        """Extract features directly from a PCAP file using safe header parsing."""
        from scapy.all import rdpcap, IP, IPv6, UDP  # type: ignore

        path = Path(pcap_path)
        if not path.exists():
            logger.warning("PCAP path %s does not exist", pcap_path)
            return self._empty_feature_dict()

        try:
            packets = rdpcap(str(path))
            normalized = []
            for pkt in packets:
                ts = float(pkt.time)
                length = len(pkt)
                src = "0.0.0.0"
                dst = "0.0.0.0"
                proto = "ESP"
                spi = None

                if IP in pkt:
                    src = pkt[IP].src
                    dst = pkt[IP].dst
                    proto = "ESP" if pkt[IP].proto == 50 else str(pkt[IP].proto)
                elif IPv6 in pkt:
                    src = pkt[IPv6].src
                    dst = pkt[IPv6].dst
                    proto = "ESP" if pkt[IPv6].nh == 50 else str(pkt[IPv6].nh)

                # UDP encapsulated ESP / NAT-T
                if UDP in pkt and (pkt[UDP].dport == 4500 or pkt[UDP].sport == 4500):
                    proto = "NAT-T-ESP"

                normalized.append({
                    "ip_src": src,
                    "ip_dst": dst,
                    "timestamp": ts,
                    "length": length,
                    "protocol": proto,
                    "spi": spi,
                })

            return self.extract_from_packets(normalized)
        except Exception as e:
            logger.error("Failed to parse PCAP %s: %s", pcap_path, e)
            return self._empty_feature_dict()

    def to_vector(self, feature_dict: Dict[str, float]) -> np.ndarray:
        """Convert a feature dictionary into a 1D numpy array aligned with feature_names."""
        return np.array([feature_dict.get(k, 0.0) for k in self.feature_names], dtype=np.float64)

    def _empty_feature_dict(self) -> Dict[str, float]:
        return {feat: 0.0 for feat in self.feature_names}
