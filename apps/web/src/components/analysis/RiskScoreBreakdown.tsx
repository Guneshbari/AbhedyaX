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
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b-2 border-black gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base sm:text-lg font-black text-black">
              Deterministic Risk Scoring Breakdown
            </h3>
          </div>
          <p className="text-xs text-zinc-700 font-medium mt-1">
            Mathematical posture evaluation via NIST SP 800-77 audit rules (No subjective weights)
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#FAF8F5] border border-black text-black shadow-[1px_1px_0px_0px_#000]">
            {scoring?.methodology_version || "v1.2.0-deterministic"}
          </span>
          <RiskBadge level={riskLevel} />
        </div>
      </div>

      {/* Math Formula Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 p-3 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
        <div className="flex flex-col p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] font-mono uppercase text-zinc-600 font-black">Base Score</span>
          <span className="text-2xl font-black font-mono text-black mt-0.5">{baseScore}</span>
          <span className="text-[10px] text-zinc-600 font-bold font-mono">Starting posture</span>
        </div>

        <div className="flex flex-col p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] font-mono uppercase text-[#FF4B4B] font-black">Total Deductions</span>
          <div className="flex items-center gap-1 mt-0.5">
            <ArrowDown className="w-5 h-5 text-[#FF4B4B] stroke-[3]" />
            <span className="text-2xl font-black font-mono text-[#FF4B4B]">-{totalDeduction}</span>
          </div>
          <span className="text-[10px] text-zinc-600 font-bold font-mono">{deductions.length} rule trigger(s)</span>
        </div>

        <div className="flex flex-col p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] font-mono uppercase text-black font-black">Calculated Score</span>
          <span className="text-2xl font-black font-mono text-black mt-0.5">
            {score} <span className="text-xs text-zinc-600 font-bold">/ 100</span>
          </span>
          <span className="text-[10px] text-zinc-600 font-bold font-mono">max(0, 100 - sum)</span>
        </div>

        <div className="flex flex-col p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] font-mono uppercase text-zinc-600 font-black">Risk Assessment</span>
          <span className="text-base font-black text-black mt-1 font-mono uppercase">
            {score >= 90 ? "Low Risk" : score >= 75 ? "Moderate Risk" : score >= 50 ? "High Risk" : "Critical Risk"}
          </span>
          <span className="text-[10px] text-zinc-600 font-bold font-mono">
            {score >= 90 ? "Compliant band" : score >= 75 ? "Remediation recommended" : "Immediate action"}
          </span>
        </div>
      </div>

      {/* Deduction Table or Zero-Deduction State */}
      {deductions.length === 0 ? (
        <div className="flex items-center gap-3 p-4 bg-[#4ADE80] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black text-xs">
          <ShieldCheck className="w-5 h-5 shrink-0 stroke-[2.5]" />
          <div>
            <div className="font-black text-sm uppercase font-mono">Zero Deductions Incurred</div>
            <div className="text-black font-medium mt-0.5">
              All observed cryptographic transforms, key exchange groups, and session parameters satisfy recommended NIST / NSA CNSA baseline standards.
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <table className="w-full min-w-[640px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-[#FFE600] text-black font-mono text-[11px] font-black uppercase">
                <th className="py-2.5 px-3 border-r-2 border-black whitespace-nowrap">Finding Ref</th>
                <th className="py-2.5 px-3 border-r-2 border-black whitespace-nowrap">Category</th>
                <th className="py-2.5 px-3 border-r-2 border-black whitespace-nowrap">Severity</th>
                <th className="py-2.5 px-3 border-r-2 border-black text-right whitespace-nowrap">Deduction</th>
                <th className="py-2.5 px-3">Audit Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black font-mono">
              {deductions.map((item, idx) => (
                <tr key={`${item.finding_id}-${idx}`} className="hover:bg-[#FAF8F5] transition-colors bg-white">
                  <td className="py-3 px-3 font-mono font-black text-black border-r-2 border-black whitespace-nowrap">
                    {item.finding_id}
                  </td>
                  <td className="py-3 px-3 text-black font-bold border-r-2 border-black whitespace-nowrap">
                    {item.category}
                  </td>
                  <td className="py-3 px-3 border-r-2 border-black whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 font-mono font-bold text-[10px] border-2 border-black shadow-[1px_1px_0px_0px_#000] ${
                        item.severity === "Critical"
                          ? "bg-[#FF4B4B] text-black"
                          : item.severity === "High"
                          ? "bg-[#FB923C] text-black"
                          : "bg-[#FBBF24] text-black"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-[#FF4B4B] border-r-2 border-black whitespace-nowrap">
                    -{item.deduction}
                  </td>
                  <td className="py-3 px-3 text-zinc-800 font-sans font-medium">
                    <span className="text-black font-bold font-sans">{item.reason}</span>
                    {item.evidence_ref && (
                      <span className="block text-[11px] font-mono text-zinc-600 font-bold mt-0.5">
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
