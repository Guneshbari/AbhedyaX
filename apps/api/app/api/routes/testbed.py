"""FastAPI routes for the controlled strongSwan IPsec testbed."""

import os
import sys
from pathlib import Path
from typing import List, Literal, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

# Ensure project root is available in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from services.testbed.src.config.models import TestbedEnvironmentStatus
from services.testbed.src.network.prerequisites import evaluate_testbed_environment
from services.testbed.src.orchestrator import TestbedRun, testbed_orchestrator
from services.testbed.src.scenarios.loader import load_all_scenarios
from services.testbed.src.scenarios.models import ScenarioDefinition
from services.testbed.src.traffic.profiles import TrafficClass
from app.services.analysis_service import analysis_service

router = APIRouter(prefix="/testbed", tags=["Testbed"])


class TestbedRunCreateRequest(BaseModel):
    """Request payload to initiate a testbed run."""

    scenario_id: str = Field(..., description="Scenario identifier (e.g. ts-secure-ikev2-gcm)")
    traffic_profile: TrafficClass = Field(
        default="ICMP", description="Traffic pattern profile to inject"
    )
    execution_mode: Optional[Literal["simulation", "real"]] = Field(
        default=None, description="Optional execution mode override ('simulation' or 'real')"
    )


class TestbedRunCancelResponse(BaseModel):
    run_id: str
    status: str
    message: str


@router.get("/status", response_model=TestbedEnvironmentStatus)
async def get_testbed_status():
    """Return testbed host prerequisites, tool availability, and operational capability."""
    active_runs = len([r for r in testbed_orchestrator.list_runs() if r.state not in ["Completed", "Failed", "Cancelled"]])
    return evaluate_testbed_environment(active_runs=active_runs)


@router.get("/scenarios", response_model=List[ScenarioDefinition])
async def list_testbed_scenarios():
    """Return all available testbed scenario definitions."""
    scenarios = load_all_scenarios()
    return list(scenarios.values())


@router.post("/runs", response_model=TestbedRun, status_code=status.HTTP_201_CREATED)
async def create_testbed_run(req: TestbedRunCreateRequest):
    """Initiate an end-to-end testbed scenario execution run."""
    try:
        run = await testbed_orchestrator.start_run(
            scenario_id=req.scenario_id,
            traffic_profile=req.traffic_profile,
            execution_mode=req.execution_mode,
            analysis_service=analysis_service,
        )
        return run
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger testbed run: {e}",
        )


@router.get("/runs/{run_id}", response_model=TestbedRun)
async def get_testbed_run(run_id: str):
    """Retrieve the current status, progress, and results of a testbed run."""
    run = testbed_orchestrator.get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Testbed run '{run_id}' not found",
        )
    return run


@router.post("/runs/{run_id}/cancel", response_model=TestbedRunCancelResponse)
async def cancel_testbed_run(run_id: str):
    """Safely stop a currently executing testbed run."""
    run = testbed_orchestrator.get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Testbed run '{run_id}' not found",
        )

    if run.state in ["Completed", "Failed", "Cancelled"]:
        return TestbedRunCancelResponse(
            run_id=run_id,
            status=run.state,
            message=f"Run '{run_id}' is already {run.state.lower()}",
        )

    success = testbed_orchestrator.cancel_run(run_id)
    return TestbedRunCancelResponse(
        run_id=run_id,
        status="Cancelled" if success else run.state,
        message="Cancellation signal dispatched successfully" if success else "Failed to cancel run",
    )
