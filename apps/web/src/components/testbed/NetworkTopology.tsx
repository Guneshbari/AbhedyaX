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
    <div className="p-5 sm:p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black">
        <div className="flex items-center gap-2 text-sm sm:text-base font-black text-black">
          <Network className="w-5 h-5 stroke-[2.5]" />
          <span>Virtual Network Namespace (netns) Topology</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs font-bold bg-[#4ADE80] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000] text-black">
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          <span>strongSwan 5.9 Link Active</span>
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center py-2 relative">
        {/* Node 1: Initiator Client */}
        <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
              ns_initiator
            </span>
            <Laptop className="w-4 h-4 stroke-[2.5] text-black" />
          </div>
          <div>
            <h4 className="text-xs font-black text-black">
              VPN Client / Initiator
            </h4>
            <div className="text-[11px] font-mono text-zinc-700 mt-1 space-y-0.5 font-bold">
              <div>IP: {ipVersion === "IPv6" ? "2001:db8:1::2/64" : "10.0.1.2/24"}</div>
              <div>swanctl: charon-client</div>
            </div>
          </div>
        </div>

        {/* Node 2: Impairment Router & Network */}
        <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 bg-[#C084FC] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
              ns_router
            </span>
            <Activity className="w-4 h-4 stroke-[2.5] text-black" />
          </div>
          <div>
            <h4 className="text-xs font-black text-black">
              Impairment Router
            </h4>
            <div className="text-[11px] font-mono text-zinc-700 mt-1 space-y-0.5 font-bold">
              <div>tc netem (20ms latency)</div>
              <div>tcpdump packet tap</div>
            </div>
          </div>
        </div>

        {/* Node 3: VPN Gateway / Responder */}
        <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 bg-[#4ADE80] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
              ns_responder
            </span>
            <Shield className="w-4 h-4 stroke-[2.5] text-black" />
          </div>
          <div>
            <h4 className="text-xs font-black text-black">
              Security Gateway
            </h4>
            <div className="text-[11px] font-mono text-zinc-700 mt-1 space-y-0.5 font-bold">
              <div>IP: {ipVersion === "IPv6" ? "2001:db8:2::2/64" : "10.0.2.2/24"}</div>
              <div>charon-systemd 5.9.14</div>
            </div>
          </div>
        </div>

        {/* Node 4: Protected Corporate Subnet */}
        <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-black px-2 py-0.5 bg-white text-black border border-black shadow-[1px_1px_0px_0px_#000]">
              Target Subnet
            </span>
            <Server className="w-4 h-4 stroke-[2.5] text-black" />
          </div>
          <div>
            <h4 className="text-xs font-black text-black">
              Protected Network
            </h4>
            <div className="text-[11px] font-mono text-zinc-700 mt-1 space-y-0.5 font-bold">
              <div>192.168.100.0/24</div>
              <div>Isolated Internal Services</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active IPsec Negotiation Tunnel Pill */}
      <div className="p-3 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-black text-black">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 stroke-[3] animate-pulse" />
          <span>Negotiated Tunnel:</span>
          <span className="bg-white px-2 py-0.5 border border-black">
            {ikeVersion} • {encryption} • {dhGroup}
          </span>
        </div>
        <span className="bg-black text-[#4ADE80] px-2 py-0.5 border border-black">
          ESP Protocol 50 Active
        </span>
      </div>
    </div>
  );
};
