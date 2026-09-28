"""Security Twin and Drift Comparison API routes for AbhedyaX."""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from services.security_twin.src.models import (
    DriftComparisonResult,
    CompareAnalysesRequest,
    DemoComparisonPreset,
)
from services.security_twin.src.comparator import compare_analyses, CURATED_DEMO_COMPARISONS
from app.services.analysis_service import analysis_service

router = APIRouter(prefix="/security-twin", tags=["Security Twin"])


@router.get("/demo-comparisons", response_model=List[DemoComparisonPreset])
async def list_demo_comparisons() -> List[DemoComparisonPreset]:
    """Retrieve curated comparison presets for interactive judge demonstration."""
    return CURATED_DEMO_COMPARISONS


@router.post("/compare", response_model=DriftComparisonResult)
async def compare_two_analyses(request: CompareAnalysesRequest) -> DriftComparisonResult:
    """Compare baseline and current analyses to evaluate configuration drift and security impact."""
    baseline = await analysis_service.get_result(request.baseline_id)
    if not baseline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Baseline analysis '{request.baseline_id}' not found.",
        )

    current = await analysis_service.get_result(request.current_id)
    if not current:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target analysis '{request.current_id}' not found.",
        )

    return compare_analyses(baseline, current)
