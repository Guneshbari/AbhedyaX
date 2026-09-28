"""Feature importance explanation generator for traffic predictions."""

from typing import Any, Dict, List
from pydantic import BaseModel


class SupportingFeature(BaseModel):
    feature: str
    value: float
    importance: float


def generate_feature_explanations(
    feature_dict: Dict[str, float],
    feature_importance_map: Dict[str, float],
    top_k: int = 5,
) -> List[SupportingFeature]:
    """
    Expose the top contributing features that influenced the model prediction.
    Features are ranked by model feature importance with observed values.
    """
    explanations: List[SupportingFeature] = []

    # Sort features by importance weight
    sorted_feats = sorted(
        feature_importance_map.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    for feat_name, imp in sorted_feats[:top_k]:
        val = float(feature_dict.get(feat_name, 0.0))
        explanations.append(
            SupportingFeature(
                feature=feat_name,
                value=round(val, 4),
                importance=round(float(imp), 4),
            )
        )

    return explanations
