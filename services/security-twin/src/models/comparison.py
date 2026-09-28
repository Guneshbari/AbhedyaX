"""Comparison models for AbhedyaX Security Twin API."""

from typing import Optional, List
from pydantic import BaseModel, Field
from services.security_twin.src.models.drift import DriftComparisonResult, DriftChange, DriftSummary, DriftSecurityImpact


class CompareAnalysesRequest(BaseModel):
    """Payload to trigger comparison between baseline and current analysis."""

    baseline_id: str = Field(..., description="Analysis ID to use as secure or prior baseline")
    current_id: str = Field(..., description="Analysis ID to compare against baseline")


class DemoComparisonPreset(BaseModel):
    """Curated comparison preset for judge walkthroughs."""

    id: str
    name: str
    description: str
    baseline_id: str
    current_id: str
    expected_score_transition: str
    key_takeaway: str
