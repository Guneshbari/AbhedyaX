"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { getPostureTimeline } from "@/lib/api/securityTwin";
import { PostureTimelineResult } from "@/types/securityTwin";
import { RiskLevel } from "@/types/dashboard";
import {
  TrendingUp,
  ArrowRight,
  Info,
} from "lucide-react";

export default function PosturePage() {
  const [posture, setPosture] = useState<PostureTimelineResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getPostureTimeline()
      .then((data) => {
        if (isMounted) {
          setPosture(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load posture timeline:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Security Posture Timeline"
          subtitle="Longitudinal evaluation of IPsec VPN security posture, risk transitions, and cryptographic evolution across sessions."
        />

        {/* USP Banner */}
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>AbhedyaX USP-05: Security Posture Progression</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Longitudinal View
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Demonstrates continuous security assessment capabilities without presenting one-shot siloed analyses.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Info className="w-4 h-4 text-neutral-500" />
            <span>Prototype Demo Mode</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Aggregating longitudinal posture metrics...
          </div>
        ) : !posture ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Posture data unavailable.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
                <span className="text-[11px] font-mono uppercase text-neutral-400">Total Inspected Sessions</span>
                <div className="text-3xl font-bold font-mono text-white mt-1">
                  {posture.total_sessions}
                </div>
                <div className="text-xs text-neutral-500 mt-1">Spans 6 canonical archetypes</div>
              </div>

              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
                <span className="text-[11px] font-mono uppercase text-neutral-400">Mean Posture Score</span>
                <div className="text-3xl font-bold font-mono text-indigo-400 mt-1">
                  {posture.average_score}/100
                </div>
                <div className="text-xs text-neutral-500 mt-1">Deterministic arithmetic mean</div>
              </div>

              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
                <span className="text-[11px] font-mono uppercase text-neutral-400">Highest Verified Posture</span>
                <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                  {posture.highest_score}/100
                </div>
                <div className="text-xs text-emerald-500/80 mt-1">Grade A (Compliant AEAD)</div>
              </div>

              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
                <span className="text-[11px] font-mono uppercase text-neutral-400">Lowest Detected Posture</span>
                <div className="text-3xl font-bold font-mono text-red-400 mt-1">
                  {posture.lowest_score}/100
                </div>
                <div className="text-xs text-red-500/80 mt-1">Grade F (Legacy Vulnerable)</div>
              </div>
            </div>

            {/* Visual Timeline of Sessions */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h3 className="text-sm font-semibold text-white">Chronological Security Session Progression</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{posture.posture_summary}</p>
                </div>
                <span className="text-xs font-mono text-neutral-400">{posture.timeline.length} Assessment Nodes</span>
              </div>

              <div className="relative mt-6 pt-2 pb-4">
                {/* Connecting Track Line */}
                <div className="absolute top-9 left-6 right-6 h-0.5 bg-neutral-800 hidden md:block" />

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
                  {posture.timeline.map((entry, idx) => {
                    const isHigh = entry.score >= 90;
                    const isMed = entry.score >= 75 && entry.score < 90;
                    return (
                      <div key={entry.analysis_id} className="flex flex-col items-center text-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold z-10 border-2 ${
                            isHigh
                              ? "bg-neutral-950 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/20"
                              : isMed
                              ? "bg-neutral-950 border-amber-500 text-amber-400 shadow-sm shadow-amber-500/20"
                              : "bg-neutral-950 border-red-500 text-red-400 shadow-sm shadow-red-500/20"
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div className="mt-3 p-3 rounded-xl border border-neutral-800/80 bg-neutral-950 w-full text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-neutral-400">
                              {entry.analysis_id}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold ${
                                isHigh ? "text-emerald-400" : isMed ? "text-amber-400" : "text-red-400"
                              }`}
                            >
                              {entry.score}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-white truncate mt-1">
                            {entry.scenario}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            {entry.ike_version} • {entry.encryption.split("-")[0]}
                          </div>
                          <div className="mt-2 pt-2 border-t border-neutral-900 flex justify-between items-center text-[10px]">
                            <RiskBadge level={entry.risk as RiskLevel} />
                            <Link
                              href={`/security-twin/${entry.analysis_id}`}
                              className="text-indigo-400 hover:text-indigo-300 font-mono"
                            >
                              Twin →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Transitions Details */}
            {posture.transitions.length > 0 && (
              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60">
                <h3 className="text-sm font-semibold text-white mb-4">Inter-Session Posture Transitions</h3>
                <div className="space-y-3">
                  {posture.transitions.map((tr, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-950/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-400 font-medium">
                          {tr.from_id} → {tr.to_id}
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            tr.score_delta > 0
                              ? "bg-emerald-500/10 text-emerald-400"
                              : tr.score_delta < 0
                              ? "bg-red-500/10 text-red-400"
                              : "bg-neutral-800 text-neutral-300"
                          }`}
                        >
                          {tr.score_delta > 0 ? `+${tr.score_delta}` : tr.score_delta} pts ({tr.risk_transition})
                        </span>
                      </div>

                      <div className="text-neutral-400 text-[11px] font-sans">
                        {tr.key_changes.join(" • ")}
                      </div>

                      <Link
                        href={`/compare?baseline=${tr.from_id}&current=${tr.to_id}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
                      >
                        <span>Compare</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 rounded-xl border border-neutral-800/60 bg-neutral-950 text-xs text-neutral-500 font-mono flex items-center gap-2">
              <Info className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>{posture.disclaimer}</span>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
