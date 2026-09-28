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
    <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218]">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#252B35]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F7FA]">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Session Configuration Matrix</span>
        </div>
        <span className="text-[11px] font-mono text-[#687384]">
          {isPcap ? "Ingestion: PCAP" : `Scenario: ${scenario?.name ?? "Default"}`}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
          <span className="text-[10px] text-[#687384] uppercase block">Source</span>
          <span className="text-[#F4F7FA] font-semibold mt-0.5 truncate block">
            {isPcap ? fileName || "Pending Upload" : "Simulation Benchmark"}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
          <span className="text-[10px] text-[#687384] uppercase block">IKE Protocol</span>
          <span className="text-[#F4F7FA] font-semibold mt-0.5 block">{ikeVersion}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
          <span className="text-[10px] text-[#687384] uppercase block">Encapsulation</span>
          <span className="text-[#F4F7FA] font-semibold mt-0.5 block">
            {vpnMode} / {ipVersion}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
          <span className="text-[10px] text-[#687384] uppercase block">Cipher Suite</span>
          <span className="text-[#F4F7FA] font-semibold mt-0.5 truncate block" title={encryption}>
            {encryption}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
          <span className="text-[10px] text-[#687384] uppercase block">Authentication</span>
          <span className="text-[#F4F7FA] font-semibold mt-0.5 block">{authentication}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
          <span className="text-[10px] text-[#687384] uppercase block">Diffie-Hellman</span>
          <span className="text-[#F4F7FA] font-semibold mt-0.5 block">{dhGroup}</span>
        </div>

        <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
          <span className="text-[10px] text-[#687384] uppercase block">PFS Status</span>
          <span
            className={
              pfs === "Enabled"
                ? "text-emerald-400 font-semibold mt-0.5 block"
                : pfs === "Disabled"
                ? "text-amber-400 font-semibold mt-0.5 block"
                : "text-[#F4F7FA] font-semibold mt-0.5 block"
            }
          >
            {pfs}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
          <span className="text-[10px] text-[#687384] uppercase block">Inspection Engine</span>
          <span className="text-blue-400 font-semibold mt-0.5 block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AbhedyaX v0.1</span>
          </span>
        </div>
      </div>
    </div>
  );
};
