import React from "react";
import { Cpu, UploadCloud, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceSelectorProps {
  selectedSource: "simulation" | "pcap";
  onSelectSource: (source: "simulation" | "pcap") => void;
}

export const SourceSelector: React.FC<SourceSelectorProps> = ({
  selectedSource,
  onSelectSource,
}) => {
  const options = [
    {
      id: "simulation" as const,
      label: "Simulation Scenarios",
      description:
        "Execute standardized RFC benchmark scenarios with deterministic cryptographic parameters",
      icon: Cpu,
      badge: "Recommended for Demo",
    },
    {
      id: "pcap" as const,
      label: "PCAP / PCAPNG Ingestion",
      description:
        "Upload Wireshark or tcpdump capture file containing IKE & ESP traffic flows",
      icon: UploadCloud,
      badge: "Simulation Mode Active",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((opt) => {
        const isSelected = selectedSource === opt.id;
        const Icon = opt.icon;

        return (
          <button
            type="button"
            key={opt.id}
            onClick={() => onSelectSource(opt.id)}
            className={cn(
              "p-5 rounded-xl border text-left transition-all duration-150 cursor-pointer relative",
              isSelected
                ? "bg-[#141820] border-blue-500 shadow-sm"
                : "bg-[#0F1218] border-[#252B35] hover:border-[#3B4252] hover:bg-[#141820]/50"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={cn(
                  "p-2.5 rounded-lg border transition-colors",
                  isSelected
                    ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                    : "bg-[#141820] border-[#252B35] text-[#9AA4B2]"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded border",
                    isSelected
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : "bg-[#141820] border-[#252B35] text-[#687384]"
                  )}
                >
                  {opt.badge}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                )}
              </div>
            </div>

            <h3 className="text-sm font-semibold text-[#F4F7FA] mb-1">
              {opt.label}
            </h3>
            <p className="text-xs text-[#9AA4B2] leading-relaxed">
              {opt.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
