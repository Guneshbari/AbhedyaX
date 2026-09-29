"use client";

import React from "react";
import { Check, Lock, Loader2, AlertCircle } from "lucide-react";
import { useJudgeDemoStore } from "@/store/judgeDemo";
import { STAGE_DEFINITIONS, DemoStageKey, StageStatus } from "@/demo/judgeEngine";
import { cn } from "@/lib/utils";

const STATUS_ICON: Record<StageStatus, React.ReactNode> = {
  locked: <Lock className="w-3 h-3" />,
  ready: null,
  running: <Loader2 className="w-3 h-3 animate-spin" />,
  validating: <Loader2 className="w-3 h-3 animate-spin" />,
  completed: <Check className="w-3 h-3 stroke-[2.5]" />,
  failed: <AlertCircle className="w-3 h-3" />,
};

const STATUS_COLOR: Record<StageStatus, string> = {
  locked: "text-[#687384] border-[#252B35]",
  ready: "text-[#F4F7FA] border-[#3B82F6] bg-[#3B82F6]/10",
  running: "text-[#F59E0B] border-[#F59E0B] bg-[#F59E0B]/10",
  validating: "text-[#3B82F6] border-[#3B82F6] bg-[#3B82F6]/10",
  completed: "text-[#22C55E] border-[#22C55E]/50 bg-[#22C55E]/8",
  failed: "text-[#EF4444] border-[#EF4444] bg-[#EF4444]/10",
};

const ACTIVE_COLOR = "border-[#FFE600] text-[#FFE600] bg-[#FFE600]/10";

export function JudgeDemoStageNavigator() {
  const { currentStage, stageStatuses, goToStage } = useJudgeDemoStore();

  return (
    <div className="flex flex-row lg:flex-col gap-0 border-b lg:border-b-0 lg:border-r border-[#252B35] bg-[#090B10] shrink-0 overflow-x-auto lg:overflow-x-visible lg:w-52 xl:w-60">
      <div className="hidden lg:flex items-center gap-2 px-4 py-3 border-b border-[#252B35]">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">
          WORKFLOW STAGES
        </span>
      </div>
      <div className="flex flex-row lg:flex-col w-full">
        {STAGE_DEFINITIONS.map((stage) => {
          const status = stageStatuses[stage.key];
          const isActive = currentStage === stage.key;
          const isClickable = status !== "locked";

          return (
            <button
              key={stage.key}
              onClick={() => goToStage(stage.key)}
              disabled={!isClickable}
              className={cn(
                "group flex items-center gap-2.5 px-3 py-3 text-left transition-all shrink-0",
                "border-b border-[#252B35] lg:border-b-0 lg:border-l-2 lg:border-b-0",
                "font-mono text-xs select-none whitespace-nowrap lg:whitespace-normal",
                isActive
                  ? "lg:border-l-[#FFE600] bg-[#FFE600]/5 " + ACTIVE_COLOR
                  : isClickable
                  ? cn(
                      "lg:border-l-transparent hover:bg-[#0F1218] hover:lg:border-l-[#252B35]",
                      STATUS_COLOR[status]
                    )
                  : "lg:border-l-transparent opacity-40 cursor-not-allowed " + STATUS_COLOR[status]
              )}
            >
              {/* Stage number badge */}
              <span
                className={cn(
                  "flex items-center justify-center w-5 h-5 shrink-0 text-[10px] font-black border",
                  isActive
                    ? "border-[#FFE600] text-[#FFE600] bg-[#FFE600]/15"
                    : status === "completed"
                    ? "border-[#22C55E]/60 text-[#22C55E] bg-[#22C55E]/10"
                    : status === "running" || status === "validating"
                    ? "border-[#F59E0B] text-[#F59E0B]"
                    : status === "ready"
                    ? "border-[#3B82F6]/60 text-[#3B82F6]"
                    : "border-[#252B35] text-[#687384]"
                )}
              >
                {status === "completed" ? (
                  <Check className="w-3 h-3 stroke-[2.5]" />
                ) : status === "running" || status === "validating" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  stage.number
                )}
              </span>

              {/* Stage title */}
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-[10px] font-bold tracking-[0.12em] uppercase truncate",
                    isActive ? "text-[#FFE600]" : ""
                  )}
                >
                  {stage.shortTitle}
                </div>
                {status !== "locked" && (
                  <div
                    className={cn(
                      "text-[9px] tracking-wider uppercase mt-0.5 hidden lg:block",
                      isActive
                        ? "text-[#FFE600]/70"
                        : status === "completed"
                        ? "text-[#22C55E]/70"
                        : status === "running" || status === "validating"
                        ? "text-[#F59E0B]/70"
                        : "text-[#687384]"
                    )}
                  >
                    {status === "running"
                      ? "EXECUTING..."
                      : status === "validating"
                      ? "VALIDATING..."
                      : status === "completed"
                      ? "COMPLETE"
                      : status === "ready"
                      ? "READY"
                      : "LOCKED"}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
