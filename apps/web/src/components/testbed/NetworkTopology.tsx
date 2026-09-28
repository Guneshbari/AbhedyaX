import React from "react";
import { Server, Shield, Network, Laptop, Activity, Radio } from "lucide-react";

interface NetworkTopologyProps {
  ikeVersion: string;
  encryption: string;
  dhGroup: string;
  ipVersion: string;
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  ikeVersion,
  encryption,
  dhGroup,
  ipVersion,
}) => {
  return (
    <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F7FA]">
          <Network className="w-4 h-4 text-blue-400" />
          <span>Virtual Network Namespace (netns) Topology</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400">strongSwan 5.9 Link Active</span>
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-2 relative">
        {/* Node 1: Initiator Client */}
        <div className="p-4 rounded-xl bg-[#141820] border border-[#252B35] space-y-2 relative group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              ns_initiator
            </span>
            <Laptop className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F4F7FA]">
              VPN Client / Initiator
            </h4>
            <div className="text-[11px] font-mono text-[#9AA4B2] mt-1 space-y-0.5">
              <div>IP: {ipVersion === "IPv6" ? "2001:db8:1::2/64" : "10.0.1.2/24"}</div>
              <div>swanctl: charon-client</div>
            </div>
          </div>
        </div>

        {/* Node 2: Impairment Router & Network */}
        <div className="p-4 rounded-xl bg-[#141820] border border-[#252B35] space-y-2 relative group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              ns_router
            </span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F4F7FA]">
              Impairment Router
            </h4>
            <div className="text-[11px] font-mono text-[#9AA4B2] mt-1 space-y-0.5">
              <div>tc netem (20ms latency)</div>
              <div>tcpdump packet tap</div>
            </div>
          </div>
        </div>

        {/* Node 3: VPN Gateway / Responder */}
        <div className="p-4 rounded-xl bg-[#141820] border border-[#252B35] space-y-2 relative group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ns_responder
            </span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F4F7FA]">
              Security Gateway
            </h4>
            <div className="text-[11px] font-mono text-[#9AA4B2] mt-1 space-y-0.5">
              <div>IP: {ipVersion === "IPv6" ? "2001:db8:2::2/64" : "10.0.2.2/24"}</div>
              <div>charon-systemd 5.9.14</div>
            </div>
          </div>
        </div>

        {/* Node 4: Protected Corporate Subnet */}
        <div className="p-4 rounded-xl bg-[#141820] border border-[#252B35] space-y-2 relative group hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#090B10] text-[#9AA4B2] border border-[#252B35]">
              Target Subnet
            </span>
            <Server className="w-4 h-4 text-[#9AA4B2]" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F4F7FA]">
              Protected Network
            </h4>
            <div className="text-[11px] font-mono text-[#9AA4B2] mt-1 space-y-0.5">
              <div>192.168.100.0/24</div>
              <div>Isolated Internal Services</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active IPsec Negotiation Tunnel Pill */}
      <div className="p-3 rounded-lg bg-[#090B10] border border-blue-500/25 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="text-[#687384]">Negotiated Tunnel:</span>
          <span className="text-[#F4F7FA] font-bold">
            {ikeVersion} • {encryption} • {dhGroup}
          </span>
        </div>
        <span className="text-emerald-400 font-semibold">
          ESP Protocol 50 Active
        </span>
      </div>
    </div>
  );
};
