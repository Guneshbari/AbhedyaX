import React from "react";
import { Sliders, ShieldCheck } from "lucide-react";
import { ScenarioDefinition } from "@/types/analysis";

interface ConfigurationSummaryProps {
  sourceType: "simulation" | "pcap";
  scenario?: ScenarioDefinition | null;
  fileName?: string | null;
}

export const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
  sourceType,
  scenario,
  fileName,
}) => {
  const isPcap = sourceType === "pcap";

  const ikeVersion = isPcap ? "Auto-Detect (IKEv2/v1)" : scenario?.vpn.ike_version ?? "IKEv2";
  const vpnMode = isPcap ? "Auto-Detect (Tunnel)" : scenario?.vpn.mode ?? "Tunnel";
  const ipVersion = isPcap ? "Auto-Detect (IPv4)" : scenario?.vpn.ip_version ?? "IPv4";
  const encryption = isPcap ? "Heuristic Extraction" : scenario?.cryptography.encryption ?? "AES-256-GCM";
  const authentication = isPcap ? "Transform Inspection" : scenario?.cryptography.authentication ?? "AEAD";
  const dhGroup = isPcap ? "IKE Proposal Parse" : scenario?.cryptography.dh_group ?? "DH Group 19";
  const pfs = isPcap ? "Rekeying Verification" : scenario?.cryptography.pfs ? "Enabled" : "Disabled";

  return (
    <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
        <div className="flex items-center gap-2 text-sm sm:text-base font-black text-black">
          <Sliders className="w-4 h-4 stroke-[2.5]" />
          <span>Session Configuration Matrix</span>
        </div>
        <span className="text-xs font-mono font-bold text-black bg-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
          {isPcap ? "Ingestion: PCAP" : `Scenario: ${scenario?.name ?? "Default"}`}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs font-mono">
        <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-600 uppercase font-black block">Source</span>
          <span className="text-black font-black mt-0.5 truncate block">
            {isPcap ? fileName || "Pending Upload" : "Simulation Benchmark"}
          </span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-600 uppercase font-black block">IKE Protocol</span>
          <span className="text-black font-black mt-0.5 block">{ikeVersion}</span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-600 uppercase font-black block">Encapsulation</span>
          <span className="text-black font-black mt-0.5 block">
            {vpnMode} / {ipVersion}
          </span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-600 uppercase font-black block">Cipher Suite</span>
          <span className="text-black font-black mt-0.5 truncate block" title={encryption}>
            {encryption}
          </span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-600 uppercase font-black block">Authentication</span>
          <span className="text-black font-black mt-0.5 block">{authentication}</span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-600 uppercase font-black block">Diffie-Hellman</span>
          <span className="text-black font-black mt-0.5 block">{dhGroup}</span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-600 uppercase font-black block">PFS Status</span>
          <span
            className={
              pfs === "Enabled"
                ? "text-emerald-700 font-black mt-0.5 block"
                : pfs === "Disabled"
                ? "text-amber-700 font-black mt-0.5 block"
                : "text-black font-black mt-0.5 block"
            }
          >
            {pfs}
          </span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-600 uppercase font-black block">Inspection Engine</span>
          <span className="text-black font-black mt-0.5 block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>AbhedyaX v0.1</span>
          </span>
        </div>
      </div>
    </div>
  );
};
