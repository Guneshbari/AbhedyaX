"use client";

import React, { useState, useEffect } from "react";
import { getAnalysisReasoning } from "@/lib/api/securityTwin";
import { AuditableReasoningResult } from "@/types/securityTwin";
import {
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Lightbulb,
} from "lucide-react";

interface AuditableReasoningPanelProps {
  analysisId: string;
}

export const AuditableReasoningPanel: React.FC<AuditableReasoningPanelProps> = ({ analysisId }) => {
  const [reasoning, setReasoning] = useState<AuditableReasoningResult | null>(null);
  const [expandedChainId, setExpandedChainId] = useState<string | null>(null);

  useEffect(() => {
    getAnalysisReasoning(analysisId)
      .then((data) => {
        setReasoning(data);
        if (data.chains.length > 0) {
          setExpandedChainId(data.chains[0].id);
        }
      })
      .catch((err) => console.error("Error loading reasoning:", err));
  }, [analysisId]);

  if (!reasoning) return null;

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#252B35] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[#F4F7FA]">
                USP-03: Auditable Security Reasoning Chains
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                Deterministic
              </span>
            </div>
            <p className="text-xs text-[#9AA4B2] mt-0.5">
              Trace directly from extracted wire evidence to protocol rules, score deductions, and remediation advice.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
          <span className="text-[#9AA4B2]">Base: <strong className="text-[#F4F7FA]">{reasoning.base_score}</strong></span>
          <span className="text-[#3B4252]">→</span>
          <span className="text-red-400 font-bold">-{reasoning.total_deduction} pts</span>
          <span className="text-[#3B4252]">→</span>
          <span className="text-[#F4F7FA] font-bold">Score: {reasoning.final_score}/100</span>
        </div>
      </div>

      {reasoning.chains.length === 0 ? (
        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-400">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <div>
            <strong className="text-sm font-medium">Pristine Cryptographic Posture: Zero Deductions Incurred</strong>
            <p className="text-[#9AA4B2] mt-0.5 font-sans">
              All observed transforms conform strictly to NIST SP 800-77. No deduction rules were triggered.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {reasoning.chains.map((chain) => {
            const isExpanded = expandedChainId === chain.id;
            return (
              <div
                key={chain.id}
                className="rounded-lg border border-[#252B35] bg-[#141820] overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedChainId(isExpanded ? null : chain.id)}
                  className="w-full px-4 py-3.5 text-left flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#1C222C] transition-colors gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#9AA4B2] shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#9AA4B2] shrink-0" />
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#090B10] text-[#F4F7FA] border border-[#252B35] shrink-0">
                      {chain.finding_id}
                    </span>
                    <span className="text-xs font-medium text-[#F4F7FA] font-sans truncate">
                      {chain.finding_title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs shrink-0 self-end sm:self-auto pl-6 sm:pl-0">
                    <span className="text-red-400 font-bold">-{chain.deduction} pts</span>
                    <span className="text-[#687384]">
                      ({chain.score_before} → {chain.score_after})
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold border ${
                        chain.severity === "Critical"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : chain.severity === "High"
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {chain.severity}
                    </span>
                  </div>
                </button>

                {/* Expanded Trace Chain */}
                {isExpanded && (
                  <div className="px-4 py-4 border-t border-[#252B35] bg-[#090B10]/60 space-y-3.5 text-xs">
                    {/* Visual 5-Step Path */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 font-mono text-[11px]">
                      <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                        <span className="text-[10px] text-[#687384] block uppercase font-sans font-semibold">1. Wire Evidence</span>
                        <div className="text-[#F4F7FA] mt-1 truncate" title={chain.evidence.join("; ")}>
                          {chain.evidence[0] || "Handshake header"}
                        </div>
                        <span className="text-[9px] text-[#9AA4B2] mt-0.5 block">Provenance: {chain.provenance}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                        <span className="text-[10px] text-[#687384] block uppercase font-sans font-semibold">2. Evaluated Rule</span>
                        <div className="text-indigo-400 font-semibold mt-1">
                          {chain.risk_rule_id}
                        </div>
                        <span className="text-[9px] text-[#9AA4B2] mt-0.5 block">Deterministic logic</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                        <span className="text-[10px] text-[#687384] block uppercase font-sans font-semibold">3. Deduction Applied</span>
                        <div className="text-red-400 font-bold mt-1">
                          -{chain.deduction} Points
                        </div>
                        <span className="text-[9px] text-[#9AA4B2] mt-0.5 block">Anti-double counted</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                        <span className="text-[10px] text-[#687384] block uppercase font-sans font-semibold">4. Posture Effect</span>
                        <div className="text-[#F4F7FA] font-semibold mt-1">
                          {chain.score_after} ({chain.risk_band_after})
                        </div>
                        <span className="text-[9px] text-[#9AA4B2] mt-0.5 block">Grade {chain.grade_after}</span>
                      </div>
                    </div>

                    {/* Rationale and Recommendation */}
                    <div className="p-3.5 rounded-lg bg-[#141820] border border-[#252B35] text-[#F4F7FA] font-sans space-y-2">
                      <div>
                        <strong className="text-[#9AA4B2] block text-[11px] font-mono uppercase mb-0.5">Audit Rule Explanation:</strong>
                        <span className="text-xs text-[#F4F7FA] leading-relaxed">{chain.rule_description}</span>
                      </div>
                      <div className="pt-2 border-t border-[#252B35]">
                        <strong className="text-emerald-400 block text-[11px] font-mono uppercase mb-0.5">Prescriptive Recommendation:</strong>
                        <span className="text-xs text-[#9AA4B2] leading-relaxed">{chain.recommendation}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
