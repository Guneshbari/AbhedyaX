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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide",
        "bg-amber-500/10 text-amber-400 border border-amber-500/25 select-none",
        className
      )}
      title="Running in deterministic simulation mode for rapid testing & UX verification"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
      </span>
      {showIcon && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
      <span>Simulation Mode</span>
    </div>
  );
};
