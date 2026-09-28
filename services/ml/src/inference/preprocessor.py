"""Feature preprocessing and input normalization for inference."""

from typing import Any, Dict, List, Optional
import numpy as np


class InferencePreprocessor:
    """Prepares and validates raw feature dictionaries for model scoring."""

    def __init__(
        self,
        feature_names: List[str],
        scaler: Optional[Any] = None,
    ):
        self.feature_names = feature_names
        self.scaler = scaler

    def transform(self, feature_dict: Dict[str, float]) -> np.ndarray:
        """
        Align feature dictionary to model's expected column vector,
        impute NaNs/infinities, and apply scaler if configured.
        """
        vector = []
        for name in self.feature_names:
            val = feature_dict.get(name, 0.0)
            if val is None or np.isnan(val) or np.isinf(val):
                val = 0.0
            vector.append(float(val))

        arr = np.array([vector], dtype=np.float64)

        if self.scaler is not None:
            arr = self.scaler.transform(arr)

        return arr
