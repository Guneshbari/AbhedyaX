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
        <div className="p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FBBF24] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-black">
                  Simulation Mode Engine
                </h2>
                <p className="text-xs text-zinc-700 font-medium">
                  When active, analyses use deterministic pre-compiled scenario datasets for UX testing without packet captures.
                </p>
              </div>
            </div>
            <SimulationModeBadge />
          </div>
        </div>

        {/* Security Policy Standards */}
        <div className="p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-black" />
            <h2 className="text-sm font-black text-black">
              Deterministic Policy Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="font-black text-black">NIST SP 800-77 Rev. 1</span>
              <p className="text-zinc-700 mt-0.5 font-medium">
                Guide to IPsec VPNs: mandates AES-GCM or AES-CBC with SHA-256+, minimum 2048-bit DH.
              </p>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="font-black text-black">RFC 8221 Cryptographic Standards</span>
              <p className="text-zinc-700 mt-0.5 font-medium">
                Cryptographic Algorithm Implementation Requirements for ESP and AH.
              </p>
            </div>
          </div>
        </div>

        {/* Environment & Endpoints */}
        <div className="p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-black" />
            <h2 className="text-sm font-black text-black">
              System Endpoints & Environment
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-700 block text-[10px] uppercase font-bold">API Endpoint</span>
              <span className="text-black font-black mt-1 block">http://localhost:8000</span>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-700 block text-[10px] uppercase font-bold">PostgreSQL Status</span>
              <span className="text-emerald-700 font-black mt-1 block">Connected (5432)</span>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-700 block text-[10px] uppercase font-bold">Redis Cache</span>
              <span className="text-emerald-700 font-black mt-1 block">Ready (6379)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
