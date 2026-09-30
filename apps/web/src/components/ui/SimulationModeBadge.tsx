"use client";

import React from "react";
import { Zap, CheckCircle2, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataProvider } from "@/lib/providers";
import { useDemoJourney, DEMO_PRIMARY_ID } from "@/store/demoJourney";
import { useRouter } from "next/navigation";

interface SimulationModeBadgeProps {
  className?: string;
  showIcon?: boolean;
  isInteractive?: boolean;
}

export const SimulationModeBadge: React.FC<SimulationModeBadgeProps> = ({
  className,
  showIcon = true,
  isInteractive = true,
}) => {
  const { effectiveMode, mode } = useDataProvider();
  const { isActive, startDemo, exitDemo } = useDemoJourney();
  const router = useRouter();

  const isDemo = effectiveMode === "demo";

  function handleClick() {
    if (isActive) {
      exitDemo();
    } else {
      startDemo(DEMO_PRIMARY_ID);
      router.push(`/analyses/${DEMO_PRIMARY_ID}`);
    }
  }




  const badgeContent = (
    <>
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            isActive ? "bg-[#22C55E]" : "bg-black"
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            isActive ? "bg-[#22C55E]" : "bg-black"
          )}
        />
      </span>
      {showIcon &&
        (isActive ? (
          <PlayCircle className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0" />
        ) : isDemo ? (
          <Zap className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0" />
        ))}
      <span className="truncate">
        {isActive
          ? "EXIT DEMO"
          : isDemo
          ? "JUDGE DEMO"
          : "API Connected"}
      </span>

    </>
  );

  const baseClasses = cn(
    "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-black tracking-wider uppercase",
    "border-2 border-black shadow-[2px_2px_0px_0px_#000] select-none shrink-0",
    isActive
      ? "bg-[#4ADE80] text-black"
      : isDemo
      ? "bg-[#FFE600] text-black"
      : "bg-[#4ADE80] text-black",
    isInteractive
      ? "hover:opacity-90 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
      : "cursor-default",
    className
  );

  if (!isInteractive) {
    return (
      <div
        className={baseClasses}
        title={`Runtime mode: ${isDemo ? "Demo Mode" : "API Connected"}`}
      >
        {badgeContent}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={baseClasses}
      title={
        isActive
          ? "Exit guided demo journey"
          : "Start guided judge demo — follow the AbhedyaX analysis pipeline"
      }
    >
      {badgeContent}
    </button>
  );
};
