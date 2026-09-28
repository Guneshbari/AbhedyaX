import React from "react";
import { Network, Server, Play } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function TestbedPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="strongSwan IPsec Testbed"
        subtitle="Virtual network namespace orchestration for reproducible multi-endpoint VPN scenarios, traffic injection, and live capture."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Testbed" },
        ]}
        actions={
          <PrimaryButton variant="primary" size="sm" icon={Play}>
            Deploy Test Scenario
          </PrimaryButton>
        }
      />

      {/* Network Namespaces Topology Preview */}
      <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F4F7FA]">
                Virtual Network Namespace Status
              </h2>
              <p className="text-xs text-[#9AA4B2]">
                Isolated Linux netns (`ns_initiator`, `ns_router`, `ns_responder`)
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            strongSwan 5.9 Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            {
              role: "Initiator Node",
              netns: "ns_initiator",
              ip: "10.0.1.2/24",
              ike: "swanctl --load-all",
              status: "Online",
            },
            {
              role: "Impairment Router",
              netns: "ns_router",
              ip: "10.0.1.1 / 10.0.2.1",
              ike: "tc qdisc (netem)",
              status: "Online",
            },
            {
              role: "Responder Gateway",
              netns: "ns_responder",
              ip: "10.0.2.2/24",
              ike: "charon-systemd",
              status: "Online",
            },
          ].map((node) => (
            <div
              key={node.role}
              className="p-4 rounded-lg bg-[#141820] border border-[#252B35] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F4F7FA]">
                  {node.role}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {node.status}
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#9AA4B2] space-y-1">
                <div>
                  <span className="text-[#687384]">Netns:</span> {node.netns}
                </div>
                <div>
                  <span className="text-[#687384]">IP:</span> {node.ip}
                </div>
                <div>
                  <span className="text-[#687384]">Service:</span> {node.ike}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EmptyState
        title="Reproducible Testbed Engine (Phase 5)"
        description="The automated strongSwan testbed runner enables one-click generation of PCAPs with specific DH groups, ciphers, and replay attacks."
        icon={Server}
        actionText="View Scenario Configs"
        actionHref="/analyze?mode=simulation"
      />
    </div>
  );
}
