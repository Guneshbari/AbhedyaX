"""Dataset schemas and data structures for ML training."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class DatasetSample(BaseModel):
    """Individual labelled sample combining encrypted metadata features and ground-truth label."""

    sample_id: str
    scenario_id: str
    traffic_class: str
    pcap_path: str
    ground_truth_path: Optional[str] = None
    features: Dict[str, float]
    label: str


class DatasetReport(BaseModel):
    """Summary integrity report of an ingested dataset."""

    total_samples: int
    feature_count: int
    classes: List[str]
    samples_per_class: Dict[str, int]
    missing_values_count: int = 0
    duplicate_samples_count: int = 0
    corrupted_samples_count: int = 0
    is_valid: bool = True
    validation_messages: List[str] = Field(default_factory=list)
