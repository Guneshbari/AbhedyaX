"use client";

import React from "react";
import { Loader2, ExternalLink, HelpCircle, Play } from "lucide-react";
import { useJudgeDemoStore } from "@/store/judgeDemo";
import { STAGE_DEFINITIONS, DemoStageKey, SCENARIO_TO_ANALYSIS } from "@/demo/judgeEngine";
import { JudgeDemoExecutionPanel } from "./JudgeDemoExecutionPanel";
import { JudgeDemoValidationPanel } from "./JudgeDemoValidationPanel";
import { JudgeDemoOutputPanel } from "./JudgeDemoOutputPanel";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SCENARIO_OPTIONS = [
  { id: "secure-enterprise", label: "Secure Enterprise", score: 100, grade: "A", risk: "Low" },
  { id: "legacy-critical", label: "Legacy Critical", score: 25, grade: "F", risk: "Critical" },
  { id: "moderate-security", label: "Moderate Security", score: 80, grade: "B", risk: "Moderate" },
  { id: "traffic-anomaly", label: "Traffic Anomaly", score: 95, grade: "A", risk: "Low" },
  { id: "secure-ipv6", label: "Secure IPv6", score: 100, grade: "A", risk: "Low" },
  { id: "baseline-compliant", label: "Baseline Compliant", score: 100, grade: "A", risk: "Low" },
];

function riskColor(risk: string): string {
  if (risk === "Low") return "text-[#22C55E]";
  if (risk === "Moderate") return "text-[#F59E0B]";
  return "text-[#EF4444]";
}

export function JudgeDemoStageCard() {
  const {
    currentStage,
    stageStatuses,
    scenarioId,
    selectScenario,
    runStage,
    demoComplete,
  } = useJudgeDemoStore();
  const router = useRouter();

  const def = STAGE_DEFINITIONS.find((s) => s.key === currentStage)!;
  const status = stageStatuses[currentStage];
  const isRunning = status === "running" || status === "validating";
  const isCompleted = status === "completed";

  function handleRun() {
    if (!isRunning && status !== "locked") {
      runStage(currentStage);
    }
  }

  function handleOpenView() {
    if (!def.openViewRoute) return;
    const { close, analysisId } = useJudgeDemoStore.getState();
    let route = def.openViewRoute;
    if (route.includes("[id]")) route = route.replace("[id]", analysisId);
    close();
    router.push(route);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Stage header */}
      <div className="p-4 border-b border-[#252B35] shrink-0 bg-[#090B10]">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-7 h-7 border border-[#FFE600]/60 bg-[#FFE600]/10 shrink-0">
            <span className="font-mono font-black text-sm text-[#FFE600]">{def.number}</span>
          </div>
          <h3 className="font-mono font-black text-sm tracking-[0.1em] text-[#F4F7FA] uppercase">
            {def.title}
          </h3>
          <div
            className={cn(
              "ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border",
              status === "running" || status === "validating"
                ? "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10"
                : status === "completed"
                ? "border-[#22C55E]/50 text-[#22C55E] bg-[#22C55E]/8"
                : status === "ready"
                ? "border-[#3B82F6]/50 text-[#3B82F6] bg-[#3B82F6]/10"
                : "border-[#252B35] text-[#687384]"
            )}
          >
            {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
            {status === "running" ? "EXECUTING" : status === "validating" ? "VALIDATING" : status.toUpperCase()}
          </div>
        </div>

        {/* Purpose */}
        <p className="font-mono text-xs text-[#9AA4B2] leading-relaxed mb-2">{def.purpose}</p>

        {/* Judge question */}
        <div className="flex items-start gap-2 p-2 border border-[#3B82F6]/30 bg-[#3B82F6]/5">
          <HelpCircle className="w-3.5 h-3.5 text-[#3B82F6] shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-[#3B82F6] italic">{def.judgeQuestion}</p>
        </div>

        {/* Scenario selector (stage 1 only, when not running) */}
        {currentStage === "input" && !isCompleted && !isRunning && (
          <div className="mt-3">
            <div className="font-mono text-[10px] text-[#687384] uppercase tracking-wider mb-2">
              Select Scenario
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {SCENARIO_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selectScenario(opt.id)}
                  className={cn(
                    "text-left px-2 py-1.5 border font-mono text-[10px] transition-all",
                    scenarioId === opt.id
                      ? "border-[#FFE600] bg-[#FFE600]/10 text-[#FFE600]"
                      : "border-[#252B35] bg-[#141820] text-[#9AA4B2] hover:border-[#3B82F6]/50 hover:text-[#F4F7FA]"
                  )}
                >
                  <div className="font-bold uppercase truncate">{opt.label}</div>
                  <div className={cn("text-[9px] mt-0.5", riskColor(opt.risk))}>
                    {opt.score} · {opt.grade} · {opt.risk}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content area — 3 columns on large screens */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#252B35]">
          {/* Execution log */}
          <div className="p-4 min-h-0 flex flex-col overflow-hidden">
            <JudgeDemoExecutionPanel />
          </div>

          {/* Validation checks */}
          <div className="p-4 overflow-y-auto">
            <JudgeDemoValidationPanel />
          </div>

          {/* Stage output */}
          <div className="p-4 overflow-y-auto">
            <JudgeDemoOutputPanel />
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#252B35] bg-[#090B10] shrink-0">
        <div className="flex items-center gap-2">
          {/* Open View button */}
          {def.openViewRoute && isCompleted && (
            <button
              onClick={handleOpenView}
              className="flex items-center gap-1.5 px-3 py-2 font-mono text-[11px] text-[#9AA4B2] border border-[#252B35] hover:border-[#3B82F6]/50 hover:text-[#3B82F6] transition-all uppercase tracking-wider"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              OPEN VIEW
            </button>
          )}
        </div>

        {/* Primary action */}
        <button
          onClick={handleRun}
          disabled={isRunning || status === "locked"}
          className={cn(
            "flex items-center gap-2 px-4 py-2 font-mono text-xs font-black tracking-wider uppercase border transition-all",
            isRunning || status === "locked"
              ? "border-[#252B35] text-[#687384] cursor-not-allowed"
              : isCompleted
              ? "border-[#22C55E]/50 bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20"
              : "border-[#FFE600] bg-[#FFE600]/10 text-[#FFE600] hover:bg-[#FFE600]/20"
          )}
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {isRunning
            ? (status === "validating" ? "VALIDATING..." : "EXECUTING...")
            : isCompleted
            ? "RE-RUN STAGE"
            : def.primaryAction}
        </button>
      </div>
    </div>
  );
}
