from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "abhedyax-api"
    engine: str = "ready"


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Service health and engine readiness endpoint."""
    return HealthResponse(status="ok", service="abhedyax-api", engine="ready")
