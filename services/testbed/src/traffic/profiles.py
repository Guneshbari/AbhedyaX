"""Traffic profile definitions for controlled IPsec traffic injection."""

from datetime import datetime
from typing import Dict, Literal, Optional
from pydantic import BaseModel, Field

TrafficClass = Literal["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"]


class TrafficProfileSpec(BaseModel):
    """Specification of a controlled traffic generation pattern."""

    name: TrafficClass
    description: str
    generator_type: str
    packet_pattern: str
    default_duration_seconds: int = 30
    payload_size_bytes: int = 64
    interval_seconds: float = 1.0
    protocol: Literal["icmp", "tcp", "udp"] = "udp"


class TrafficExecutionRecord(BaseModel):
    """Telemetry recorded from a traffic generation execution."""

    profile_name: TrafficClass
    start_time: str
    end_time: str
    duration_seconds: float
    packets_transmitted: int
    bytes_transmitted: int
    packets_received: int
    bytes_received: int
    loss_rate: float = 0.0
    target_ip: str
    target_port: Optional[int] = None


TRAFFIC_PROFILES: Dict[TrafficClass, TrafficProfileSpec] = {
    "ICMP": TrafficProfileSpec(
        name="ICMP",
        description="Low-rate diagnostic ping probe simulating network telemetry and heartbeat keep-alive packets.",
        generator_type="ping / raw ICMP",
        packet_pattern="Periodic small packets (64 bytes, 1 Hz)",
        default_duration_seconds=30,
        payload_size_bytes=64,
        interval_seconds=1.0,
        protocol="icmp",
    ),
    "Web": TrafficProfileSpec(
        name="Web",
        description="Repeated HTTP/HTTPS web resource fetches to internal controlled web server.",
        generator_type="curl / HTTP client",
        packet_pattern="Burst-like request and response transfer with variable document payloads",
        default_duration_seconds=30,
        payload_size_bytes=1024,
        interval_seconds=2.0,
        protocol="tcp",
    ),
    "Email": TrafficProfileSpec(
        name="Email",
        description="Burst-oriented client-server communication simulating SMTP/IMAP protocol transactions.",
        generator_type="Controlled TCP client-server",
        packet_pattern="Intermittent request-response bursts with moderate payload length",
        default_duration_seconds=30,
        payload_size_bytes=512,
        interval_seconds=3.0,
        protocol="tcp",
    ),
    "VoIP": TrafficProfileSpec(
        name="VoIP",
        description="Real-time Voice over IP audio stream simulating bidirectional G.711 / Opus encoded speech.",
        generator_type="Controlled UDP generator",
        packet_pattern="Consistent small bidirectional UDP frames (160-200 bytes every 20ms)",
        default_duration_seconds=30,
        payload_size_bytes=172,
        interval_seconds=0.02,
        protocol="udp",
    ),
    "Video": TrafficProfileSpec(
        name="Video",
        description="High-throughput sustained media streaming simulating live video feed or conference stream.",
        generator_type="iperf3 / UDP streaming generator",
        packet_pattern="Sustained high-bitrate packet train with large MTU-bounded frames",
        default_duration_seconds=30,
        payload_size_bytes=1420,
        interval_seconds=0.005,
        protocol="udp",
    ),
    "Messaging": TrafficProfileSpec(
        name="Messaging",
        description="Short interactive bursty message exchanges simulating corporate chat or telemetry.",
        generator_type="Controlled TCP client-server",
        packet_pattern="Short asynchronous textual bursts with idle intervals",
        default_duration_seconds=30,
        payload_size_bytes=128,
        interval_seconds=2.5,
        protocol="tcp",
    ),
}
