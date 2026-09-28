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
      badge: "TShark Analysis Available",
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
              "p-5 border-2 border-black text-left transition-all duration-100 cursor-pointer relative",
              isSelected
                ? "bg-[#FFE600] shadow-[5px_5px_0px_0px_#000] translate-x-[-2px] translate-y-[-2px]"
                : "bg-white shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000]"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={cn(
                  "p-2.5 border-2 border-black text-black",
                  isSelected ? "bg-white shadow-[2px_2px_0px_0px_#000]" : "bg-[#FFE600] shadow-[2px_2px_0px_0px_#000]"
                )}
              >
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-black",
                    isSelected ? "bg-black text-[#FFE600]" : "bg-white text-black shadow-[1px_1px_0px_0px_#000]"
                  )}
                >
                  {opt.badge}
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-black stroke-[3] shrink-0" />
                )}
              </div>
            </div>

            <h3 className="text-base font-black text-black mb-1">
              {opt.label}
            </h3>
            <p className="text-xs text-zinc-800 leading-relaxed font-medium">
              {opt.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
