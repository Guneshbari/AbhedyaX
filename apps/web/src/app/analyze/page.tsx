import React from "react";
import { UploadCloud, PlayCircle, Cpu } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";

export default function AnalyzePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyze Capture & Scenarios"
        subtitle="Submit PCAP/PCAPNG network captures or execute standardized RFC/NIST simulation scenarios for automated IPsec cryptographic auditing."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analyze" },
        ]}
        badge={<SimulationModeBadge />}
        actions={
          <PrimaryButton variant="secondary" size="sm" href="/" icon={PlayCircle}>
            Return to Dashboard
          </PrimaryButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PCAP Upload Preview */}
        <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-[#F4F7FA]">
                PCAP / PCAPNG Ingestion
              </h2>
            </div>
            <p className="text-xs text-[#9AA4B2] leading-relaxed mb-4">
              Upload captured packets containing IKE (UDP 500/4500) and ESP (Proto 50) exchanges for deep decoding and security compliance checks.
            </p>
          </div>
          <div className="p-8 border-2 border-dashed border-[#252B35] rounded-xl flex flex-col items-center justify-center text-center bg-[#141820]/30">
            <UploadCloud className="w-8 h-8 text-[#687384] mb-2" />
            <p className="text-xs font-medium text-[#F4F7FA]">
              Drag and drop capture file here
            </p>
            <p className="text-[11px] text-[#687384] mt-1">
              Supports .pcap, .pcapng, .cap up to 250MB
            </p>
            <div className="mt-4">
              <PrimaryButton variant="secondary" size="sm">
                Browse Files
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* Simulation Scenarios Preview */}
        <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-[#F4F7FA]">
                Standardized Simulation Scenarios
              </h2>
            </div>
            <p className="text-xs text-[#9AA4B2] leading-relaxed mb-4">
              Select one of the 5 pre-configured RFC benchmark profiles for immediate evaluation without requiring external packet files.
            </p>
          </div>

          <div className="space-y-2">
            {[
              {
                id: "secure-enterprise",
                name: "Secure Enterprise VPN",
                specs: "IKEv2, AES-256-GCM, DH-19, PFS Enabled",
                badge: "High Security",
                color: "text-emerald-400 border-emerald-500/30",
              },
              {
                id: "moderate-security",
                name: "Moderate Security Gateway",
                specs: "IKEv2, AES-256-CBC, DH-14, PFS Disabled",
                badge: "Moderate",
                color: "text-amber-400 border-amber-500/30",
              },
              {
                id: "weak-configuration",
                name: "Weak Legacy Deployment",
                specs: "IKEv1 Aggressive, 3DES, DH-2, Extended Lifetime",
                badge: "Critical Flaws",
                color: "text-red-400 border-red-500/30",
              },
            ].map((scen) => (
              <div
                key={scen.id}
                className="p-3 rounded-lg bg-[#141820] border border-[#252B35] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-[#F4F7FA]">
                    {scen.name}
                  </div>
                  <div className="text-[11px] text-[#687384] font-mono mt-0.5">
                    {scen.specs}
                  </div>
                </div>
                <PrimaryButton variant="secondary" size="sm">
                  Run
                </PrimaryButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
