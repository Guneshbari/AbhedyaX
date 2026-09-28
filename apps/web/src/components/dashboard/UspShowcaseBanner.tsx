"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  GitCompare,
  TrendingUp,
  Eye,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const UspShowcaseBanner: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* Judge Mode Curated 1-Click Comparison Bar - Neo-Brutalist Hero */}
      <div className="p-4 sm:p-6 bg-[#EDE9FE] border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-black uppercase font-mono tracking-wider flex items-center gap-2 flex-wrap">
                <span>Judge Walkthrough — Interactive Prototype Mode</span>
                <span className="text-[10px] px-2 py-0.5 bg-black text-[#FFE600] border border-black font-mono font-bold">
                  Phase 6 USP
                </span>
              </div>
              <p className="text-xs text-zinc-800 font-medium mt-0.5">
                Execute guided comparisons between canonical baseline and scenario variations in 1-click.
              </p>
            </div>
          </div>
          <Link
            href="/compare"
            className="text-xs font-black text-black bg-white hover:bg-[#FFE600] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 font-mono shrink-0"
          >
            <span>Full Drift Studio</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* 4 Quick Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <Link
            href="/compare?baseline=AX-2026-00428&current=AX-2026-00426"
            className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-left flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black group-hover:underline">
                Secure → Moderate
              </span>
              <span className="text-[11px] font-mono font-black bg-[#FBBF24] text-black px-1.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                100 → 80
              </span>
            </div>
            <span className="text-[11px] text-zinc-700 mt-2 font-medium line-clamp-1">
              Disabling PFS causes -20 deduction
            </span>
          </Link>

          <Link
            href="/compare?baseline=AX-2026-00428&current=AX-2026-00427"
            className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-left flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black group-hover:underline">
                Secure → Legacy Weak
              </span>
              <span className="text-[11px] font-mono font-black bg-[#FF4B4B] text-black px-1.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                100 → 25
              </span>
            </div>
            <span className="text-[11px] text-zinc-700 mt-2 font-medium line-clamp-1">
              IKEv1, DH2, SHA-1, No Replay (-75)
            </span>
          </Link>

          <Link
            href="/compare?baseline=AX-2026-00428&current=AX-2026-00424"
            className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-left flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black group-hover:underline">
                Secure → Traffic Anomaly
              </span>
              <span className="text-[11px] font-mono font-black bg-[#38BDF8] text-black px-1.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                100 → 95
              </span>
            </div>
            <span className="text-[11px] text-zinc-700 mt-2 font-medium line-clamp-1">
              Flow anomaly isolated (-5 deduction)
            </span>
          </Link>

          <Link
            href="/compare?baseline=AX-2026-00428&current=AX-2026-00425"
            className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-left flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black group-hover:underline">
                IPv4 → Native IPv6
              </span>
              <span className="text-[11px] font-mono font-black bg-[#4ADE80] text-black px-1.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                100 → 100
              </span>
            </div>
            <span className="text-[11px] text-zinc-700 mt-2 font-medium line-clamp-1">
              Protocol upgrade with zero penalty
            </span>
          </Link>
        </div>
      </div>

      {/* 4 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Security Twin */}
        <Link
          href="/security-twin"
          className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-[#4ADE80] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                Aligned (Baseline)
              </span>
            </div>
            <h4 className="text-base font-black text-black group-hover:underline">
              Security Twin
            </h4>
            <p className="text-xs text-zinc-700 mt-1.5 line-clamp-2 leading-relaxed font-medium">
              Correlates intended policy baseline against observed wire parameters.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between text-xs text-black font-mono font-bold">
            <span>AX-2026-00428</span>
            <span className="text-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Explore →
            </span>
          </div>
        </Link>

        {/* 2. Configuration Drift */}
        <Link
          href="/compare"
          className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
                <GitCompare className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-[#FF4B4B] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                -75 max delta
              </span>
            </div>
            <h4 className="text-base font-black text-black group-hover:underline">
              Configuration Drift
            </h4>
            <p className="text-xs text-zinc-700 mt-1.5 line-clamp-2 leading-relaxed font-medium">
              Compare any two sessions to expose weakened transforms and replay gaps.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between text-xs text-black font-mono font-bold">
            <span>4 Presets</span>
            <span className="text-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Compare →
            </span>
          </div>
        </Link>

        {/* 3. Security Posture */}
        <Link
          href="/posture"
          className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-[#C084FC] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                83/100 avg
              </span>
            </div>
            <h4 className="text-base font-black text-black group-hover:underline">
              Posture Timeline
            </h4>
            <p className="text-xs text-zinc-700 mt-1.5 line-clamp-2 leading-relaxed font-medium">
              Longitudinal tracking of security score transitions across historical sessions.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between text-xs text-black font-mono font-bold">
            <span>6 Sessions</span>
            <span className="text-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Timeline →
            </span>
          </div>
        </Link>

        {/* 4. Metadata Exposure */}
        <Link
          href="/metadata-exposure"
          className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
                <Eye className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-[#38BDF8] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                Zero Decryption
              </span>
            </div>
            <h4 className="text-base font-black text-black group-hover:underline">
              Metadata Exposure
            </h4>
            <p className="text-xs text-zinc-700 mt-1.5 line-clamp-2 leading-relaxed font-medium">
              Analyze packet timing, burst cadence, and sizing observability indicators.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between text-xs text-black font-mono font-bold">
            <span>5 Dimensions</span>
            <span className="text-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Inspect →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};
