import React from "react";
import { cn } from "@/lib/utils";
import { EvidenceProvenanceSource } from "@/types/analysis";
import { Eye, Cpu, TestTube, CheckCircle2, Sparkles } from "lucide-react";

interface EvidenceBadgeProps {
  source: EvidenceProvenanceSource | string;
  confidence?: number;
  className?: string;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  source,
  confidence,
  className,
}) => {
  const configs: Record<
    string,
    { label: string; icon: React.FC<{ className?: string }>; style: string }
  > = {
    Observed: {
      label: "Wire Observed",
      icon: Eye,
      style: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    Inferred: {
      label: "Protocol Inferred",
      icon: Cpu,
      style: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    Simulated: {
      label: "Simulated Scenario",
      icon: TestTube,
      style: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    GroundTruth: {
      label: "Ground Truth Verified",
      icon: CheckCircle2,
      style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    MLPrediction: {
      label: "ML Flow Inference",
      icon: Sparkles,
      style: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
  };

  const config = configs[source] || configs.Observed;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium border select-none",
        config.style,
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
      {confidence !== undefined && (
        <span className="opacity-70 text-[10px] ml-0.5">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </span>
  );
};
