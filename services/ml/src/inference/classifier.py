"""Production inference classifier for encrypted IPsec traffic."""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from services.ml.src.config.settings import (
    DEFAULT_ABSTENTION_THRESHOLD,
    MODELS_DIR,
    UNKNOWN_CLASS,
)
from services.ml.src.inference.explain import (
    SupportingFeature,
    generate_feature_explanations,
)
from services.ml.src.inference.preprocessor import InferencePreprocessor
from services.ml.src.models.registry import ModelBundle, load_model_artifact

logger = logging.getLogger("abhedyax.ml.inference")


class CandidateClass(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    traffic_class: str = Field(..., alias="class")
    probability: float


class ModelInfo(BaseModel):
    name: str
    version: str


class PredictionResult(BaseModel):
    """Canonical traffic classification result output."""

    predicted_class: str
    confidence: float
    candidate_classes: List[CandidateClass]
    model: ModelInfo
    features: Dict[str, float]
    explanation: List[SupportingFeature]
    classification_mode: str = "ml"  # "ml" | "simulated" | "unknown"


class TrafficClassifier:
    """Production interface serving low-latency traffic predictions from encrypted metadata."""

    def __init__(
        self,
        model_bundle: Optional[ModelBundle] = None,
        model_path: Optional[Path] = None,
        abstention_threshold: float = DEFAULT_ABSTENTION_THRESHOLD,
    ):
        self.bundle: Optional[ModelBundle] = model_bundle
        self.abstention_threshold = abstention_threshold
        self.preprocessor: Optional[InferencePreprocessor] = None

        if not self.bundle and model_path and model_path.exists():
            try:
                self.bundle = load_model_artifact(model_path)
            except Exception as e:
                logger.error("Failed to load model from %s: %s", model_path, e)

        # Try default model in MODELS_DIR if none provided
        if not self.bundle:
            self._try_load_default_model()

        if self.bundle:
            self.preprocessor = InferencePreprocessor(
                feature_names=self.bundle.metadata.feature_names,
                scaler=self.bundle.scaler,
            )

    def _try_load_default_model(self) -> None:
        """Search for latest serialized model artifact in artifacts/models/."""
        if not MODELS_DIR.exists():
            return
        model_files = sorted(MODELS_DIR.glob("*.joblib"), key=lambda p: p.stat().st_mtime, reverse=True)
        if model_files:
            try:
                self.bundle = load_model_artifact(model_files[0])
                logger.info("Loaded default model artifact %s", model_files[0].name)
            except Exception as e:
                logger.warning("Could not load candidate model %s: %s", model_files[0], e)

    @property
    def is_ready(self) -> bool:
        return self.bundle is not None and self.preprocessor is not None

    def predict(self, feature_dict: Dict[str, float]) -> PredictionResult:
        """
        Classify encrypted traffic from metadata feature dictionary.
        Returns PredictionResult with confidence, candidates, and feature explanations.
        """
        if not self.is_ready or not self.bundle or not self.preprocessor:
            return PredictionResult(
                predicted_class=UNKNOWN_CLASS,
                confidence=0.0,
                candidate_classes=[],
                model=ModelInfo(name="none", version="none"),
                features=feature_dict,
                explanation=[],
                classification_mode="unknown",
            )

        # 1. Preprocess feature vector
        X = self.preprocessor.transform(feature_dict)

        # 2. Probability scoring
        classes = list(self.bundle.metadata.classes)
        probs = self.bundle.model.predict_proba(X)[0]

        # Map classes to probabilities
        class_prob_pairs = sorted(
            zip(classes, probs), key=lambda x: x[1], reverse=True
        )

        top_class, top_prob = class_prob_pairs[0]
        confidence = float(top_prob)

        # Apply confidence abstention threshold
        threshold = self.bundle.metadata.abstention_threshold or self.abstention_threshold
        if confidence < threshold:
            predicted_class = UNKNOWN_CLASS
        else:
            predicted_class = top_class

        candidates = [
            CandidateClass(traffic_class=c, probability=round(float(p), 4))
            for c, p in class_prob_pairs
        ]

        # 3. Generate feature importance explanations
        feat_imp_map = self.bundle.metadata.metrics.get("feature_importance", {})
        explanation = generate_feature_explanations(
            feature_dict=feature_dict,
            feature_importance_map=feat_imp_map,
            top_k=5,
        )

        return PredictionResult(
            predicted_class=predicted_class,
            confidence=round(confidence, 4),
            candidate_classes=candidates,
            model=ModelInfo(
                name=self.bundle.metadata.model_name,
                version=self.bundle.metadata.model_version,
            ),
            features=feature_dict,
            explanation=explanation,
            classification_mode="ml",
        )


# Global singleton traffic classifier
traffic_classifier = TrafficClassifier()
