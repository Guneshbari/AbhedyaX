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
      color: "bg-[#38BDF8] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]",
    },
    {
      time: "T+0.045s",
      type: "Control Plane",
      title: "IKE_AUTH Exchange Completed",
      desc: "Mutual gateway authentication verified; initial Child SA security associations established.",
      icon: Shield,
      color: "bg-[#4ADE80] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]",
    },
    {
      time: "T+0.088s",
      type: "Data Plane",
      title: "ESP Tunnel Enters Active State",
      desc: "Encapsulating Security Payload (Protocol 50) transmissions commence under active SPI.",
      icon: Activity,
      color: "bg-[#C084FC] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]",
    },
    {
      time: "T+4.200s",
      type: "Traffic Inference",
      title: `Statistical Signature Identified: ${predictedClass}`,
      desc: `Packet length histogram and inter-arrival regularity stabilize, triggering high-confidence classification as ${predictedClass}.`,
      icon: Radio,
      color: "bg-[#FFE600] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]",
    },
    {
      time: `T+${Math.min(durationSeconds, 240)}s`,
      type: "Liveness Check",
      title: "Dead Peer Detection (DPD) Keepalive",
      desc: "IKE informational keepalive round-trip verified without tunnel interruption.",
      icon: Clock,
      color: "bg-white text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]",
    },
  ];

  return (
    <div className="p-5 sm:p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black">
        <div className="flex items-center gap-2 text-sm sm:text-base font-black text-black">
          <Clock className="w-4 h-4 stroke-[2.5]" />
          <span>Traffic & Protocol Exchange Timeline</span>
        </div>
        <span className="text-xs font-mono font-bold text-black bg-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
          Deterministic Sequence
        </span>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-1 before:bg-black">
        {events.map((ev, i) => {
          const Icon = ev.icon;
          return (
            <div key={i} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-black bg-[#FFE600] shadow-[1px_1px_0px_0px_#000] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
              </div>

              {/* Event Content */}
              <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-black">
                      {ev.time}
                    </span>
                    <span className="text-black font-black">•</span>
                    <span
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 uppercase font-bold",
                        ev.color
                      )}
                    >
                      {ev.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <h4 className="text-xs sm:text-sm font-black text-black">
                      {ev.title}
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-medium">
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
