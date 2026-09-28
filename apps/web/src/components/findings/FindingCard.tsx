import React from "react";
import { Terminal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecurityFinding } from "@/types/analysis";
import { EvidenceBadge } from "@/components/analysis/EvidenceBadge";

interface FindingCardProps {
  finding: SecurityFinding;
  isSelected?: boolean;
  onSelect: () => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  isSelected = false,
  onSelect,
}) => {
  const severityBadgeStyles = {
    Critical: "bg-[#FF4B4B] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
    High: "bg-[#FB923C] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
    Medium: "bg-[#FBBF24] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
    Low: "bg-[#4ADE80] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
    Informational: "bg-white text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
  }[finding.severity];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 border-2 border-black transition-all duration-100 cursor-pointer flex flex-col justify-between relative",
        isSelected
          ? "bg-[#FFE600] shadow-[5px_5px_0px_0px_#000] translate-x-[-2px] translate-y-[-2px]"
          : "bg-white shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000]"
      )}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-black font-black bg-white px-1.5 py-0.2 border border-black shadow-[1px_1px_0px_0px_#000]">
              {finding.id}
            </span>
            <span
              className={cn(
                "text-[10px] font-mono px-2 py-0.5 font-black uppercase tracking-wider",
                severityBadgeStyles
              )}
            >
              {finding.severity}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {finding.provenance && (
              <EvidenceBadge source={finding.provenance} />
            )}
            <span className="text-[11px] px-2 py-0.5 bg-white border border-black text-black font-mono font-bold shadow-[1px_1px_0px_0px_#000]">
              {finding.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-black text-black mb-1.5 leading-snug">
          {finding.title}
        </h4>

        {/* Short Description */}
        <p className="text-xs text-zinc-800 line-clamp-2 leading-relaxed mb-3 font-medium">
          {finding.description}
        </p>
      </div>

      {/* Footer Metrics */}
      <div className="pt-2.5 border-t-2 border-black flex items-center justify-between text-xs text-black">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
          <span className="flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{finding.evidence.length} Evidence</span>
          </span>
          <span>•</span>
          <span>{(finding.confidence * 100).toFixed(0)}% Confidence</span>
        </div>

        <ChevronRight
          className={cn(
            "w-4 h-4 stroke-[3] transition-transform",
            isSelected ? "text-black translate-x-1" : "text-black"
          )}
        />
      </div>
    </button>
  );
};
