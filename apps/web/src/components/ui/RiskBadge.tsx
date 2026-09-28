import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskLevel } from "@/types/dashboard";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  className,
  showIcon = true,
}) => {
  const configs: Record<
    RiskLevel,
    { label: string; icon: React.FC<{ className?: string }>; style: string }
  > = {
    Low: {
      label: "Low Risk",
      icon: ShieldCheck,
      style: "bg-[#4ADE80] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
    },
    Moderate: {
      label: "Moderate Risk",
      icon: ShieldAlert,
      style: "bg-[#FBBF24] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
    },
    Medium: {
      label: "Medium Risk",
      icon: ShieldAlert,
      style: "bg-[#FBBF24] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
    },
    High: {
      label: "High Risk",
      icon: AlertTriangle,
      style: "bg-[#FB923C] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
    },
    Critical: {
      label: "Critical Risk",
      icon: Flame,
      style: "bg-[#FF4B4B] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
    },
  };

  const config = configs[level] || configs.Low;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider select-none shrink-0",
        config.style,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />}
      <span>{config.label}</span>
    </span>
  );
};
