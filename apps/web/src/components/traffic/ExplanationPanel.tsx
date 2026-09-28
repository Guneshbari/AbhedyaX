import React from "react";
import { HelpCircle, AlertCircle, Cpu, CheckCircle2, BarChart3 } from "lucide-react";
import { TrafficIntelligence } from "@/types/analysis";

interface ExplanationPanelProps {
  traffic: TrafficIntelligence;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  traffic,
}) => {
  const isMl = traffic.classification_mode === "ml" || Boolean(traffic.model?.name);
  const explanations = traffic.explanation || [];

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
      case "email":
        return [
          "Short transactional bursts with command-response phases followed by bulk text/MIME transfer.",
          "Moderate packet size variance with distinctive initial handshake timing.",
          "Intermittent idle gaps between outbound mail delivery sessions.",
        ];
      case "icmp":
        return [
          "Fixed small packet sizes (typically 64–84 bytes) and constant inter-arrival cadence.",
          "Strictly symmetric request/reply count with 1:1 forward-to-reverse packet ratio.",
          "Zero application payload entropy variation.",
        ];
      case "unknown":
        return [
          "Statistical entropy and burst variance deviate from all trained canonical application distributions.",
          "Irregular packet spacing and non-standard length distributions.",
          "Confidence below operational abstention threshold (55%); requires manual packet trace inspection.",
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
      <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
        <div className="flex items-center gap-2">
          {isMl ? (
            <Cpu className="w-4 h-4 text-emerald-400" />
          ) : (
            <HelpCircle className="w-4 h-4 text-blue-400" />
          )}
          <h3 className="text-sm font-semibold text-[#F4F7FA]">
            {isMl
              ? "Why this classification? (ML Feature Importance)"
              : "Why this classification? (Simulated Classifier Reasoning)"}
          </h3>
        </div>
        {traffic.model && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25">
            {traffic.model.name} v{traffic.model.version}
          </span>
        )}
      </div>

      <div className="space-y-3 text-xs text-[#9AA4B2] leading-relaxed">
        <p>
          AbhedyaX employs zero-payload traffic inspection algorithms. The
          underlying ML architecture classifies application behavior{" "}
          <strong className="text-[#F4F7FA]">
            without decrypting IPsec ESP payloads
          </strong>
          , preserving confidential data streams while enabling SOC situational
          awareness.
        </p>

        {/* Real ML Top Contributing Features */}
        {isMl && explanations.length > 0 && (
          <div className="p-4 rounded-lg bg-[#141820] border border-[#252B35] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono font-semibold text-blue-400 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                Top Contributing Features:
              </span>
              <span className="text-[10px] text-[#687384] font-mono">
                Relative Weight
              </span>
            </div>

            <div className="space-y-2">
              {explanations.map((exp, idx) => {
                const pct = Math.min(100, Math.round(exp.importance * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-[#F4F7FA]">
                        {exp.feature}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-[#687384]">
                          val: {typeof exp.value === "number" ? exp.value.toFixed(2) : String(exp.value)}
                        </span>
                        <span className="font-mono text-[11px] text-emerald-400">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#090B10] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Heuristic / Behavioral Insights */}
        <div className="p-4 rounded-lg bg-[#141820] border border-[#252B35] space-y-2">
          <span className="text-[11px] uppercase font-mono font-semibold text-blue-400 block">
            Observed Behavioral Indicators for {traffic.predicted_class}:
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

      {/* Operational Status / Disclaimer */}
      {isMl ? (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-emerald-400">
              Active Production ML Inference:{" "}
            </span>
            <span className="text-[#9AA4B2]">
              Flow features were extracted using zero-payload ESP dissection and
              evaluated using the active{" "}
              <code className="text-emerald-300 font-mono">
                {traffic.model?.name ?? "traffic_classifier"}
              </code>{" "}
              model. Classification is non-destructive and privacy-preserving.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-400">
              Simulation Mode Notice:{" "}
            </span>
            <span className="text-[#9AA4B2]">
              Traffic classification is currently executed using deterministic
              mock scenario profiles. Train and activate an ML model artifact in
              AI Intelligence to run live machine learning classification.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
