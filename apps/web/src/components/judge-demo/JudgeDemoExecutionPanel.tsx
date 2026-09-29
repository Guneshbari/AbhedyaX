"use client";

import React from "react";
import { Loader2, Check, AlertCircle, ShieldOff } from "lucide-react";
import { useJudgeDemoStore } from "@/store/judgeDemo";
import { STAGE_DEFINITIONS } from "@/demo/judgeEngine";
import { cn } from "@/lib/utils";

export function JudgeDemoExecutionPanel() {
  const { currentStage, stageStatuses, stageLogs } = useJudgeDemoStore();

  const status = stageStatuses[currentStage];
  const logs = stageLogs[currentStage] ?? [];
  const def = STAGE_DEFINITIONS.find((s) => s.key === currentStage)!;
  const isRunning = status === "running";
  const isValidating = status === "validating";
  const isDone = status === "completed";

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      {/* Panel header */}
      <div className="flex items-center justify-between shrink-0">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">
          EXECUTION LOG
        </span>
        {(isRunning || isValidating) && (
          <div className="flex items-center gap-1.5 text-[#F59E0B]">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              {isValidating ? "VALIDATING" : "EXECUTING"}
            </span>
          </div>
        )}
        {isDone && (
          <div className="flex items-center gap-1.5 text-[#22C55E]">
            <Check className="w-3 h-3 stroke-[2.5]" />
            <span className="font-mono text-[10px] uppercase tracking-wider">COMPLETE</span>
          </div>
        )}
      </div>

      {/* Log terminal */}
      <div className="flex-1 min-h-0 bg-[#060810] border border-[#252B35] overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
        {logs.length === 0 && (
          <div className="text-[#687384] italic">
            {status === "ready" || status === "locked"
              ? "Click the primary action button to begin execution..."
              : "Initializing..."}
          </div>
        )}
        {logs.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "flex items-start gap-2 py-0.5 transition-opacity",
              !entry.done && (isRunning || isValidating) ? "opacity-60" : "opacity-100"
            )}
          >
            <span className="text-[#687384] shrink-0 mt-0.5 select-none">▸</span>
            <span
              className={cn(
                entry.text.includes("✓")
                  ? "text-[#22C55E]"
                  : entry.text.includes("NOT PERFORMED")
                  ? "text-[#F59E0B]"
                  : entry.done
                  ? "text-[#9AA4B2]"
                  : "text-[#F4F7FA]"
              )}
            >
              {entry.text}
            </span>
            {entry.done && !entry.text.includes("✓") && !entry.text.includes("NOT PERFORMED") && (
              <Check className="w-3 h-3 text-[#22C55E] shrink-0 mt-0.5" />
            )}
            {!entry.done && (isRunning || isValidating) && (
              <Loader2 className="w-3 h-3 text-[#F59E0B] animate-spin shrink-0 mt-0.5" />
            )}
          </div>
        ))}
        {isValidating && (
          <div className="flex items-center gap-2 py-0.5 mt-1">
            <span className="text-[#687384] shrink-0">▸</span>
            <span className="text-[#3B82F6]">Running stage validation checks...</span>
            <Loader2 className="w-3 h-3 text-[#3B82F6] animate-spin shrink-0" />
          </div>
        )}
      </div>

      {/* PCAP / demo mode notice */}
      {(currentStage === "packet-analysis" || currentStage === "normalization-flow") && (
        <div className="flex items-start gap-2 p-2.5 border border-[#F59E0B]/30 bg-[#F59E0B]/5 shrink-0">
          <ShieldOff className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
          <p className="font-mono text-[10px] text-[#F59E0B] leading-relaxed">
            DEMO MODE — Synthetic capture. TShark dissection simulated. Payload decryption is never
            performed.
          </p>
        </div>
      )}
    </div>
  );
}
