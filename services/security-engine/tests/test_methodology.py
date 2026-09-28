"""Unit tests for the Risk Scoring Methodology and grading functions."""

import pytest
from services.security_engine.src.methodology import (
    score_to_risk_level,
    score_to_grade,
    RISK_BANDS,
)


def test_score_to_risk_level_boundaries():
    """Verify exact boundary mapping for operational risk levels.
    90 - 100 -> Low
    75 -  89 -> Moderate
    50 -  74 -> High
     0 -  49 -> Critical
    """
    # Low band
    assert score_to_risk_level(100) == "Low"
    assert score_to_risk_level(95) == "Low"
    assert score_to_risk_level(90) == "Low"

    # Moderate band
    assert score_to_risk_level(89) == "Moderate"
    assert score_to_risk_level(80) == "Moderate"
    assert score_to_risk_level(75) == "Moderate"

    # High band
    assert score_to_risk_level(74) == "High"
    assert score_to_risk_level(60) == "High"
    assert score_to_risk_level(50) == "High"

    # Critical band
    assert score_to_risk_level(49) == "Critical"
    assert score_to_risk_level(43) == "Critical"
    assert score_to_risk_level(38) == "Critical"
    assert score_to_risk_level(25) == "Critical"
    assert score_to_risk_level(0) == "Critical"

    # Clamping out-of-bound scores
    assert score_to_risk_level(-10) == "Critical"
    assert score_to_risk_level(110) == "Low"


def test_score_to_grade_boundaries():
    """Verify exact boundary mapping for letter grades.
    90 - 100 -> A
    80 -  89 -> B
    70 -  79 -> C
    60 -  69 -> D
     0 -  59 -> F
    """
    # A band
    assert score_to_grade(100) == "A"
    assert score_to_grade(95) == "A"
    assert score_to_grade(90) == "A"

    # B band
    assert score_to_grade(89) == "B"
    assert score_to_grade(85) == "B"
    assert score_to_grade(80) == "B"

    # C band
    assert score_to_grade(79) == "C"
    assert score_to_grade(75) == "C"
    assert score_to_grade(70) == "C"

    # D band
    assert score_to_grade(69) == "D"
    assert score_to_grade(65) == "D"
    assert score_to_grade(60) == "D"

    # F band
    assert score_to_grade(59) == "F"
    assert score_to_grade(43) == "F"
    assert score_to_grade(38) == "F"
    assert score_to_grade(25) == "F"
    assert score_to_grade(0) == "F"

    # Clamping
    assert score_to_grade(-5) == "F"
    assert score_to_grade(105) == "A"


def test_risk_bands_consistency():
    """Verify RISK_BANDS metadata dictionary definitions match scoring boundaries."""
    assert RISK_BANDS["Low"]["range"] == (90, 100)
    assert RISK_BANDS["Moderate"]["range"] == (75, 89)
    assert RISK_BANDS["High"]["range"] == (50, 74)
    assert RISK_BANDS["Critical"]["range"] == (0, 49)
