"""AbhedyaX Analysis Service orchestrating Mock and Real Analysis Engines.

Provides a unified gateway for analysis creation, lifecycle tracking, and result retrieval.
Ensures zero silent fallback between simulation and real packet analysis.
"""

from typing import Optional
from app.engines.base import AnalysisEngine
from app.engines.mock import MockAnalysisEngine
from app.engines.real import RealAnalysisEngine
from app.packet.tshark import is_tshark_available, TSharkNotFoundError
from app.models.analysis import (
    CreateAnalysisRequest,
    CreateAnalysisResponse,
    AnalysisStatusResponse,
    AnalysisResult,
)
from app.config import settings
from app.core.logging import logger


class AnalysisService:
    """Service layer coordinating protocol analysis requests across engines."""

    def __init__(
        self,
        mock_engine: Optional[MockAnalysisEngine] = None,
        real_engine: Optional[RealAnalysisEngine] = None,
    ):
        self.mock_engine = mock_engine or MockAnalysisEngine()
        self.real_engine = real_engine or RealAnalysisEngine()

    def select_engine(
        self,
        source_type: str,
        engine_override: Optional[str] = None,
    ) -> AnalysisEngine:
        """Select appropriate engine based on source type and configuration."""
        configured_engine = engine_override or settings.analysis_engine.lower()

        # PCAP source or explicit real configuration selects RealAnalysisEngine
        if source_type == "pcap" or configured_engine == "real":
            if not is_tshark_available():
                raise TSharkNotFoundError(
                    f"Real packet analysis requested but TShark binary '{settings.tshark_binary}' "
                    "was not found on the server. Please install Wireshark CLI."
                )
            return self.real_engine

        # Standard simulation source selects MockAnalysisEngine
        return self.mock_engine

    async def create_analysis(
        self,
        request: CreateAnalysisRequest,
        pcap_path: Optional[str] = None,
        engine_override: Optional[str] = None,
    ) -> CreateAnalysisResponse:
        """Create a new analysis session using the appropriate engine."""
        engine = self.select_engine(
            source_type=request.source_type,
            engine_override=engine_override,
        )

        logger.info(
            f"Dispatching analysis (source_type='{request.source_type}') to engine '{engine.__class__.__name__}'"
        )

        return await engine.create_analysis(
            source_type=request.source_type,
            scenario_id=request.scenario_id,
            file_name=request.file_name,
            pcap_path=pcap_path,
        )

    async def get_status(self, analysis_id: str) -> Optional[AnalysisStatusResponse]:
        """Query status across real and mock engines."""
        # Check real engine first
        status = await self.real_engine.get_status(analysis_id)
        if status is not None:
            return status

        # Fall back to mock engine
        return await self.mock_engine.get_status(analysis_id)

    async def get_result(self, analysis_id: str) -> Optional[AnalysisResult]:
        """Query result across real and mock engines."""
        res = await self.real_engine.get_result(analysis_id)
        if res is not None:
            return res

        return await self.mock_engine.get_result(analysis_id)


# Global singleton instance for app routes
analysis_service = AnalysisService()
