"use client";

import React from "react";
import { X, ChevronRight } from "lucide-react";
import { useJudgeDemoStore } from "@/store/judgeDemo";
import { STAGE_DEFINITIONS, DemoStageKey } from "@/demo/judgeEngine";
import { cn } from "@/lib/utils";

export function JudgeDemoHeader() {
  const { scenarioId, analysisId, currentStage, stageStatuses, close } = useJudgeDemoStore();

  const currentDef = STAGE_DEFINITIONS.find((s) => s.key === currentStage);
  const completedCount = Object.values(stageStatuses).filter((s) => s === "completed").length;

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#252B35] bg-[#090B10] shrink-0">
      {/* Left: Branding */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
          <span className="font-mono font-black text-sm tracking-[0.2em] text-[#F4F7FA] uppercase">
            ABHEDYAX
          </span>
          <span className="text-[#687384] font-mono text-sm">&#47;&#47;</span>
          <span className="font-mono font-bold text-sm tracking-[0.15em] text-[#22C55E] uppercase">
            JUDGE DEMO
          </span>
        </div>
        {currentDef && (
          <div className="hidden sm:flex items-center gap-1.5 text-[#687384]">
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono text-xs tracking-wide truncate text-[#9AA4B2]">
              {currentDef.shortTitle}
            </span>
          </div>
        )}
      </div>

      {/* Center: Status + scenario */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[#687384]">
          <span className="font-mono text-xs uppercase tracking-wider">Scenario:</span>
          <span className="font-mono text-xs text-[#F4F7FA] font-bold uppercase">
            {scenarioId.replace(/-/g, " ")}
          </span>
        </div>
        <div className="w-px h-4 bg-[#252B35]" />
        <div className="font-mono text-xs text-[#9AA4B2] tracking-wider">
          <span className="text-[#F4F7FA] font-bold">{analysisId}</span>
        </div>
      </div>

      {/* Right: Progress + close */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="font-mono text-xs tracking-wider">
          <span className="text-[#22C55E] font-bold">{completedCount}</span>
          <span className="text-[#687384]"> / 8 STAGES</span>
        </div>
        <button
          onClick={close}
          className="flex items-center justify-center w-7 h-7 border border-[#252B35] hover:border-[#EF4444] hover:text-[#EF4444] text-[#687384] transition-colors"
          title="Exit demo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
