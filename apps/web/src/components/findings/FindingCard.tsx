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
    Critical: "bg-red-500/10 text-red-400 border-red-500/30",
    High: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    Informational: "bg-[#141820] text-[#9AA4B2] border-[#252B35]",
  }[finding.severity];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between relative",
        isSelected
          ? "bg-[#141820] border-blue-500 shadow-sm ring-1 ring-blue-500/30"
          : "bg-[#0F1218] border-[#252B35] hover:border-[#3B4252] hover:bg-[#141820]/40"
      )}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#687384] font-semibold">
              {finding.id}
            </span>
            <span className="text-[#3B4252]">•</span>
            <span
              className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider border",
                severityBadgeStyles
              )}
            >
              {finding.severity}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {finding.provenance && (
              <EvidenceBadge source={finding.provenance} />
            )}
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#141820] border border-[#252B35] text-[#9AA4B2] font-mono">
              {finding.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-[#F4F7FA] mb-1.5 leading-snug">
          {finding.title}
        </h4>

        {/* Short Description */}
        <p className="text-xs text-[#9AA4B2] line-clamp-2 leading-relaxed mb-3">
          {finding.description}
        </p>
      </div>

      {/* Footer Metrics */}
      <div className="pt-2.5 border-t border-[#252B35]/70 flex items-center justify-between text-xs text-[#687384]">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-blue-400" />
            <span>{finding.evidence.length} Evidence</span>
          </span>
          <span>•</span>
          <span>{(finding.confidence * 100).toFixed(0)}% Confidence</span>
        </div>

        <ChevronRight
          className={cn(
            "w-4 h-4 transition-transform",
            isSelected ? "text-blue-400 translate-x-0.5" : "text-[#687384]"
          )}
        />
      </div>
    </button>
  );
};
