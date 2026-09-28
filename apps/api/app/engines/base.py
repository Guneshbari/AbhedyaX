"""Base Analysis Engine interface for AbhedyaX.

Both MockAnalysisEngine and RealAnalysisEngine implement this canonical interface,
ensuring consistent contract and behavior across both simulated and real packet capture analysis.
"""

from abc import ABC, abstractmethod
from typing import Optional
from app.models.analysis import (
    CreateAnalysisResponse,
    AnalysisStatusResponse,
    AnalysisResult,
)


class AnalysisEngine(ABC):
    """Abstract base class for all AbhedyaX protocol analysis engines."""

    @abstractmethod
    async def create_analysis(
        self,
        source_type: str,
        scenario_id: Optional[str] = None,
        file_name: Optional[str] = None,
        pcap_path: Optional[str] = None,
    ) -> CreateAnalysisResponse:
        """Initialize an analysis session and begin background processing."""
        pass

    @abstractmethod
    async def get_status(self, analysis_id: str) -> Optional[AnalysisStatusResponse]:
        """Retrieve the current processing status and progress for an analysis."""
        pass

    @abstractmethod
    async def get_result(self, analysis_id: str) -> Optional[AnalysisResult]:
        """Retrieve the completed AnalysisResult or None if still running or not found."""
        pass

    @abstractmethod
    async def list_results(self) -> list[AnalysisResult]:
        """Retrieve all completed AnalysisResults."""
        pass
