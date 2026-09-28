import React from "react";
import { RiskScoringResult } from "@/types/analysis";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Calculator, ShieldCheck, ArrowDown } from "lucide-react";

interface RiskScoreBreakdownProps {
  scoring?: RiskScoringResult;
  fallbackScore?: number;
  fallbackRiskLevel?: "Low" | "Moderate" | "Medium" | "High" | "Critical";
}

export const RiskScoreBreakdown: React.FC<RiskScoreBreakdownProps> = ({
  scoring,
  fallbackScore = 85,
  fallbackRiskLevel = "Low",
}) => {
  const score = scoring ? scoring.security_score : fallbackScore;
  const riskLevel = scoring ? scoring.risk_level : fallbackRiskLevel;
  const baseScore = scoring?.base_score ?? 100;
  const totalDeduction = scoring?.total_deduction ?? Math.max(0, 100 - score);
  const deductions = scoring?.scoring_breakdown ?? [];

  return (
    <div className="bg-[#0F1218] border border-[#252B35] rounded-xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#252B35] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-[#F4F7FA]">Deterministic Risk Scoring Breakdown</h3>
          </div>
          <p className="text-xs text-[#9AA4B2] mt-1">
            Mathematical posture evaluation via NIST SP 800-77 audit rules (No subjective weights)
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#141820] border border-[#252B35] text-[#9AA4B2]">
            {scoring?.methodology_version || "v1.2.0-deterministic"}
          </span>
          <RiskBadge level={riskLevel} />
        </div>
      </div>

      {/* Math Formula Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 p-3 rounded-lg bg-[#141820] border border-[#252B35]">
        <div className="flex flex-col p-2">
          <span className="text-[11px] font-mono uppercase text-[#687384] font-semibold">Base Score</span>
          <span className="text-xl font-bold font-mono text-[#F4F7FA] mt-0.5">{baseScore}</span>
          <span className="text-[10px] text-[#9AA4B2]">Starting posture</span>
        </div>

        <div className="flex flex-col p-2">
          <span className="text-[11px] font-mono uppercase text-red-400 font-semibold">Total Deductions</span>
          <div className="flex items-center gap-1 mt-0.5">
            <ArrowDown className="w-4 h-4 text-red-400" />
            <span className="text-xl font-bold font-mono text-red-400">-{totalDeduction}</span>
          </div>
          <span className="text-[10px] text-[#9AA4B2]">{deductions.length} rule trigger(s)</span>
        </div>

        <div className="flex flex-col p-2">
          <span className="text-[11px] font-mono uppercase text-indigo-400 font-semibold">Calculated Score</span>
          <span className="text-xl font-bold font-mono text-[#F4F7FA] mt-0.5">
            {score} <span className="text-xs text-[#9AA4B2] font-normal">/ 100</span>
          </span>
          <span className="text-[10px] text-[#9AA4B2]">max(0, 100 - sum)</span>
        </div>

        <div className="flex flex-col p-2">
          <span className="text-[11px] font-mono uppercase text-[#687384] font-semibold">Risk Assessment</span>
          <span className="text-base font-semibold text-[#F4F7FA] mt-1">
            {score >= 90 ? "Low Risk" : score >= 75 ? "Moderate Risk" : score >= 50 ? "High Risk" : "Critical Risk"}
          </span>
          <span className="text-[10px] text-[#9AA4B2]">
            {score >= 90 ? "Compliant band" : score >= 75 ? "Remediation recommended" : "Immediate action"}
          </span>
        </div>
      </div>

      {/* Deduction Table or Zero-Deduction State */}
      {deductions.length === 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
          <div>
            <div className="font-semibold text-sm">Zero Deductions Incurred</div>
            <div className="text-[#9AA4B2] mt-0.5">
              All observed cryptographic transforms, key exchange groups, and session parameters satisfy recommended NIST / NSA CNSA baseline standards.
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#252B35] text-[#9AA4B2] font-mono text-[11px]">
                <th className="pb-2.5 px-3 font-semibold uppercase whitespace-nowrap">Finding Ref</th>
                <th className="pb-2.5 px-3 font-semibold uppercase whitespace-nowrap">Category</th>
                <th className="pb-2.5 px-3 font-semibold uppercase whitespace-nowrap">Severity</th>
                <th className="pb-2.5 px-3 font-semibold uppercase text-right whitespace-nowrap">Deduction</th>
                <th className="pb-2.5 px-3 font-semibold uppercase">Audit Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B35]/60 font-sans">
              {deductions.map((item, idx) => (
                <tr key={`${item.finding_id}-${idx}`} className="hover:bg-[#141820]/40 transition-colors">
                  <td className="py-3 px-3 font-mono text-cyan-400 font-medium whitespace-nowrap">{item.finding_id}</td>
                  <td className="py-3 px-3 text-[#F4F7FA] whitespace-nowrap">{item.category}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
                        item.severity === "Critical"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : item.severity === "High"
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-red-400 whitespace-nowrap">
                    -{item.deduction}
                  </td>
                  <td className="py-3 px-3 text-[#9AA4B2]">
                    <span className="text-[#F4F7FA]">{item.reason}</span>
                    {item.evidence_ref && (
                      <span className="block text-[11px] font-mono text-[#687384] mt-0.5">
                        Ref: {item.evidence_ref}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
