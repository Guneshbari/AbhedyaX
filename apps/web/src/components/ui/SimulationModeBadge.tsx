"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataProvider } from "@/lib/providers";
import { DataModeModal } from "./DataModeModal";

interface SimulationModeBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export const SimulationModeBadge: React.FC<SimulationModeBadgeProps> = ({
  className,
  showIcon = true,
}) => {
  const { effectiveMode, mode } = useDataProvider();
  const [modalOpen, setModalOpen] = useState(false);

  const isDemo = effectiveMode === "demo";

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-black tracking-wider uppercase",
          "border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer select-none shrink-0",
          isDemo
            ? "bg-[#FFE600] text-black hover:bg-[#FCD34D]"
            : "bg-[#4ADE80] text-black hover:bg-[#22C55E]",
          className
        )}
        title="Click to view or change runtime data mode (Demo / Auto / Live API)"
      >
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              isDemo ? "bg-black" : "bg-black"
            )}
          />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
        </span>
        {showIcon &&
          (isDemo ? (
            <Zap className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          ))}
        <span>{isDemo ? (mode === "auto" ? "Demo (Auto)" : "Demo Mode") : "API Connected"}</span>
      </button>

      <DataModeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
