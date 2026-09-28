"""Deterministic Risk Scoring Engine for AbhedyaX IPsec Security Assessment."""

import logging
from typing import Any, Dict, List, Optional, Set
from services.security_engine.src.methodology import (
    METHODOLOGY_VERSION,
    score_to_risk_level,
)
from services.security_engine.src.models import (
    RiskScoringResult,
    ScoringDeduction,
)
from services.security_engine.src.rules import (
    RULE_DEFINITIONS,
    match_finding_to_rule,
)

logger = logging.getLogger("abhedyax.security_engine")


class RiskScoringEngine:
    """
    Centralized, deterministic risk scoring engine for IPsec VPN assessments.

    Key Principles:
    - Base score is 100 (maximum security posture).
    - Deductions are derived deterministically from verified security findings.
    - Anti-double-counting: each root condition is penalized at most once.
    - Final score is clamped between 0 and 100.
    - ML predictions or LLMs are NEVER permitted to modify cryptographic score deductions directly.
    """

    def __init__(
        self,
        rules: Optional[Dict[str, Dict[str, Any]]] = None,
        methodology_version: str = METHODOLOGY_VERSION,
    ):
        self.rules = rules or RULE_DEFINITIONS
        self.methodology_version = methodology_version

    def evaluate_findings(
        self,
        findings: List[Any],
        base_score: int = 100,
    ) -> RiskScoringResult:
        """Calculate deterministic security score and breakdown from normalized findings.

        Args:
            findings: List of SecurityFinding objects (or dictionaries).
            base_score: Maximum baseline score (default 100).

        Returns:
            RiskScoringResult containing score, risk level, and itemized deductions.
        """
        breakdown: List[ScoringDeduction] = []
        triggered_rules: Set[str] = set()

        for finding in findings:
            rule_key = match_finding_to_rule(finding)
            if not rule_key or rule_key in triggered_rules:
                continue

            rule = self.rules.get(rule_key)
            if not rule:
                continue

            fid = getattr(finding, "id", None) or (
                finding.get("id") if isinstance(finding, dict) else "F-UNKNOWN"
            )
            evidence = getattr(finding, "evidence", None) or (
                finding.get("evidence", []) if isinstance(finding, dict) else []
            )
            ev_ref = "; ".join(str(e) for e in evidence[:2]) if evidence else None

            deduction_entry = ScoringDeduction(
                finding_id=fid,
                category=rule["category"],
                severity=rule["severity"],
                deduction=rule["deduction"],
                reason=rule["reason"],
                evidence_ref=ev_ref,
            )
            breakdown.append(deduction_entry)
            triggered_rules.add(rule_key)

        total_deduction = sum(d.deduction for d in breakdown)
        final_score = max(0, min(100, base_score - total_deduction))
        risk_level = score_to_risk_level(final_score)

        return RiskScoringResult(
            security_score=final_score,
            risk_level=risk_level,
            base_score=base_score,
            total_deduction=total_deduction,
            scoring_breakdown=breakdown,
            methodology_version=self.methodology_version,
        )

    def evaluate_from_scenario(
        self,
        scenario_data: Dict[str, Any],
        base_score: int = 100,
    ) -> RiskScoringResult:
        """Helper to evaluate standard scenario definitions."""
        findings = scenario_data.get("findings", [])
        return self.evaluate_findings(findings, base_score=base_score)


# Default engine instance for application-wide reuse
risk_scoring_engine = RiskScoringEngine()
