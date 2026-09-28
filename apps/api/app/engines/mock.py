import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.engines.base import AnalysisEngine
from app.models.analysis import (
    CreateAnalysisResponse,
    AnalysisStatusResponse,
    AnalysisResult,
    AnalysisStatusType,
)
from app.data.scenarios import build_analysis_result, SCENARIOS
from app.config import settings
from app.core.logging import logger

PROCESSING_STEPS = [
    {"id": "load_capture", "label": "Load Capture", "progress": 15},
    {"id": "detect_ipsec", "label": "Detect IPsec", "progress": 30},
    {"id": "parse_ike", "label": "Parse IKE", "progress": 45},
    {"id": "analyze_esp", "label": "Analyze ESP", "progress": 60},
    {"id": "classify_traffic", "label": "Classify Traffic", "progress": 75},
    {"id": "security_assessment", "label": "Assess Security Posture", "progress": 90},
    {"id": "complete", "label": "Analysis Complete", "progress": 100},
]


class MockAnalysisEngine(AnalysisEngine):
    """
    Deterministic Mock Analysis Engine for Phase 1 simulation and frontend UX validation.
    Maintains the exact canonical API contract that the subsequent RealAnalysisEngine
    (TShark/Scapy/Zeek/ML) will fulfill.
    """

    def __init__(self, step_delay: float | None = None):
        self.step_delay = (
            step_delay if step_delay is not None else settings.step_delay_seconds
        )
        self._id_counter = 429
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._results: Dict[str, AnalysisResult] = {}
        self._tasks: Dict[str, asyncio.Task] = {}

    def _generate_id(self) -> str:
        aid = f"AX-2026-00{self._id_counter}"
        self._id_counter += 1
        return aid

    async def create_analysis(
        self,
        source_type: str,
        scenario_id: Optional[str] = None,
        file_name: Optional[str] = None,
        pcap_path: Optional[str] = None,
        **kwargs,
    ) -> CreateAnalysisResponse:
        resolved_scenario = scenario_id or "secure-enterprise"
        if resolved_scenario not in SCENARIOS:
            resolved_scenario = "secure-enterprise"

        analysis_id = self._generate_id()
        now_iso = datetime.now(timezone.utc).isoformat()

        self._sessions[analysis_id] = {
            "analysis_id": analysis_id,
            "status": "queued",
            "progress": 0,
            "current_step": "Queued in analysis pipeline",
            "message": "Analysis request received and queued.",
            "source_type": source_type,
            "scenario_id": resolved_scenario,
            "file_name": file_name,
            "created_at": now_iso,
            "completed_at": None,
        }

        # Spawn background simulation worker
        task = asyncio.create_task(self._simulate_processing(analysis_id))
        self._tasks[analysis_id] = task

        logger.info(
            f"Created mock analysis session {analysis_id} for scenario '{resolved_scenario}'"
        )

        return CreateAnalysisResponse(
            analysis_id=analysis_id,
            status="queued",
            source_type=source_type,  # type: ignore
        )

    async def _simulate_processing(self, analysis_id: str) -> None:
        try:
            session = self._sessions.get(analysis_id)
            if not session:
                return

            session["status"] = "processing"

            for step in PROCESSING_STEPS:
                session["progress"] = step["progress"]
                session["current_step"] = step["label"]
                session["message"] = f"Executing module: {step['label']}..."

                if self.step_delay > 0:
                    await asyncio.sleep(self.step_delay)

            # Analysis complete: produce canonical AnalysisResult
            now_iso = datetime.now(timezone.utc).isoformat()
            session["status"] = "completed"
            session["progress"] = 100
            session["current_step"] = "Analysis Complete"
            session["message"] = "Analysis completed successfully."
            session["completed_at"] = now_iso

            result = build_analysis_result(
                analysis_id=analysis_id,
                scenario_id=session["scenario_id"],
                source_type=session["source_type"],
                file_name=session["file_name"],
                created_at=session["created_at"],
                completed_at=now_iso,
            )
            self._results[analysis_id] = result

            logger.info(f"Mock analysis session {analysis_id} finished successfully.")
        except Exception as e:
            logger.error(f"Error processing session {analysis_id}: {e}")
            if analysis_id in self._sessions:
                self._sessions[analysis_id]["status"] = "failed"
                self._sessions[analysis_id]["message"] = str(e)

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
