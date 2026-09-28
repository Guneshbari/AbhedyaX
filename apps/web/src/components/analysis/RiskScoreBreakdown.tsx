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
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Deterministic Risk Scoring Breakdown</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mathematical posture evaluation via NIST SP 800-77 audit rules (No subjective weights)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
            {scoring?.methodology_version || "v1.2.0-deterministic"}
          </span>
          <RiskBadge level={riskLevel} />
        </div>
      </div>

      {/* Math Formula Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5 p-3 rounded-lg bg-[#070d1e] border border-slate-800/80">
        <div className="flex flex-col">
          <span className="text-[11px] font-mono uppercase text-slate-400">Base Score</span>
          <span className="text-xl font-bold font-mono text-slate-200 mt-0.5">{baseScore}</span>
          <span className="text-[10px] text-slate-400">Starting posture</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-mono uppercase text-rose-400">Total Deductions</span>
          <div className="flex items-center gap-1 mt-0.5">
            <ArrowDown className="w-4 h-4 text-rose-400" />
            <span className="text-xl font-bold font-mono text-rose-400">-{totalDeduction}</span>
          </div>
          <span className="text-[10px] text-slate-400">{deductions.length} rule trigger(s)</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-mono uppercase text-indigo-400">Calculated Score</span>
          <span className="text-xl font-bold font-mono text-white mt-0.5">
            {score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </span>
          <span className="text-[10px] text-slate-400">max(0, 100 - sum)</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-mono uppercase text-slate-400">Risk Assessment</span>
          <span className="text-base font-semibold text-slate-200 mt-1">
            {score >= 90 ? "Low Risk" : score >= 75 ? "Moderate Risk" : score >= 50 ? "High Risk" : "Critical Risk"}
          </span>
          <span className="text-[10px] text-slate-400">
            {score >= 90 ? "Compliant band" : score >= 75 ? "Remediation recommended" : "Immediate action"}
          </span>
        </div>
      </div>

      {/* Deduction Table or Zero-Deduction State */}
      {deductions.length === 0 ? (
        <div className="flex items-center gap-3 p-4 rounded bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
          <div>
            <div className="font-semibold text-sm">Zero Deductions Incurred</div>
            <div className="text-slate-400 mt-0.5">
              All observed cryptographic transforms, key exchange groups, and session parameters satisfy recommended NIST / NSA CNSA baseline standards.
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-2 font-medium">Finding Ref</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Severity</th>
                <th className="pb-2 font-medium text-right">Deduction</th>
                <th className="pb-2 font-medium pl-4">Audit Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {deductions.map((item, idx) => (
                <tr key={`${item.finding_id}-${idx}`} className="hover:bg-slate-800/20">
                  <td className="py-2.5 font-mono text-cyan-400 font-medium">{item.finding_id}</td>
                  <td className="py-2.5 text-slate-300">{item.category}</td>
                  <td className="py-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                        item.severity === "Critical"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : item.severity === "High"
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-rose-400">
                    -{item.deduction}
                  </td>
                  <td className="py-2.5 pl-4 text-slate-400">
                    {item.reason}
                    {item.evidence_ref && (
                      <span className="block text-[11px] font-mono text-slate-400 mt-0.5">
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
