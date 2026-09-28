"""Data models for Encrypted Traffic Metadata Exposure Analysis."""

from typing import List, Literal, Optional, Dict, Any
from pydantic import BaseModel, Field

ExposureLevel = Literal["Low", "Moderate", "High", "Unknown"]


class MetadataExposureDimension(BaseModel):
    """An observable dimension of encrypted traffic flow metadata."""

    name: str
    value: float = Field(..., ge=0.0, le=100.0, description="Observability index 0-100")
    indicator: ExposureLevel
    description: str
    key_features: List[str] = Field(default_factory=list)


class MetadataExposureResult(BaseModel):
    """Structured evaluation of information inferable from metadata without payload decryption."""

    analysis_id: str
    indicator: ExposureLevel
    score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Overall metadata exposure index 0-100")
    dimensions: List[MetadataExposureDimension] = Field(default_factory=list)
    explanation: str
    provenance: Literal["Observed", "Simulated", "Inferred"]
    features_summary: Dict[str, Any] = Field(default_factory=dict)
    traffic_classification: Optional[Dict[str, Any]] = None
    disclaimer: str = (
        "Metadata exposure indicator measures traffic flow fingerprinting visibility based on packet sizes, "
        "cadence, and directionality. It does NOT decrypt ESP payloads or weaken AES/IPsec cryptographic protection."
    )
