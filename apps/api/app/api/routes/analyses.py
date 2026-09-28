"""Analyses API routes for AbhedyaX.

Handles scenario listing, analysis creation (simulation and PCAP ingestion),
real-time status polling, and canonical AnalysisResult retrieval.
"""

import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from app.models.analysis import (
    CreateAnalysisRequest,
    CreateAnalysisResponse,
    AnalysisStatusResponse,
    AnalysisResult,
)
from app.services.analysis_service import analysis_service
from app.packet.tshark import is_tshark_available, get_tshark_version, TSharkNotFoundError
from app.data.scenarios import SCENARIOS
from app.config import settings
from app.core.logging import logger

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


@router.get("/environment")
async def get_environment_status() -> Dict[str, Any]:
    """Inspect the backend analysis engine and TShark environment status."""
    tshark_avail = is_tshark_available()
    tshark_ver = get_tshark_version() if tshark_avail else None
    return {
        "engine_mode": settings.analysis_engine,
        "tshark_available": tshark_avail,
        "tshark_version": tshark_ver,
        "tshark_binary": settings.tshark_binary,
        "max_pcap_size_mb": settings.max_pcap_size_mb,
        "timeout_seconds": settings.tshark_timeout_seconds,
        "supported_formats": [".pcap", ".pcapng"],
    }


@router.get("/ml/model")
async def get_active_ml_model() -> Dict[str, Any]:
    """Retrieve active ML model metadata, evaluation metrics, and feature importance."""
    from services.ml.src.inference.classifier import traffic_classifier

    if not traffic_classifier.is_ready or not traffic_classifier.bundle:
        return {
            "status": "unavailable",
            "active_model": None,
            "message": "No serialized model artifact available in artifacts/models/",
        }

    meta = traffic_classifier.bundle.metadata
    return {
        "status": "ready",
        "model_name": meta.model_name,
        "model_version": meta.model_version,
        "algorithm": meta.algorithm,
        "dataset_version": meta.dataset_version,
        "feature_count": meta.feature_count,
        "classes": meta.classes,
        "abstention_threshold": meta.abstention_threshold,
        "metrics": meta.metrics,
        "created_at": meta.created_at,
        "feature_names": meta.feature_names,
    }


@router.post("", response_model=CreateAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis(request: CreateAnalysisRequest) -> CreateAnalysisResponse:
    """Create a new IPsec session analysis (simulation or PCAP ingestion)."""
    try:
        return await analysis_service.create_analysis(request)
    except TSharkNotFoundError as tne:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(tne),
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        logger.error(f"Failed to create analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate analysis: {str(e)}",
        )


@router.post("/upload", response_model=CreateAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def upload_pcap(
    file: UploadFile = File(...),
    analysis_name: Optional[str] = Form(None),
) -> CreateAnalysisResponse:
    """Upload a real PCAP/PCAPNG capture file and initiate structured TShark analysis."""
    # 1. Check TShark availability before accepting upload
    if not is_tshark_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"TShark binary '{settings.tshark_binary}' is not available on this server. Real PCAP analysis cannot proceed.",
        )

    # 2. Extension validation
    orig_name = file.filename or "capture.pcap"
    ext = os.path.splitext(orig_name)[1].lower()
    if ext not in [".pcap", ".pcapng"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Only .pcap and .pcapng files are supported.",
        )

    # 3. Ensure storage directory exists
    os.makedirs(settings.pcaps_dir, exist_ok=True)

    # 4. Generate safe server-side filename preventing path traversal
    safe_base = os.path.basename(orig_name).replace(" ", "_")
    safe_id = uuid.uuid4().hex[:12]
    saved_filename = f"{safe_id}_{safe_base}"
    target_path = os.path.join(settings.pcaps_dir, saved_filename)

    # 5. Stream and enforce size limit
    max_bytes = settings.max_pcap_size_mb * 1024 * 1024
    total_written = 0

    try:
        with open(target_path, "wb") as out_file:
            while chunk := await file.read(1024 * 64):  # 64KB chunks
                total_written += len(chunk)
                if total_written > max_bytes:
                    out_file.close()
                    if os.path.exists(target_path):
                        os.remove(target_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Capture exceeds maximum allowed size of {settings.max_pcap_size_mb} MB.",
                    )
                out_file.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving uploaded file: {e}")
        if os.path.exists(target_path):
            os.remove(target_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write uploaded file to storage: {str(e)}",
        )

    # 6. Dispatch to analysis service
    request = CreateAnalysisRequest(
        source_type="pcap",
        file_name=orig_name,
    )

    try:
        return await analysis_service.create_analysis(
            request=request,
            pcap_path=target_path,
            engine_override="real",
        )
    except Exception as e:
        logger.error(f"Error initiating analysis for uploaded PCAP: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


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
