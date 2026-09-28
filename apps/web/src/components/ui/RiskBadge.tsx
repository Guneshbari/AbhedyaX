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
    { label: string; icon: React.FC<{ className?: string }>; style: string; text: string }
  > = {
    Low: {
      label: "Low Risk",
      icon: ShieldCheck,
      style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      text: "text-emerald-400",
    },
    Medium: {
      label: "Medium Risk",
      icon: ShieldAlert,
      style: "bg-amber-500/10 text-amber-400 border-amber-500/25",
      text: "text-amber-400",
    },
    High: {
      label: "High Risk",
      icon: AlertTriangle,
      style: "bg-orange-500/10 text-orange-400 border-orange-500/25",
      text: "text-orange-400",
    },
    Critical: {
      label: "Critical Risk",
      icon: Flame,
      style: "bg-red-500/10 text-red-400 border-red-500/25",
      text: "text-red-400",
    },
  };

  const config = configs[level] || configs.Low;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border select-none",
        config.style,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
