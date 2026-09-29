"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useJudgeDemoStore } from "@/store/judgeDemo";
import { JudgeDemoHeader } from "./JudgeDemoHeader";
import { JudgeDemoStageNavigator } from "./JudgeDemoStageNavigator";
import { JudgeDemoStageCard } from "./JudgeDemoStageCard";
import { JudgeDemoCompletionScreen } from "./JudgeDemoCompletionScreen";
import { JudgeDemoEntryScreen } from "./JudgeDemoEntryScreen";
import { cn } from "@/lib/utils";

/** Portal-based full-screen overlay for the Judge Demo */
export function JudgeDemoShell() {
  const { isOpen, close, demoComplete, stageStatuses } = useJudgeDemoStore();
  const [mounted, setMounted] = React.useState(false);

  // Track whether the demo has been started (at least stage 1 not in ready state)
  const firstStageStatus = stageStatuses["input"];
  const hasStarted = firstStageStatus !== "ready" && firstStageStatus !== "locked";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-[#090B10] text-[#F4F7FA]"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" }}
    >
      {/* Header */}
      <JudgeDemoHeader />

      {/* Body */}
      {demoComplete ? (
        /* Completion screen — full width */
        <div className="flex-1 min-h-0 overflow-y-auto">
          <JudgeDemoCompletionScreen />
        </div>
      ) : !hasStarted ? (
        /* Entry screen — shown before demo started */
        <div className="flex-1 min-h-0 overflow-y-auto">
          <JudgeDemoEntryScreen />
        </div>
      ) : (
        /* Main workflow */
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* Stage navigator */}
          <JudgeDemoStageNavigator />

          {/* Stage content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <JudgeDemoStageCard />
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
