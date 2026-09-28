from typing import Optional
from app.engines.base import AnalysisEngine
from app.engines.mock import MockAnalysisEngine
from app.models.analysis import (
    CreateAnalysisRequest,
    CreateAnalysisResponse,
    AnalysisStatusResponse,
    AnalysisResult,
)


class AnalysisService:
    def __init__(self, engine: Optional[AnalysisEngine] = None):
        self.engine: AnalysisEngine = engine or MockAnalysisEngine()

    async def create_analysis(
        self, request: CreateAnalysisRequest
    ) -> CreateAnalysisResponse:
        return await self.engine.create_analysis(
            source_type=request.source_type,
            scenario_id=request.scenario_id,
            file_name=request.file_name,
        )

    async def get_status(self, analysis_id: str) -> Optional[AnalysisStatusResponse]:
        return await self.engine.get_status(analysis_id)

    async def get_result(self, analysis_id: str) -> Optional[AnalysisResult]:
        return await self.engine.get_result(analysis_id)


# Global singleton instance for app routes
analysis_service = AnalysisService()
