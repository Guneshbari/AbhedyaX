import React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalysisStatus } from "@/types/dashboard";

interface StatusBadgeProps {
  status: AnalysisStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  const configs: Record<
    AnalysisStatus,
    { label: string; icon: React.FC<{ className?: string }>; style: string; dot: string }
  > = {
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    processing: {
      label: "Processing",
      icon: Clock,
      style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      dot: "bg-blue-400 animate-pulse",
    },
    warning: {
      label: "Issues Found",
      icon: AlertTriangle,
      style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
    },
    failed: {
      label: "Failed",
      icon: XCircle,
      style: "bg-red-500/10 text-red-400 border-red-500/20",
      dot: "bg-red-400",
    },
  };

  const config = configs[status] || configs.completed;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none",
        config.style,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
