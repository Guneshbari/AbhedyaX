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
    <div className="p-5 sm:p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b-2 border-black gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black shrink-0">
            <Lightbulb className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-black">
                USP-03: Auditable Security Reasoning Chains
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#C084FC] text-black border border-black font-bold uppercase shadow-[1px_1px_0px_0px_#000]">
                Deterministic
              </span>
            </div>
            <p className="text-xs text-zinc-700 font-medium mt-0.5">
              Trace directly from extracted wire evidence to protocol rules, score deductions, and remediation advice.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold shrink-0 bg-[#FAF8F5] p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span>Base: <strong>{reasoning.base_score}</strong></span>
          <span>→</span>
          <span className="text-[#FF4B4B] font-black">-{reasoning.total_deduction} pts</span>
          <span>→</span>
          <span className="font-black bg-[#FFE600] px-1 border border-black">Score: {reasoning.final_score}/100</span>
        </div>
      </div>

      {reasoning.chains.length === 0 ? (
        <div className="p-4 bg-[#4ADE80] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-3 text-xs text-black">
          <ShieldCheck className="w-5 h-5 stroke-[2.5] shrink-0" />
          <div>
            <strong className="text-sm font-black uppercase font-mono">Pristine Cryptographic Posture: Zero Deductions Incurred</strong>
            <p className="text-black font-medium mt-0.5">
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
                className="border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000] overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedChainId(isExpanded ? null : chain.id)}
                  className="w-full px-4 py-3 text-left flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#FAF8F5] transition-colors gap-2.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-black stroke-[3] shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-black stroke-[3] shrink-0" />
                    )}
                    <span className="px-2 py-0.5 text-xs font-mono font-black bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000] shrink-0">
                      {chain.finding_id}
                    </span>
                    <span className="text-sm font-black text-black truncate">
                      {chain.finding_title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs shrink-0 self-end sm:self-auto pl-6 sm:pl-0">
                    <span className="text-[#FF4B4B] font-black">-{chain.deduction} pts</span>
                    <span className="text-zinc-600 font-bold">
                      ({chain.score_before} → {chain.score_after})
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold border border-black shadow-[1px_1px_0px_0px_#000] ${
                        chain.severity === "Critical"
                          ? "bg-[#FF4B4B] text-black"
                          : chain.severity === "High"
                          ? "bg-[#FB923C] text-black"
                          : "bg-[#FBBF24] text-black"
                      }`}
                    >
                      {chain.severity}
                    </span>
                  </div>
                </button>

                {/* Expanded Trace Chain */}
                {isExpanded && (
                  <div className="px-4 py-4 border-t-2 border-black bg-[#FAF8F5] space-y-3.5 text-xs">
                    {/* Visual 4-Step Path */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 font-mono text-[11px]">
                      <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        <span className="text-[10px] text-zinc-600 block uppercase font-mono font-black">1. Wire Evidence</span>
                        <div className="text-black font-black mt-1 truncate" title={chain.evidence.join("; ")}>
                          {chain.evidence[0] || "Handshake header"}
                        </div>
                        <span className="text-[10px] text-zinc-600 mt-0.5 block font-bold">Provenance: {chain.provenance}</span>
                      </div>

                      <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        <span className="text-[10px] text-zinc-600 block uppercase font-mono font-black">2. Evaluated Rule</span>
                        <div className="text-black font-black mt-1">
                          {chain.risk_rule_id}
                        </div>
                        <span className="text-[10px] text-zinc-600 mt-0.5 block font-bold">Deterministic logic</span>
                      </div>

                      <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        <span className="text-[10px] text-zinc-600 block uppercase font-mono font-black">3. Deduction Applied</span>
                        <div className="text-[#FF4B4B] font-black mt-1">
                          -{chain.deduction} Points
                        </div>
                        <span className="text-[10px] text-zinc-600 mt-0.5 block font-bold">Anti-double counted</span>
                      </div>

                      <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        <span className="text-[10px] text-zinc-600 block uppercase font-mono font-black">4. Posture Effect</span>
                        <div className="text-black font-black mt-1">
                          {chain.score_after} ({chain.risk_band_after})
                        </div>
                        <span className="text-[10px] text-zinc-600 mt-0.5 block font-bold">Grade {chain.grade_after}</span>
                      </div>
                    </div>

                    {/* Rationale and Recommendation */}
                    <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black font-sans space-y-2">
                      <div>
                        <strong className="text-black block text-xs font-mono font-black uppercase mb-0.5">Audit Rule Explanation:</strong>
                        <span className="text-xs text-zinc-800 leading-relaxed font-medium">{chain.rule_description}</span>
                      </div>
                      <div className="pt-2 border-t-2 border-black">
                        <strong className="text-black block text-xs font-mono font-black uppercase mb-0.5">Prescriptive Recommendation:</strong>
                        <span className="text-xs text-zinc-800 leading-relaxed font-medium">{chain.recommendation}</span>
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
