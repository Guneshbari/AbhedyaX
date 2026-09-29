"use client";

import React from "react";
import {
  Trophy, Shield, Activity, Brain, GitCompare, FileText,
  BarChart3, RotateCcw, X, ExternalLink, ChevronRight
} from "lucide-react";
import { useJudgeDemoStore } from "@/store/judgeDemo";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function scoreColor(score: number): string {
  if (score >= 90) return "text-[#22C55E]";
  if (score >= 75) return "text-[#F59E0B]";
  return "text-[#EF4444]";
}

function riskBadgeClass(risk: string): string {
  if (risk === "Low") return "border-[#22C55E]/50 bg-[#22C55E]/10 text-[#22C55E]";
  if (risk === "Moderate") return "border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B]";
  return "border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]";
}

export function JudgeDemoCompletionScreen() {
  const { stageOutputs, analysisId, scenarioId, close, reset } = useJudgeDemoStore();
  const router = useRouter();

  const sa = stageOutputs.securityAssessment;
  const ai = stageOutputs.aiResult;
  const td = stageOutputs.securityTwinDrift;
  const fi = stageOutputs.finalInsights;
  const ps = stageOutputs.packetSummary;

  const score = sa?.risk_score ?? 0;
  const riskBand = sa?.risk_band ?? "—";
  const grade = sa?.grade ?? "—";
  const findingCount = sa?.findings?.length ?? 0;
  const trafficClass = ai?.traffic_class ?? "—";
  const confidence = ai ? Math.round(ai.confidence * 100) : 0;
  const scoreDelta = td?.score_delta ?? 0;
  const alignment = td?.twin?.alignment?.overall ?? "—";

  function openRoute(path: string) {
    close();
    router.push(path);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Hero banner */}
      <div className="border-b border-[#252B35] bg-[#060810] p-6 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-6 h-6 text-[#FFE600] shrink-0" />
          <div>
            <h2 className="font-mono font-black text-lg tracking-[0.1em] text-[#F4F7FA] uppercase">
              ABHEDYAX ANALYSIS COMPLETE
            </h2>
            <p className="font-mono text-xs text-[#22C55E] mt-0.5">
              Encrypted traffic analyzed without payload decryption.
            </p>
          </div>
        </div>
        <p className="font-mono text-xs text-[#687384]">
          Analysis ID: <span className="text-[#F4F7FA]">{analysisId}</span> ·
          Scenario: <span className="text-[#F4F7FA]">{scenarioId.replace(/-/g, " ").toUpperCase()}</span>
        </p>
      </div>

      {/* Metrics grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 shrink-0">
        {/* Score */}
        <div className="border border-[#252B35] bg-[#0F1218] p-3 col-span-2 sm:col-span-1">
          <div className="font-mono text-[10px] text-[#687384] uppercase tracking-wider mb-1">Security Score</div>
          <div className={cn("font-mono font-black text-4xl", scoreColor(score))}>{score}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("font-mono text-xs font-bold px-1.5 py-0.5 border uppercase", riskBadgeClass(riskBand))}>
              {riskBand}
            </span>
            <span className="font-mono text-sm font-bold text-[#9AA4B2]">Grade {grade}</span>
          </div>
        </div>

        {/* Findings */}
        <div className="border border-[#252B35] bg-[#0F1218] p-3">
          <div className="font-mono text-[10px] text-[#687384] uppercase tracking-wider mb-1">Findings</div>
          <div className={cn("font-mono font-black text-3xl", findingCount === 0 ? "text-[#22C55E]" : "text-[#EF4444]")}>{findingCount}</div>
          <div className="font-mono text-[10px] text-[#687384] mt-1">Security issues detected</div>
        </div>

        {/* Traffic class */}
        <div className="border border-[#252B35] bg-[#0F1218] p-3">
          <div className="font-mono text-[10px] text-[#687384] uppercase tracking-wider mb-1">Traffic Class</div>
          <div className="font-mono font-black text-xl text-[#FFE600]">{trafficClass}</div>
          <div className="font-mono text-[10px] text-[#687384] mt-1">Confidence: {confidence}%</div>
        </div>

        {/* Twin alignment */}
        <div className="border border-[#252B35] bg-[#0F1218] p-3">
          <div className="font-mono text-[10px] text-[#687384] uppercase tracking-wider mb-1">Twin Alignment</div>
          <div className={cn("font-mono font-black text-xl uppercase", alignment === "aligned" ? "text-[#22C55E]" : alignment === "partial" ? "text-[#F59E0B]" : "text-[#EF4444]")}>
            {alignment}
          </div>
          <div className="font-mono text-[10px] text-[#687384] mt-1">
            Score Δ: <span className={scoreDelta > 0 ? "text-[#22C55E]" : scoreDelta < 0 ? "text-[#EF4444]" : "text-[#9AA4B2]"}>
              {scoreDelta > 0 ? "+" : ""}{scoreDelta}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="border border-[#252B35] bg-[#0F1218] p-3">
          <div className="font-mono text-[10px] text-[#687384] uppercase tracking-wider mb-1">Metadata Exposure</div>
          <div className="font-mono font-black text-xl text-[#3B82F6]">{fi?.metadata?.dimensions?.length ?? 5} dims</div>
          <div className="font-mono text-[10px] text-[#22C55E] mt-1">Payload: NOT ACCESSED</div>
        </div>

        {/* Posture */}
        <div className="border border-[#252B35] bg-[#0F1218] p-3">
          <div className="font-mono text-[10px] text-[#687384] uppercase tracking-wider mb-1">Posture Timeline</div>
          <div className="font-mono font-black text-xl text-[#9AA4B2]">{fi?.posture?.total_sessions ?? 6} sessions</div>
          <div className="font-mono text-[10px] text-[#687384] mt-1">Updated</div>
        </div>

        {/* Reports */}
        <div className="border border-[#252B35] bg-[#0F1218] p-3">
          <div className="font-mono text-[10px] text-[#687384] uppercase tracking-wider mb-1">Reports</div>
          <div className="font-mono font-black text-xl text-[#22C55E]">2</div>
          <div className="font-mono text-[10px] text-[#687384] mt-1">Exec + Technical</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
        {[
          {
            label: "VIEW COMPLETE ANALYSIS",
            icon: <Shield className="w-3.5 h-3.5" />,
            route: `/analyses/${analysisId}`,
            primary: true,
          },
          {
            label: "OPEN SECURITY TWIN",
            icon: <GitCompare className="w-3.5 h-3.5" />,
            route: `/security-twin/${analysisId}`,
          },
          {
            label: "VIEW DRIFT",
            icon: <Activity className="w-3.5 h-3.5" />,
            route: `/compare`,
          },
          {
            label: "METADATA EXPOSURE",
            icon: <BarChart3 className="w-3.5 h-3.5" />,
            route: `/metadata-exposure`,
          },
          {
            label: "VIEW REPORT",
            icon: <FileText className="w-3.5 h-3.5" />,
            route: `/analyses/${analysisId}/reports`,
          },
          {
            label: "POSTURE TIMELINE",
            icon: <Brain className="w-3.5 h-3.5" />,
            route: `/posture`,
          },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => openRoute(action.route)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 font-mono text-[10px] font-bold tracking-wider uppercase border transition-all text-left",
              action.primary
                ? "border-[#FFE600] bg-[#FFE600]/10 text-[#FFE600] hover:bg-[#FFE600]/20 col-span-2 sm:col-span-1"
                : "border-[#252B35] bg-[#0F1218] text-[#9AA4B2] hover:border-[#3B82F6]/50 hover:text-[#F4F7FA] hover:bg-[#141820]"
            )}
          >
            {action.icon}
            <span className="truncate">{action.label}</span>
            <ExternalLink className="w-3 h-3 ml-auto shrink-0 opacity-50" />
          </button>
        ))}
      </div>

      {/* Footer controls */}
      <div className="p-4 pt-0 flex items-center gap-3 border-t border-[#252B35] mt-2 shrink-0">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-2 font-mono text-xs text-[#9AA4B2] border border-[#252B35] hover:border-[#3B82F6]/50 hover:text-[#F4F7FA] transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESTART DEMO
        </button>
        <button
          onClick={close}
          className="flex items-center gap-1.5 px-3 py-2 font-mono text-xs text-[#687384] border border-[#252B35] hover:border-[#EF4444]/50 hover:text-[#EF4444] transition-all"
        >
          <X className="w-3.5 h-3.5" />
          EXIT DEMO
        </button>
      </div>
    </div>
  );
}
