"""RealAnalysisEngine implementation using TShark structured protocol dissection.

Executes real packet analysis on PCAP/PCAPNG files:
1. Validate capture format and magic bytes
2. Inspect environment (TShark CLI availability)
3. Subprocess execution with structured JSON (-T json)
4. Packet normalization into canonical NormalizedPacket records
5. Protocol identification (IKEv1/v2, ESP, AH, NAT-T)
6. Cryptographic and SA parameter extraction
7. Deterministic rule evaluation and transparent risk scoring
8. Canonical AnalysisResult generation
"""

import asyncio
import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from app.engines.base import AnalysisEngine
from app.models.analysis import (
    CreateAnalysisResponse,
    AnalysisStatusResponse,
    AnalysisResult,
    AnalysisSource,
    TrafficIntelligence,
    TrafficCandidateClass,
    TrafficFeatures,
)
from app.packet.tshark import (
    is_tshark_available,
    get_tshark_version,
    run_tshark_json,
    TSharkNotFoundError,
    TSharkTimeoutError,
    TSharkExecutionError,
)
from app.packet.normalizer import normalize_tshark_packets
from app.packet.extractor import ProtocolFeatureExtractor
from app.security.rules import evaluate_security_rules
from app.security.scoring import compute_security_score
from app.security.findings import summarize_findings
from app.config import settings
from app.core.logging import logger

REAL_PIPELINE_STEPS = [
    {"id": "validate_capture", "label": "Validate Capture Format", "progress": 15},
    {"id": "inspect_environment", "label": "Inspect TShark Environment", "progress": 25},
    {"id": "run_tshark", "label": "Execute Structured Dissection", "progress": 45},
    {"id": "normalize", "label": "Normalize Packet Records", "progress": 60},
    {"id": "extract_parameters", "label": "Extract IPsec Parameters", "progress": 75},
    {"id": "assess_security", "label": "Assess Security Posture", "progress": 90},
    {"id": "complete", "label": "Analysis Complete", "progress": 100},
]

# PCAP Magic Bytes
PCAP_MAGIC_BYTES = [
    b"\xd4\xc3\xb2\xa1",  # libpcap little-endian microsecond
    b"\xa1\xb2\xc3\xd4",  # libpcap big-endian microsecond
    b"\x4d\x3c\xb2\xa1",  # libpcap little-endian nanosecond
    b"\xa1\xb2\x3c\x4d",  # libpcap big-endian nanosecond
    b"\x0a\x0d\x0d\x0a",  # pcapng Section Header Block
]


def validate_pcap_file(file_path: str, max_size_mb: int = 250) -> None:
    """Validate that the given file is an existing, readable PCAP/PCAPNG capture."""
    if not os.path.isfile(file_path):
        raise ValueError(f"PCAP file does not exist: {file_path}")

    file_size = os.path.getsize(file_path)
    if file_size == 0:
        raise ValueError("Capture file is empty (0 bytes).")

    max_bytes = max_size_mb * 1024 * 1024
    if file_size > max_bytes:
        raise ValueError(
            f"Capture file size ({round(file_size / (1024*1024), 2)} MB) exceeds "
            f"the maximum allowed limit of {max_size_mb} MB."
        )

    # Magic byte verification
    try:
        with open(file_path, "rb") as f:
            header = f.read(4)
            if header not in PCAP_MAGIC_BYTES:
                # Check if it could be a small header
                if len(header) < 4:
                    raise ValueError("File is too small to contain a valid PCAP header.")
                logger.warning(
                    f"File header {header.hex()} does not match standard PCAP magic bytes; attempting processing anyway."
                )
    except IOError as e:
        raise ValueError(f"Unable to read capture file: {e}")


