/**
 * Canonical Auditable Reasoning Fixtures for AbhedyaX Demo Provider.
 * Deterministic explanation chains: Evidence -> Finding -> Rule -> Risk -> Remediation.
 */

import {
  AuditableReasoningResult,
  AuditableReasoningChain,
} from "@/types/securityTwin";
import { CANONICAL_ANALYSES_MAP } from "./analyses";

export function getDemoReasoning(analysisId: string): AuditableReasoningResult {
  const analysis = CANONICAL_ANALYSES_MAP[analysisId] || CANONICAL_ANALYSES_MAP["AX-2026-00427"];
  let running = 100;

  const chains: AuditableReasoningChain[] = analysis.findings.map((f, idx) => {
    const deduction =
      f.id === "F-304" ? 25 :
      f.id === "F-301" ? 20 :
      (f.id === "F-302" || f.id === "F-303") ? 15 :
      f.id === "F-201" ? 12 :
      f.id === "F-202" ? 8 :
      f.id === "F-501" ? 5 : 0;

    const before = running;
    const after = Math.max(0, running - deduction);
    running = after;

    const riskBand = after >= 90 ? "Low" : after >= 75 ? "Moderate" : after >= 50 ? "High" : "Critical";
    const grade = after >= 90 ? "A" : after >= 80 ? "B" : after >= 70 ? "C" : after >= 60 ? "D" : "F";

    return {
      id: `REASON-${analysis.analysis_id}-${idx + 1}`,
      finding_id: f.id,
      category: f.category,
      severity: f.severity,
      evidence: f.evidence || [f.title],
      protocol_observation: `Observed wire condition: ${f.title}`,
      finding_title: f.title,
      risk_rule_id: `RULE_${f.id.replace("-", "_")}`,
      rule_description: f.description,
      deduction,
      score_before: before,
      score_after: after,
      risk_band_after: riskBand,
      grade_after: grade,
      recommendation: f.recommendation,
      provenance: f.provenance || "Observed",
    };
  });

  return {
    analysis_id: analysis.analysis_id,
    base_score: 100,
    final_score: analysis.security.score,
    final_risk: analysis.security.risk_level,
    final_grade: analysis.security.grade,
    total_deduction: 100 - analysis.security.score,
    chains,
    anti_double_counting_applied: true,
    methodology_version: "v1.2.0-deterministic",
  };
}
