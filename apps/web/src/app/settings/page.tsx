"use client";

import React, { useState } from "react";
import { Shield, Sliders, Database, Server, Laptop, RefreshCw, CheckCircle2, Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
import { useDataProvider } from "@/lib/providers";

export default function SettingsPage() {
  const { mode, effectiveMode, isApiAvailable, statusMessage, setMode, recheckConnectivity } =
    useDataProvider();
  const [checking, setChecking] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleRecheck = async () => {
    setChecking(true);
    await recheckConnectivity();
    setChecking(false);
  };

  const handleSave = () => {
    setSavedMessage("Configuration preferences saved successfully.");
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Framework Configuration & Policies"
        subtitle="Cryptographic baselines, deterministic scoring weights, simulation overrides, and runtime data provider selection."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Settings" },
        ]}
        actions={
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-mono font-black bg-[#FFE600] hover:bg-[#FCD34D] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        }
      />

      {savedMessage && (
        <div className="p-3 bg-[#4ADE80] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-mono font-black text-black animate-in fade-in">
          {savedMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Runtime Data Provider Mode Switcher */}
        <div className="p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <Sliders className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black text-black uppercase tracking-tight">
                  Runtime Data Provider Mode
                </h2>
                <p className="text-xs text-zinc-700 font-medium">
                  Switch between deterministic preloaded demo data and live FastAPI backend connectivity.
                </p>
              </div>
            </div>
            <SimulationModeBadge />
          </div>

          {/* Mode Selector Radio Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Demo Mode */}
            <div
              onClick={() => setMode("demo")}
              className={`p-4 border-2 border-black cursor-pointer transition-all ${
                mode === "demo"
                  ? "bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-[#FAF8F5] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-black" />
                  <span className="text-xs font-black text-black uppercase">Demo Mode</span>
                </div>
                {mode === "demo" && <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />}
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-black bg-white text-black font-black uppercase">
                Recommended
              </span>
              <p className="text-xs text-zinc-800 mt-2 leading-relaxed font-medium">
                Instant deterministic canonical data. 100% immune to backend cold starts, sleep cycles, and network latency.
              </p>
            </div>

            {/* Auto Mode */}
            <div
              onClick={() => setMode("auto")}
              className={`p-4 border-2 border-black cursor-pointer transition-all ${
                mode === "auto"
                  ? "bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-[#FAF8F5] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-black" />
                  <span className="text-xs font-black text-black uppercase">Auto-Detect</span>
                </div>
                {mode === "auto" && <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />}
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-black bg-white text-black font-black uppercase">
                Adaptive
              </span>
              <p className="text-xs text-zinc-800 mt-2 leading-relaxed font-medium">
                Initializes immediately with demo data for zero initial latency, and automatically upgrades to live API when backend wakes up.
              </p>
            </div>

            {/* API Mode */}
            <div
              onClick={() => setMode("api")}
              className={`p-4 border-2 border-black cursor-pointer transition-all ${
                mode === "api"
                  ? "bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-[#FAF8F5] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-black" />
                  <span className="text-xs font-black text-black uppercase">Live API</span>
                </div>
                {mode === "api" && <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />}
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-black bg-white text-black font-black uppercase">
                Direct
              </span>
              <p className="text-xs text-zinc-800 mt-2 leading-relaxed font-medium">
                Requires an active, reachable FastAPI service at {apiUrl}. Directly executes live REST queries.
              </p>
            </div>
          </div>

          {/* Status & Diagnostic Strip */}
          <div className="p-4 bg-[#FAF8F5] border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-black font-mono">Current Status:</span>
                <span
                  className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-black ${
                    effectiveMode === "api" ? "bg-[#4ADE80] text-black" : "bg-[#FFE600] text-black"
                  }`}
                >
                  {effectiveMode === "api" ? "Active: Live FastAPI" : "Active: Deterministic Demo"}
                </span>
              </div>
              <p className="text-xs text-zinc-700 font-mono">{statusMessage}</p>
            </div>

            <button
              onClick={handleRecheck}
              disabled={checking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-black bg-white hover:bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${checking ? "animate-spin" : ""}`} />
              <span>{checking ? "Checking Backend..." : "Probe Backend Health"}</span>
            </button>
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
                Guide to IPsec VPNs: mandates AES-GCM or AES-CBC with SHA-256+, minimum 2048-bit DH, and enforces anti-replay sequencing.
              </p>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="font-black text-black">RFC 8221 Cryptographic Standards</span>
              <p className="text-zinc-700 mt-0.5 font-medium">
                Cryptographic Algorithm Implementation Requirements for ESP and AH. Classifies 3DES and MD5 as MUST NOT.
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
              <span className="text-zinc-700 block text-[10px] uppercase font-bold">FastAPI Endpoint</span>
              <span className="text-black font-black mt-1 block truncate">{apiUrl}</span>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-700 block text-[10px] uppercase font-bold">Scoring Engine</span>
              <span className="text-black font-black mt-1 block">Deterministic v1.2.0</span>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-zinc-700 block text-[10px] uppercase font-bold">Backend Connectivity</span>
              <span
                className={`font-black mt-1 block ${
                  isApiAvailable ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {isApiAvailable ? "Online (200 OK)" : "Offline / Unreachable"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
