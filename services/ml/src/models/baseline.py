"""Baseline machine learning classifiers for benchmark comparison."""

from typing import Any, Dict
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression


def build_dummy_baseline(random_state: int = 42) -> DummyClassifier:
    """Zero-intelligence baseline predicting most frequent class."""
    return DummyClassifier(strategy="most_frequent", random_state=random_state)


def build_logistic_regression_baseline(random_state: int = 42) -> LogisticRegression:
    """Interpretable linear baseline."""
    return LogisticRegression(
        max_iter=1000,
        random_state=random_state,
        class_weight="balanced",
    )


def build_random_forest_baseline(
    n_estimators: int = 100, max_depth: int = 8, random_state: int = 42
) -> RandomForestClassifier:
    """Ensemble decision tree baseline."""
    return RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        random_state=random_state,
        class_weight="balanced",
    )
