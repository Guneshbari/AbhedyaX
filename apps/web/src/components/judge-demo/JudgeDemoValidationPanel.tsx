"use client";

import React from "react";
import { Check, X, ShieldCheck, AlertTriangle } from "lucide-react";
import { useJudgeDemoStore } from "@/store/judgeDemo";
import { cn } from "@/lib/utils";

export function JudgeDemoValidationPanel() {
  const { currentStage, stageStatuses, stageValidations } = useJudgeDemoStore();
  const status = stageStatuses[currentStage];
  const validations = stageValidations[currentStage] ?? [];

  const allPassed = validations.length > 0 && validations.every((v) => v.passed);
  const hasFailed = validations.some((v) => !v.passed);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">
          VALIDATION CHECKS
        </span>
        {allPassed && (
          <div className="flex items-center gap-1 text-[#22C55E]">
            <ShieldCheck className="w-3 h-3" />
            <span className="font-mono text-[10px] tracking-wider uppercase">ALL PASS</span>
          </div>
        )}
        {hasFailed && (
          <div className="flex items-center gap-1 text-[#EF4444]">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-mono text-[10px] tracking-wider uppercase">FAILED</span>
          </div>
        )}
      </div>

      {/* Validation list */}
      <div className="border border-[#252B35] bg-[#0F1218] divide-y divide-[#252B35]">
        {validations.length === 0 ? (
          <div className="px-3 py-2 font-mono text-[11px] text-[#687384] italic">
            {status === "completed" ? "No checks recorded." : "Checks will appear after execution."}
          </div>
        ) : (
          validations.map((v, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2">
              <span
                className={cn(
                  "flex items-center justify-center w-4 h-4 shrink-0",
                  v.passed
                    ? "text-[#22C55E]"
                    : "text-[#EF4444]"
                )}
              >
                {v.passed ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </span>
              <span
                className={cn(
                  "font-mono text-[11px]",
                  v.passed ? "text-[#9AA4B2]" : "text-[#EF4444]"
                )}
              >
                {v.label}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
