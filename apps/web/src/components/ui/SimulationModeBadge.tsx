import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulationModeBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export const SimulationModeBadge: React.FC<SimulationModeBadgeProps> = ({
  className,
  showIcon = true,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-black tracking-wider uppercase",
        "bg-[#FBBF24] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] select-none shrink-0",
        className
      )}
      title="Running in deterministic simulation mode for rapid testing & UX verification"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
      </span>
      {showIcon && <AlertCircle className="w-3.5 h-3.5 text-black stroke-[2.5]" />}
      <span>Simulation Mode</span>
    </div>
  );
};