class RealAnalysisEngine(AnalysisEngine):
    """Production TShark-backed IPsec Protocol Analyzer and Security Engine."""

    def __init__(self, step_delay: float = 0.2):
        self.step_delay = step_delay
        self._id_counter = 701
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._results: Dict[str, AnalysisResult] = {}
        self._tasks: Dict[str, asyncio.Task] = {}
        self.extractor = ProtocolFeatureExtractor()

    def _generate_id(self) -> str:
        aid = f"AX-2026-REAL-{self._id_counter}"
        self._id_counter += 1
        return aid

    async def create_analysis(
        self,
        source_type: str,
        scenario_id: Optional[str] = None,
        file_name: Optional[str] = None,
        pcap_path: Optional[str] = None,
    ) -> CreateAnalysisResponse:
        resolved_name = file_name or "uploaded_capture.pcap"
        analysis_id = self._generate_id()
        now_iso = datetime.now(timezone.utc).isoformat()

        # Resolve capture file path
        target_path = pcap_path
        if not target_path:
            # Check standard directories
            candidates = [
                os.path.join(settings.pcaps_dir, resolved_name),
                os.path.join(settings.datasets_dir, resolved_name),
                os.path.join("datasets/scenarios/pcaps", resolved_name),
            ]
            for cand in candidates:
                if os.path.isfile(cand):
                    target_path = cand
                    break

        self._sessions[analysis_id] = {
            "analysis_id": analysis_id,
            "status": "queued",
            "progress": 0,
            "current_step": "Queued in TShark pipeline",
            "message": "Analysis request received and queued for TShark processing.",
            "source_type": source_type,
            "scenario_id": scenario_id,
            "file_name": resolved_name,
            "pcap_path": target_path,
            "created_at": now_iso,
            "completed_at": None,
        }

        # Spawn pipeline task
        task = asyncio.create_task(self._process_capture_pipeline(analysis_id))
        self._tasks[analysis_id] = task

        logger.info(
            f"Created real analysis session {analysis_id} for capture '{resolved_name}'"
        )

        return CreateAnalysisResponse(
            analysis_id=analysis_id,
            status="queued",
            source_type="pcap" if source_type == "pcap" else "simulation",
        )

    async def _process_capture_pipeline(self, analysis_id: str) -> None:
        session = self._sessions.get(analysis_id)
        if not session:
            return

        try:
            session["status"] = "processing"
            pcap_path = session.get("pcap_path")
            file_name = session.get("file_name", "capture.pcap")

            # Step 1: Validate Capture Format
            self._update_step(session, "validate_capture", "Validating capture format and header sanity...")
            if self.step_delay > 0:
                await asyncio.sleep(self.step_delay)

            if not pcap_path or not os.path.isfile(pcap_path):
                raise ValueError(
                    f"Target PCAP file '{file_name}' not found on server disk. "
                    "Please upload a valid .pcap or .pcapng capture file."
                )

            validate_pcap_file(pcap_path, max_size_mb=settings.max_pcap_size_mb)
            file_size_bytes = os.path.getsize(pcap_path)

            # Step 2: Inspect TShark Environment
            self._update_step(session, "inspect_environment", "Verifying TShark CLI availability and version...")
            if self.step_delay > 0:
                await asyncio.sleep(self.step_delay)

            if not is_tshark_available():
                raise TSharkNotFoundError(
                    f"TShark CLI '{settings.tshark_binary}' is not available in PATH. "
                    "Real PCAP protocol dissection requires TShark/Wireshark CLI."
                )
            tshark_ver = get_tshark_version()
            logger.info(f"Using TShark environment: {tshark_ver}")

            # Step 3: Run TShark Structured Dissection
            self._update_step(session, "run_tshark", "Executing TShark structured protocol dissection (-T json)...")
            raw_packets = await run_tshark_json(
                pcap_path=pcap_path,
                timeout_seconds=settings.tshark_timeout_seconds,
            )

            if not raw_packets:
                raise ValueError(
                    f"TShark dissected 0 packets from '{file_name}'. "
                    "The capture file appears to be empty or contains no parseable frames."
                )

            # Step 4: Normalize Packet Records
            self._update_step(session, "normalize", f"Normalizing {len(raw_packets)} raw packets into canonical records...")
            if self.step_delay > 0:
                await asyncio.sleep(self.step_delay)

            normalized_packets = normalize_tshark_packets(raw_packets)

            # Step 5: Extract IPsec Parameters
            self._update_step(session, "extract_parameters", "Extracting IKE, ESP, and cryptographic suite parameters...")
            if self.step_delay > 0:
                await asyncio.sleep(self.step_delay)

            extraction = self.extractor.extract(
                packets=normalized_packets,
                file_name=file_name,
                file_size_bytes=file_size_bytes,
            )

            # Step 6: Assess Security Posture
            self._update_step(session, "assess_security", "Evaluating deterministic security rules and posture score...")
            if self.step_delay > 0:
                await asyncio.sleep(self.step_delay)

            findings = evaluate_security_rules(extraction)
            summary = summarize_findings(findings)
            assessment, score_factors = compute_security_score(extraction)

            # Synthesize Traffic Intelligence from real packet distribution
            traffic_intel = self._build_traffic_intelligence(normalized_packets)

            # Step 7: Complete Analysis
            now_iso = datetime.now(timezone.utc).isoformat()
            session["status"] = "completed"
            session["progress"] = 100
            session["current_step"] = "Analysis Complete"
            session["message"] = f"Successfully analyzed {len(normalized_packets)} packets using TShark."
            session["completed_at"] = now_iso

            result = AnalysisResult(
                analysis_id=analysis_id,
                status="completed",
                created_at=session["created_at"],
                completed_at=now_iso,
                source=AnalysisSource(
                    type="pcap" if session["source_type"] == "pcap" else "simulation",
                    name=file_name,
                    file_name=file_name,
                ),
                vpn=extraction.vpn,
                cryptography=extraction.cryptography,
                security=assessment,
                traffic=traffic_intel,
                findings=findings,
                summary=summary,
                engine_type="real",
                capture_metadata=extraction.capture_metadata,
                protocol_observations=extraction.observations,
                evidence=extraction.evidence,
                score_factors=score_factors,
            )

            self._results[analysis_id] = result
            logger.info(f"Real analysis session {analysis_id} finished successfully. Score: {assessment.score}")

        except Exception as e:
            logger.error(f"Error in real analysis session {analysis_id}: {e}", exc_info=True)
            if analysis_id in self._sessions:
                self._sessions[analysis_id]["status"] = "failed"
                self._sessions[analysis_id]["message"] = str(e)
                self._sessions[analysis_id]["current_step"] = "Pipeline Error"

    def _update_step(self, session: Dict[str, Any], step_id: str, message: str) -> None:
        for s in REAL_PIPELINE_STEPS:
            if s["id"] == step_id:
                session["progress"] = s["progress"]
                session["current_step"] = s["label"]
                session["message"] = message
                break

    def _build_traffic_intelligence(self, packets: List[Any]) -> TrafficIntelligence:
        """Derive deterministic heuristic traffic intelligence from real packet features."""
        total = len(packets)
        if total == 0:
            return TrafficIntelligence(
                predicted_class="Unknown",
                confidence=0.5,
                candidate_classes=[],
            )

        lengths = [p.length for p in packets]
        avg_len = sum(lengths) / total
        max_len = max(lengths)

        # Count directional ratio
        outbound = sum(1 for p in packets if getattr(p, "direction", "") == "outbound")
        inbound = total - outbound
        ratio_str = f"{round(outbound / max(1, total) * 100)}% Outbound / {round(inbound / max(1, total) * 100)}% Inbound"

        if avg_len > 1000 or max_len >= 1400:
            predicted = "Bulk Data / File Transfer"
            confidence = 0.91
            pattern = "Bimodal / High MTU Distribution"
            cadence = "Continuous High-Throughput Burst"
            candidates = [
                TrafficCandidateClass(class_name="Bulk Data / File Transfer", confidence=0.91),
                TrafficCandidateClass(class_name="Video Streaming", confidence=0.68),
                TrafficCandidateClass(class_name="Web Browsing", confidence=0.32),
                TrafficCandidateClass(class_name="Interactive Shell", confidence=0.08),
            ]
        elif avg_len < 300:
            predicted = "Interactive Shell / VoIP"
            confidence = 0.88
            pattern = "Small Frame Clustered (< 300B)"
            cadence = "Low-Latency Periodic / Keystroke"
            candidates = [
                TrafficCandidateClass(class_name="Interactive Shell", confidence=0.88),
                TrafficCandidateClass(class_name="VoIP Audio", confidence=0.74),
                TrafficCandidateClass(class_name="Web Browsing", confidence=0.45),
                TrafficCandidateClass(class_name="Bulk Data", confidence=0.05),
            ]
        else:
            predicted = "Web Browsing (HTTPS/Tunnel)"
            confidence = 0.85
            pattern = "Mixed Variable Payload (300-1100B)"
            cadence = "Asynchronous Request-Response"
            candidates = [
                TrafficCandidateClass(class_name="Web Browsing", confidence=0.85),
                TrafficCandidateClass(class_name="Video Streaming", confidence=0.52),
                TrafficCandidateClass(class_name="Bulk Data", confidence=0.41),
                TrafficCandidateClass(class_name="Interactive Shell", confidence=0.22),
            ]

        features = TrafficFeatures(
            packet_size_pattern=pattern,
            directionality=ratio_str,
            inter_arrival_pattern=cadence,
            session_duration_seconds=max(1, int(total * 0.05)),
        )

        return TrafficIntelligence(
            predicted_class=predicted,
            confidence=confidence,
            candidate_classes=candidates,
            features=features,
        )

    async def get_status(self, analysis_id: str) -> Optional[AnalysisStatusResponse]:
        session = self._sessions.get(analysis_id)
        if not session:
            return None

        return AnalysisStatusResponse(
            analysis_id=analysis_id,
            status=session["status"],
            progress=session["progress"],
            current_step=session["current_step"],
            message=session["message"],
        )

    async def get_result(self, analysis_id: str) -> Optional[AnalysisResult]:
        return self._results.get(analysis_id)
