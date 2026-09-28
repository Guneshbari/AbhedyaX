import React from "react";
import { Shield, Sliders, Database } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Framework Configuration & Policies"
        subtitle="Cryptographic baselines, deterministic scoring weights, simulation overrides, and backend API integration endpoints."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Settings" },
        ]}
        actions={
          <PrimaryButton variant="primary" size="sm">
            Save Preferences
          </PrimaryButton>
        }
      />

      <div className="space-y-6">
        {/* Simulation Mode Toggle Card */}
        <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#F4F7FA]">
                  Simulation Mode Engine
                </h2>
                <p className="text-xs text-[#9AA4B2]">
                  When active, analyses use deterministic pre-compiled scenario datasets for UX testing without packet captures.
                </p>
              </div>
            </div>
            <SimulationModeBadge />
          </div>
        </div>

        {/* Security Policy Standards */}
        <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-semibold text-[#F4F7FA]">
              Deterministic Policy Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="font-semibold text-[#F4F7FA]">NIST SP 800-77 Rev. 1</span>
              <p className="text-[#687384] mt-0.5">
                Guide to IPsec VPNs: mandates AES-GCM or AES-CBC with SHA-256+, minimum 2048-bit DH.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="font-semibold text-[#F4F7FA]">RFC 8221 Cryptographic Standards</span>
              <p className="text-[#687384] mt-0.5">
                Cryptographic Algorithm Implementation Requirements for ESP and AH.
              </p>
            </div>
          </div>
        </div>

        {/* Environment & Endpoints */}
        <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-semibold text-[#F4F7FA]">
              System Endpoints & Environment
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[#687384] block text-[10px] uppercase">API Endpoint</span>
              <span className="text-[#F4F7FA] mt-1 block">http://localhost:8000</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[#687384] block text-[10px] uppercase">PostgreSQL Status</span>
              <span className="text-emerald-400 mt-1 block">Connected (5432)</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[#687384] block text-[10px] uppercase">Redis Cache</span>
              <span className="text-emerald-400 mt-1 block">Ready (6379)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
