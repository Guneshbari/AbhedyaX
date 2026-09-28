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
      style: "bg-[#38BDF8] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
    },
    Inferred: {
      label: "Protocol Inferred",
      icon: Cpu,
      style: "bg-[#C084FC] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
    },
    Simulated: {
      label: "Simulated Scenario",
      icon: TestTube,
      style: "bg-[#FBBF24] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
    },
    GroundTruth: {
      label: "Ground Truth Verified",
      icon: CheckCircle2,
      style: "bg-[#4ADE80] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
    },
    MLPrediction: {
      label: "ML Flow Inference",
      icon: Sparkles,
      style: "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]",
    },
  };

  const config = configs[source] || configs.Observed;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-black uppercase tracking-wider select-none shrink-0",
        config.style,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
      <span>{config.label}</span>
      {confidence !== undefined && (
        <span className="font-bold text-[10px] ml-0.5 bg-black text-white px-1">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  );
};
