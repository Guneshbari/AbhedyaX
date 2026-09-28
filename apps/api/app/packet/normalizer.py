"""Normalize raw TShark JSON packet structures into canonical packet records.

Transforms heterogeneous TShark protocol trees into flat, strongly-typed
NormalizedPacket objects for consistent protocol and security analysis.
"""

from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List
from app.packet.fields import resolve_ike_version, IKEV2_EXCHANGE_TYPES, IKEV1_EXCHANGE_TYPES


@dataclass
class NormalizedPacket:
    frame_number: int
    timestamp: str
    length: int
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    src_port: Optional[int] = None
    dst_port: Optional[int] = None
    transport_protocol: Optional[str] = None
    application_protocol: Optional[str] = None
    ipsec_protocol: str = "None"  # "IKE", "ESP", "AH", "None"
    ike_version: Optional[str] = None
    exchange_type: Optional[str] = None
    spi: Optional[str] = None
    direction: str = "unknown"  # "inbound", "outbound", "unknown"
    raw_layers: Dict[str, Any] = field(default_factory=dict)


def normalize_tshark_packet(raw_pkt: Dict[str, Any], initial_src_ip: Optional[str] = None) -> NormalizedPacket:
    """Normalize a single raw TShark JSON packet structure.

    Args:
        raw_pkt: Raw dictionary from TShark -T json output.
        initial_src_ip: Optional reference IP to infer traffic direction.

    Returns:
        NormalizedPacket instance.
    """
    layers = raw_pkt.get("_source", {}).get("layers", {})
    frame = layers.get("frame", {})

    # Frame details
    frame_num = int(frame.get("frame.number", 0))
    time_iso = frame.get("frame.time_utc") or frame.get("frame.time") or ""
    frame_len = int(frame.get("frame.len", 0))
    protocols = frame.get("frame.protocols", "").lower()

    # Network Layer (IPv4 / IPv6)
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    ip_layer = layers.get("ip") or layers.get("ipv6", {})
    if "ip.src" in ip_layer:
        src_ip = ip_layer.get("ip.src")
        dst_ip = ip_layer.get("ip.dst")
    elif "ipv6.src" in ip_layer:
        src_ip = ip_layer.get("ipv6.src")
        dst_ip = ip_layer.get("ipv6.dst")

    # Transport Layer (UDP, TCP, Raw IP proto)
    src_port: Optional[int] = None
    dst_port: Optional[int] = None
    transport_protocol: Optional[str] = None

    if "udp" in layers:
        transport_protocol = "UDP"
        udp = layers.get("udp", {})
        try:
            src_port = int(udp.get("udp.srcport", 0))
            dst_port = int(udp.get("udp.dstport", 0))
        except (ValueError, TypeError):
            pass
    elif "tcp" in layers:
        transport_protocol = "TCP"
        tcp = layers.get("tcp", {})
        try:
            src_port = int(tcp.get("tcp.srcport", 0))
            dst_port = int(tcp.get("tcp.dstport", 0))
        except (ValueError, TypeError):
            pass
    elif "esp" in layers or "50" in protocols:
        transport_protocol = "ESP"
    elif "ah" in layers or "51" in protocols:
        transport_protocol = "AH"

    # Protocol Detection
    ipsec_protocol = "None"
    application_protocol: Optional[str] = None
    ike_version: Optional[str] = None
    exchange_type: Optional[str] = None
    spi: Optional[str] = None

    # Check for IKE / ISAKMP
    ike_layer = layers.get("ike") or layers.get("isakmp")
    if ike_layer:
        ipsec_protocol = "IKE"
        application_protocol = "IKE"

        raw_ver = (
            ike_layer.get("ike.version")
            or ike_layer.get("isakmp.version")
            or (ike_layer.get("ike.version_tree", {}).get("ike.mjver"))
        )
        ike_version = resolve_ike_version(raw_ver)

        # Exchange type
        raw_ex = ike_layer.get("ike.exchangetype") or ike_layer.get("isakmp.exchangetype")
        if raw_ex is not None:
            try:
                ex_int = int(raw_ex)
                if ike_version == "IKEv2":
                    exchange_type = IKEV2_EXCHANGE_TYPES.get(ex_int, f"Type {ex_int}")
                else:
                    exchange_type = IKEV1_EXCHANGE_TYPES.get(ex_int, f"Type {ex_int}")
            except (ValueError, TypeError):
                exchange_type = str(raw_ex)

        # SPI
        ispi = ike_layer.get("ike.ispi") or ike_layer.get("isakmp.ispi")
        rspi = ike_layer.get("ike.rspi") or ike_layer.get("isakmp.rspi")
        if ispi:
            clean_ispi = ispi.replace(":", "").replace("0x", "")
            clean_rspi = rspi.replace(":", "").replace("0x", "") if rspi else "0000000000000000"
            spi = f"i:{clean_ispi} r:{clean_rspi}"

    # Check for ESP (Direct IP proto 50 or UDP-encapsulated port 4500)
    elif "esp" in layers or "esp" in protocols:
        ipsec_protocol = "ESP"
        application_protocol = "ESP"
        esp = layers.get("esp", {})
        raw_spi = esp.get("esp.spi")
        if raw_spi:
            spi = raw_spi

    # Check for AH (Direct IP proto 51)
    elif "ah" in layers or "ah" in protocols:
        ipsec_protocol = "AH"
        application_protocol = "AH"
        ah = layers.get("ah", {})
        raw_spi = ah.get("ah.spi")
        if raw_spi:
            spi = raw_spi

    # Infer Direction
    direction = "unknown"
    if initial_src_ip and src_ip:
        if src_ip == initial_src_ip:
            direction = "outbound"
        elif dst_ip == initial_src_ip:
            direction = "inbound"

    return NormalizedPacket(
        frame_number=frame_num,
        timestamp=time_iso,
        length=frame_len,
        src_ip=src_ip,
        dst_ip=dst_ip,
        src_port=src_port,
        dst_port=dst_port,
        transport_protocol=transport_protocol,
        application_protocol=application_protocol,
        ipsec_protocol=ipsec_protocol,
        ike_version=ike_version,
        exchange_type=exchange_type,
        spi=spi,
        direction=direction,
        raw_layers=layers,
    )


def normalize_tshark_packets(raw_packets: List[Dict[str, Any]]) -> List[NormalizedPacket]:
    """Normalize a full sequence of raw TShark packets."""
    normalized: List[NormalizedPacket] = []
    initial_src: Optional[str] = None

    for raw_pkt in raw_packets:
        pkt = normalize_tshark_packet(raw_pkt, initial_src_ip=initial_src)
        if initial_src is None and pkt.src_ip:
            initial_src = pkt.src_ip
        normalized.append(pkt)

    return normalized
