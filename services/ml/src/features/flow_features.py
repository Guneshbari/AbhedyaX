"""Flow aggregation and session reconstruction from encrypted IPsec packets."""

from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple


class FlowRecord:
    """Group of packets associated with a single bidirectional encrypted IPsec session."""

    def __init__(self, key: Tuple[str, ...], initiator_ip: Optional[str] = None):
        self.key = key
        self.initiator_ip = initiator_ip
        # List of (timestamp, length, direction: 0=fwd, 1=rev, protocol, spi)
        self.packets: List[Tuple[float, int, int, str, Optional[str]]] = []

    def add_packet(
        self,
        timestamp: float,
        length: int,
        src_ip: str,
        dst_ip: str,
        protocol: str,
        spi: Optional[str] = None,
    ) -> None:
        if self.initiator_ip is None:
            self.initiator_ip = src_ip

        # Direction: 0 if from initiator, 1 otherwise
        direction = 0 if src_ip == self.initiator_ip else 1
        self.packets.append((timestamp, length, direction, protocol, spi))

    @property
    def packet_count(self) -> int:
        return len(self.packets)

    @property
    def total_bytes(self) -> int:
        return sum(p[1] for p in self.packets)


def reconstruct_ipsec_flows(
    normalized_packets: List[Any],
) -> Dict[str, FlowRecord]:
    """
    Reconstruct bidirectional encrypted sessions from normalized packets.
    Groups packets by IP pair and ESP SPI.
    """
    flows: Dict[str, FlowRecord] = {}

    for pkt in normalized_packets:
        # Support NormalizedPacket dataclass or plain dict
        src = getattr(pkt, "ip_src", None) or (pkt.get("ip_src") if isinstance(pkt, dict) else "") or "0.0.0.0"
        dst = getattr(pkt, "ip_dst", None) or (pkt.get("ip_dst") if isinstance(pkt, dict) else "") or "0.0.0.0"
        ts = getattr(pkt, "timestamp", 0.0) or (pkt.get("timestamp", 0.0) if isinstance(pkt, dict) else 0.0)
        length = getattr(pkt, "length", 0) or (pkt.get("length", 0) if isinstance(pkt, dict) else 0)
        proto = getattr(pkt, "protocol", "ESP") or (pkt.get("protocol", "ESP") if isinstance(pkt, dict) else "ESP")
        spi = getattr(pkt, "spi", None) or (pkt.get("spi") if isinstance(pkt, dict) else None)

        # Canonical symmetrical key: sorted IP endpoints
        ip_pair = tuple(sorted([src, dst]))
        flow_id = f"{ip_pair[0]}_{ip_pair[1]}_{spi or proto}"

        if flow_id not in flows:
            flows[flow_id] = FlowRecord(key=ip_pair, initiator_ip=src)

        flows[flow_id].add_packet(
            timestamp=float(ts),
            length=int(length),
            src_ip=src,
            dst_ip=dst,
            protocol=proto,
            spi=spi,
        )

    return flows
