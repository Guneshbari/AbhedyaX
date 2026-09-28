from abc import ABC, abstractmethod
from typing import Optional
from app.models.analysis import (
    CreateAnalysisResponse,
    AnalysisStatusResponse,
    AnalysisResult,
)


class AnalysisEngine(ABC):
    @abstractmethod
    async def create_analysis(
        self,
        source_type: str,
        scenario_id: Optional[str] = None,
        file_name: Optional[str] = None,
    ) -> CreateAnalysisResponse:
        """Create and queue a new analysis session."""
        pass

    @abstractmethod
    async def get_status(self, analysis_id: str) -> Optional[AnalysisStatusResponse]:
        """Retrieve the current processing state and progress for an analysis."""
        pass

    @abstractmethod
    async def get_result(self, analysis_id: str) -> Optional[AnalysisResult]:
        """Retrieve the completed canonical AnalysisResult."""
        pass
