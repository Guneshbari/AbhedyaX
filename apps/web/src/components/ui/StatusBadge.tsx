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
      style: "bg-[#4ADE80] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
      dot: "bg-black",
    },
    processing: {
      label: "Processing",
      icon: Clock,
      style: "bg-[#38BDF8] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
      dot: "bg-black animate-pulse",
    },
    warning: {
      label: "Issues Found",
      icon: AlertTriangle,
      style: "bg-[#FBBF24] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
      dot: "bg-black",
    },
    failed: {
      label: "Failed",
      icon: XCircle,
      style: "bg-[#FF4B4B] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
      dot: "bg-black",
    },
  };

  const config = configs[status] || configs.completed;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-black select-none shrink-0",
        config.style,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full border border-black", config.dot)} />
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />}
      <span>{config.label}</span>
    </span>
  );
};
