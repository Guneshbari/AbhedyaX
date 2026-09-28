import React from "react";
import { Clock, Shield, Activity, Radio, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrafficTimelineProps {
  predictedClass: string;
  durationSeconds: number;
}

export const TrafficTimeline: React.FC<TrafficTimelineProps> = ({
  predictedClass,
  durationSeconds,
}) => {
  const events = [
    {
      time: "T+0.000s",
      type: "Control Plane",
      title: "IKE_SA_INIT Negotiation",
      desc: "Diffie-Hellman public nonces and transform proposals exchanged over UDP 500.",
      icon: KeyRound,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/25",
    },
    {
      time: "T+0.045s",
      type: "Control Plane",
      title: "IKE_AUTH Exchange Completed",
      desc: "Mutual gateway authentication verified; initial Child SA security associations established.",
      icon: Shield,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    },
    {
      time: "T+0.088s",
      type: "Data Plane",
      title: "ESP Tunnel Enters Active State",
      desc: "Encapsulating Security Payload (Protocol 50) transmissions commence under active SPI.",
      icon: Activity,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/25",
    },
    {
      time: "T+4.200s",
      type: "Traffic Inference",
      title: `Statistical Signature Identified: ${predictedClass}`,
      desc: `Packet length histogram and inter-arrival regularity stabilize, triggering high-confidence classification as ${predictedClass}.`,
      icon: Radio,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/25",
    },
    {
      time: `T+${Math.min(durationSeconds, 240)}s`,
      type: "Liveness Check",
      title: "Dead Peer Detection (DPD) Keepalive",
      desc: "IKE informational keepalive round-trip verified without tunnel interruption.",
      icon: Clock,
      color: "text-[#9AA4B2] bg-[#141820] border-[#252B35]",
    },
  ];

  return (
    <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F7FA]">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Traffic & Protocol Exchange Timeline</span>
        </div>
        <span className="text-[11px] font-mono text-[#687384]">
          Deterministic Sequence
        </span>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#252B35]">
        {events.map((ev, i) => {
          const Icon = ev.icon;
          return (
            <div key={i} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full border border-[#252B35] bg-[#0F1218] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>

              {/* Event Content */}
              <div className="p-3.5 rounded-lg bg-[#141820]/70 border border-[#252B35]/70 space-y-1 transition-colors hover:border-[#3B4252]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-blue-400">
                      {ev.time}
                    </span>
                    <span className="text-[#3B4252]">•</span>
                    <span
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.2 rounded border uppercase font-medium",
                        ev.color
                      )}
                    >
                      {ev.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#9AA4B2]" />
                    <h4 className="text-xs font-semibold text-[#F4F7FA]">
                      {ev.title}
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-[#9AA4B2] leading-relaxed">
                  {ev.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
