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
    <div className="space-y-4">
      {/* Judge Mode Curated 1-Click Comparison Bar */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0F1218] to-indigo-950/20 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#252B35]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#F4F7FA] uppercase font-mono tracking-wider flex items-center gap-2 flex-wrap">
                <span>Judge Walkthrough — Interactive Prototype Mode</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                  Phase 6 USP
                </span>
              </div>
              <p className="text-[11px] text-[#9AA4B2] mt-0.5">
                Execute guided comparisons between canonical baseline and scenario variations in 1-click.
              </p>
            </div>
          </div>
          <Link
            href="/compare"
            className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-mono shrink-0"
          >
            <span>Full Drift Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Quick Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
          <Link
            href="/compare?baseline=AX-2026-00428&current=AX-2026-00426"
            className="p-3 rounded-lg border border-[#252B35] bg-[#141820] hover:border-indigo-500/50 hover:bg-[#1C222C] transition-all text-left flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#F4F7FA] group-hover:text-indigo-300 transition-colors">
                Secure → Moderate
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">100 → 80</span>
            </div>
            <span className="text-[11px] text-[#9AA4B2] mt-1 line-clamp-1">
              Disabling PFS causes -20 deduction
            </span>
          </Link>

          <Link
            href="/compare?baseline=AX-2026-00428&current=AX-2026-00427"
            className="p-3 rounded-lg border border-[#252B35] bg-[#141820] hover:border-indigo-500/50 hover:bg-[#1C222C] transition-all text-left flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#F4F7FA] group-hover:text-indigo-300 transition-colors">
                Secure → Legacy Weak
              </span>
              <span className="text-[10px] font-mono text-red-400 font-bold">100 → 25</span>
            </div>
            <span className="text-[11px] text-[#9AA4B2] mt-1 line-clamp-1">
              IKEv1, DH2, SHA-1, No Replay (-75)
            </span>
          </Link>

          <Link
            href="/compare?baseline=AX-2026-00428&current=AX-2026-00424"
            className="p-3 rounded-lg border border-[#252B35] bg-[#141820] hover:border-indigo-500/50 hover:bg-[#1C222C] transition-all text-left flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#F4F7FA] group-hover:text-indigo-300 transition-colors">
                Secure → Traffic Anomaly
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">100 → 95</span>
            </div>
            <span className="text-[11px] text-[#9AA4B2] mt-1 line-clamp-1">
              Flow anomaly isolated (-5 deduction)
            </span>
          </Link>

          <Link
            href="/compare?baseline=AX-2026-00428&current=AX-2026-00425"
            className="p-3 rounded-lg border border-[#252B35] bg-[#141820] hover:border-indigo-500/50 hover:bg-[#1C222C] transition-all text-left flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#F4F7FA] group-hover:text-indigo-300 transition-colors">
                IPv4 → Native IPv6
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100 → 100</span>
            </div>
            <span className="text-[11px] text-[#9AA4B2] mt-1 line-clamp-1">
              Protocol upgrade with zero penalty
            </span>
          </Link>
        </div>
      </div>

      {/* 4 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Security Twin */}
        <Link
          href="/security-twin"
          className="p-4 sm:p-5 rounded-xl border border-[#252B35] bg-[#0F1218] hover:border-indigo-500/40 hover:bg-[#141820] transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Aligned (Baseline)
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#F4F7FA] group-hover:text-indigo-300 transition-colors">
              Security Twin
            </h4>
            <p className="text-xs text-[#9AA4B2] mt-1.5 line-clamp-2 leading-relaxed">
              Correlates intended policy baseline against observed wire parameters.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#252B35] flex items-center justify-between text-xs text-[#9AA4B2] font-mono">
            <span>AX-2026-00428</span>
            <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">Explore →</span>
          </div>
        </Link>

        {/* 2. Configuration Drift */}
        <Link
          href="/compare"
          className="p-4 sm:p-5 rounded-xl border border-[#252B35] bg-[#0F1218] hover:border-indigo-500/40 hover:bg-[#141820] transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                <GitCompare className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                -75 max delta
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#F4F7FA] group-hover:text-indigo-300 transition-colors">
              Configuration Drift
            </h4>
            <p className="text-xs text-[#9AA4B2] mt-1.5 line-clamp-2 leading-relaxed">
              Compare any two sessions to expose weakened transforms and replay gaps.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#252B35] flex items-center justify-between text-xs text-[#9AA4B2] font-mono">
            <span>4 Presets</span>
            <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">Compare →</span>
          </div>
        </Link>

        {/* 3. Security Posture */}
        <Link
          href="/posture"
          className="p-4 sm:p-5 rounded-xl border border-[#252B35] bg-[#0F1218] hover:border-indigo-500/40 hover:bg-[#141820] transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                83/100 avg
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#F4F7FA] group-hover:text-indigo-300 transition-colors">
              Posture Timeline
            </h4>
            <p className="text-xs text-[#9AA4B2] mt-1.5 line-clamp-2 leading-relaxed">
              Longitudinal tracking of security score transitions across historical sessions.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#252B35] flex items-center justify-between text-xs text-[#9AA4B2] font-mono">
            <span>6 Sessions</span>
            <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">Timeline →</span>
          </div>
        </Link>

        {/* 4. Metadata Exposure */}
        <Link
          href="/metadata-exposure"
          className="p-4 sm:p-5 rounded-xl border border-[#252B35] bg-[#0F1218] hover:border-indigo-500/40 hover:bg-[#141820] transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                <Eye className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                Zero Decryption
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#F4F7FA] group-hover:text-indigo-300 transition-colors">
              Metadata Exposure
            </h4>
            <p className="text-xs text-[#9AA4B2] mt-1.5 line-clamp-2 leading-relaxed">
              Analyze packet timing, burst cadence, and sizing observability indicators.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#252B35] flex items-center justify-between text-xs text-[#9AA4B2] font-mono">
            <span>5 Dimensions</span>
            <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">Inspect →</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
