from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from app.models.analysis import (
    CreateAnalysisRequest,
    CreateAnalysisResponse,
    AnalysisStatusResponse,
    AnalysisResult,
)
from app.services.analysis_service import analysis_service
from app.data.scenarios import SCENARIOS

router = APIRouter(prefix="/analyses", tags=["Analyses"])


@router.get("/scenarios", response_model=List[Dict[str, Any]])
async def list_scenarios() -> List[Dict[str, Any]]:
    """Return list of predefined RFC benchmark simulation scenarios."""
    return [
        {
            "id": s["id"],
            "name": s["name"],
            "description": s["description"],
            "vpn": s["vpn"],
            "cryptography": s["cryptography"],
            "security": s["security"],
            "traffic": s["traffic"],
        }
        for s in SCENARIOS.values()
    ]


@router.post("", response_model=CreateAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis(request: CreateAnalysisRequest) -> CreateAnalysisResponse:
    """Create a new IPsec session analysis (simulation or PCAP ingestion)."""
    return await analysis_service.create_analysis(request)


@router.get("/{analysis_id}/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(analysis_id: str) -> AnalysisStatusResponse:
    """Retrieve the real-time processing status and stepper progress of an analysis."""
    status_resp = await analysis_service.get_status(analysis_id)
    if not status_resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis session '{analysis_id}' not found.",
        )
    return status_resp


@router.get("/{analysis_id}", response_model=AnalysisResult)
async def get_analysis_result(analysis_id: str) -> AnalysisResult:
    """Retrieve the completed canonical AnalysisResult."""
    result = await analysis_service.get_result(analysis_id)
    if not result:
        # Check if the analysis exists but is still processing
        status_resp = await analysis_service.get_status(analysis_id)
        if status_resp and status_resp.status != "completed":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Analysis session '{analysis_id}' is still in status '{status_resp.status}'.",
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis result for '{analysis_id}' not found.",
        )
    return result
