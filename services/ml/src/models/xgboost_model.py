"""XGBoost gradient boosting classifier with scikit-learn wrapper."""

import logging
from typing import Any, Optional
import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger("abhedyax.ml.xgboost")


class XGBoostClassifierWrapper(BaseEstimator, ClassifierMixin):
    """
    Production wrapper around XGBoost Classifier with automated string label
    encoding/decoding and fallback capabilities.
    """

    def __init__(
        self,
        n_estimators: int = 100,
        max_depth: int = 4,
        learning_rate: float = 0.1,
        random_state: int = 42,
    ):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.random_state = random_state

        self.label_encoder = LabelEncoder()
        self.model = None
        self._is_fallback = False

    def fit(self, X: np.ndarray, y: np.ndarray) -> "XGBoostClassifierWrapper":
        y_encoded = self.label_encoder.fit_transform(y)
        self.classes_ = self.label_encoder.classes_

        try:
            import xgboost as xgb  # type: ignore

            self.model = xgb.XGBClassifier(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                learning_rate=self.learning_rate,
                random_state=self.random_state,
                eval_metric="mlogloss",
            )
            self.model.fit(X, y_encoded)
            self._is_fallback = False
        except Exception as e:
            logger.warning("XGBoost failed (%s), using HistGradientBoosting fallback", e)
            from sklearn.ensemble import HistGradientBoostingClassifier

            self.model = HistGradientBoostingClassifier(
                max_iter=self.n_estimators,
                max_depth=self.max_depth,
                learning_rate=self.learning_rate,
                random_state=self.random_state,
            )
            self.model.fit(X, y_encoded)
            self._is_fallback = True

        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        preds = self.model.predict(X)
        return self.label_encoder.inverse_transform(preds)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(X)

    @property
    def feature_importances_(self) -> Optional[np.ndarray]:
        if hasattr(self.model, "feature_importances_"):
            return self.model.feature_importances_
        return None
