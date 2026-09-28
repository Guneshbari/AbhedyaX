"""Model artifact registry, versioning, and serialization."""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib  # type: ignore
from pydantic import BaseModel, Field

from services.ml.src.config.settings import CANONICAL_FEATURES, MODELS_DIR

logger = logging.getLogger("abhedyax.ml.registry")


class ModelArtifactMetadata(BaseModel):
    """Metadata schema documenting a serialized model artifact."""

    model_name: str
    model_version: str
    algorithm: str
    dataset_version: str = "v1.0.0"
    feature_count: int
    classes: List[str]
    metrics: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    feature_names: List[str] = Field(default_factory=lambda: list(CANONICAL_FEATURES))
    abstention_threshold: float = 0.55


class ModelBundle:
    """Coupled model pipeline, scaler/preprocessor, and version metadata."""

    def __init__(
        self,
        model: Any,
        metadata: ModelArtifactMetadata,
        scaler: Optional[Any] = None,
    ):
        self.model = model
        self.metadata = metadata
        self.scaler = scaler


def save_model_artifact(
    bundle: ModelBundle,
    target_dir: Any = MODELS_DIR,
) -> Path:
    """Save serialized model bundle and companion JSON metadata file."""
    target_path = Path(target_dir)
    target_path.mkdir(parents=True, exist_ok=True)

    filename_base = f"{bundle.metadata.model_name}_{bundle.metadata.model_version}"
    model_file = target_path / f"{filename_base}.joblib"
    meta_file = target_path / f"{filename_base}.json"

    # Persist joblib bundle
    joblib.dump(
        {"model": bundle.model, "scaler": bundle.scaler, "metadata": bundle.metadata.model_dump()},
        model_file,
    )

    # Persist JSON metadata
    with open(meta_file, "w", encoding="utf-8") as f:
        f.write(bundle.metadata.model_dump_json(indent=2))

    logger.info("Saved model artifact to %s", model_file)
    return model_file


def load_model_artifact(model_path: Any) -> ModelBundle:
    """Load serialized model bundle from joblib artifact."""
    p = Path(model_path)
    if not p.exists():
        raise FileNotFoundError(f"Model file not found: {p}")

    data = joblib.load(p)
    metadata = ModelArtifactMetadata.model_validate(data["metadata"])
    return ModelBundle(
        model=data["model"],
        scaler=data.get("scaler"),
        metadata=metadata,
    )
