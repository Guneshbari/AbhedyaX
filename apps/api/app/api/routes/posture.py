"""Security Posture Timeline API route for AbhedyaX."""

from fastapi import APIRouter
from services.security_twin.src.models import PostureTimelineResult
from services.security_twin.src.posture_engine import build_posture_timeline
from app.services.analysis_service import analysis_service

router = APIRouter(prefix="/posture", tags=["Security Posture"])


@router.get("", response_model=PostureTimelineResult)
async def get_security_posture_timeline() -> PostureTimelineResult:
    """Retrieve multi-session security posture progression and transitions."""
    all_analyses = await analysis_service.list_analyses()
    return build_posture_timeline(all_analyses)
