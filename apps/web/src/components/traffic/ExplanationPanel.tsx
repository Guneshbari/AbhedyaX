import React from "react";
import { HelpCircle, AlertCircle } from "lucide-react";
import { TrafficIntelligence } from "@/types/analysis";

interface ExplanationPanelProps {
  traffic: TrafficIntelligence;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  traffic,
}) => {
  const getRationale = (cls: string) => {
    switch (cls.toLowerCase()) {
      case "video":
        return [
          "High average frame size clustered near maximum transmission unit (MTU ~1420 bytes).",
          "Continuous high-throughput burst cadence with low inter-packet delay variance.",
          "Strong downstream asymmetry indicative of streaming media ingest.",
        ];
      case "voip":
        return [
          "Fixed small packet lengths (typically 160–220 bytes) corresponding to audio codec samples (e.g. G.711 / Opus).",
          "Strict deterministic inter-arrival intervals (20ms packetization cadence).",
          "Symmetric bidirectional flow profile representing two-way audio streams.",
        ];
      case "web":
        return [
          "Bimodal packet size distribution (small TCP ACKs alternating with full-frame payload buffers).",
          "Burstiness characterized by rapid bursts followed by idle human comprehension intervals.",
          "Bidirectional exchange reflecting HTTP/2 or HTTP/3 multiplexed requests and responses.",
        ];
      case "messaging":
        return [
          "Predominance of small payload transfers with long idle gaps between message dispatches.",
          "Low total bandwidth utilization and sporadic heartbeat keepalives.",
          "Low packet count per transmission burst.",
        ];
      case "unknown":
        return [
          "Statistical entropy and burst variance deviate from all trained canonical application distributions.",
          "Irregular packet spacing and non-standard length distributions.",
          "Requires manual packet trace inspection to rule out custom protocols, tunneling-in-tunneling, or covert channels.",
        ];
      default:
        return [
          "Consistent metadata profile mapped against encrypted statistical classifier thresholds.",
        ];
    }
  };

  const rationaleItems = getRationale(traffic.predicted_class);

  return (
    <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-[#252B35]">
        <HelpCircle className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-[#F4F7FA]">
          Why this classification? (Simulated Classifier Reasoning)
        </h3>
      </div>

      <div className="space-y-2 text-xs text-[#9AA4B2] leading-relaxed">
        <p>
          AbhedyaX employs zero-payload traffic inspection algorithms. The
          underlying ML architecture classifies application behavior{" "}
          <strong className="text-[#F4F7FA]">
            without decrypting IPsec ESP payloads
          </strong>
          , preserving confidential data streams while enabling SOC situational
          awareness.
        </p>

        <div className="p-4 rounded-lg bg-[#141820] border border-[#252B35] space-y-2 my-2">
          <span className="text-[11px] uppercase font-mono font-semibold text-blue-400 block">
            Observed Heuristic Triggers for {traffic.predicted_class}:
          </span>
          <ul className="space-y-1 text-xs text-[#F4F7FA] list-disc list-inside">
            {rationaleItems.map((item, idx) => (
              <li key={idx}>
                <span className="text-[#9AA4B2]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prototype Disclosure Disclaimer */}
      <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-amber-400">
            Prototype Phase Disclaimer:{" "}
          </span>
          <span className="text-[#9AA4B2]">
            Traffic classification in Phase 1 is executed by the{" "}
            <code className="text-amber-300 font-mono">MockAnalysisEngine</code>{" "}
            using deterministic ground-truth scenario models. Live ONNX-runtime
            inference with trained models will be plugged in during Phase 4
            without altering this API contract.
          </span>
        </div>
      </div>
    </div>
  );
};
