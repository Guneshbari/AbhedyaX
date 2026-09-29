"use client";

import React from "react";
import {
  Shield, Cpu, GitCompare, Activity, FileText,
  BarChart3, Brain, Package, ChevronRight, Play
} from "lucide-react";
import { useJudgeDemoStore } from "@/store/judgeDemo";

const DEMO_STORY = [
  { icon: Package, label: "INPUT & SCENARIO", desc: "Load canonical VPN scenario" },
  { icon: Activity, label: "PACKET ANALYSIS", desc: "TShark protocol dissection" },
  { icon: Cpu, label: "FEATURE EXTRACTION", desc: "Normalize encrypted-flow features" },
  { icon: Shield, label: "VPN ANALYSIS", desc: "Observe IPsec security posture" },
  { icon: Brain, label: "AI INTELLIGENCE", desc: "Classify traffic without decryption" },
  { icon: Shield, label: "SECURITY ENGINE", desc: "Deterministic risk assessment" },
  { icon: GitCompare, label: "SECURITY TWIN", desc: "Detect configuration drift" },
  { icon: BarChart3, label: "INSIGHTS & REPORT", desc: "Metadata, posture, export" },
];

export function JudgeDemoEntryScreen() {
  const { runStage, selectScenario, scenarioId } = useJudgeDemoStore();

  function handleStart() {
    // Start the demo: immediately trigger stage 1
    runStage("input");
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-3xl mx-auto text-center gap-6">
      {/* Title block */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#22C55E] uppercase">
            Live Hackathon Demonstration
          </span>
        </div>
        <h1 className="font-mono font-black text-3xl sm:text-4xl tracking-[0.08em] text-[#F4F7FA] uppercase">
          ABHEDYAX
        </h1>
        <h2 className="font-mono font-bold text-sm tracking-[0.2em] text-[#FFE600] uppercase mt-1">
          JUDGE DEMO // GUIDED END-TO-END ASSESSMENT
        </h2>
        <p className="font-mono text-xs text-[#9AA4B2] mt-3 max-w-xl mx-auto leading-relaxed">
          Follow one complete VPN analysis from encrypted traffic capture to security assessment,
          drift detection, metadata analysis and auditable reporting — all without decrypting a
          single byte of payload.
        </p>
      </div>

      {/* Pipeline stages */}
      <div className="w-full">
        <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase mb-3">
          8-STAGE ANALYSIS PIPELINE
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEMO_STORY.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-start gap-1.5 p-3 border border-[#252B35] bg-[#0F1218] text-left"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black text-[#687384]">{String(i + 1).padStart(2, "0")}</span>
                <item.icon className="w-3.5 h-3.5 text-[#3B82F6]" />
              </div>
              <div className="font-mono text-[10px] font-bold text-[#F4F7FA] uppercase tracking-wide leading-tight">
                {item.label}
              </div>
              <div className="font-mono text-[9px] text-[#687384] leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario selector */}
      <div className="w-full">
        <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase mb-2">
          SELECT DEMO SCENARIO (or use default)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {[
            { id: "secure-enterprise", label: "Secure Enterprise", badge: "Score 100 · Low · A", recommended: true },
            { id: "legacy-critical", label: "Legacy Critical", badge: "Score 25 · Critical · F", recommended: false },
            { id: "moderate-security", label: "Moderate Security", badge: "Score 80 · Moderate · B", recommended: false },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => selectScenario(opt.id)}
              className={
                `text-left px-3 py-2 border font-mono text-[11px] transition-all ` +
                (scenarioId === opt.id
                  ? "border-[#FFE600] bg-[#FFE600]/10 text-[#FFE600]"
                  : "border-[#252B35] bg-[#141820] text-[#9AA4B2] hover:border-[#3B82F6]/50 hover:text-[#F4F7FA]")
              }
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold uppercase">{opt.label}</span>
                {opt.recommended && (
                  <span className="px-1 py-0.5 border border-[#FFE600]/40 text-[#FFE600] font-mono text-[8px] uppercase">
                    DEFAULT
                  </span>
                )}
              </div>
              <div className="text-[9px] mt-0.5 text-[#687384]">{opt.badge}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleStart}
          className="flex items-center gap-2 px-6 py-3 font-mono text-sm font-black tracking-wider uppercase border border-[#FFE600] bg-[#FFE600]/10 text-[#FFE600] hover:bg-[#FFE600]/20 transition-all"
        >
          <Play className="w-4 h-4" />
          START GUIDED DEMO
        </button>
        <button
          onClick={() => useJudgeDemoStore.getState().close()}
          className="flex items-center gap-2 px-4 py-3 font-mono text-xs text-[#687384] border border-[#252B35] hover:border-[#EF4444]/40 hover:text-[#EF4444] transition-all uppercase tracking-wider"
        >
          EXIT
        </button>
      </div>

      {/* Disclaimer */}
      <p className="font-mono text-[10px] text-[#687384] max-w-lg leading-relaxed">
        Demo Mode: Deterministic canonical prototype data. No backend required.
        No network connections made. No VPN payloads decrypted.
      </p>
    </div>
  );
}
