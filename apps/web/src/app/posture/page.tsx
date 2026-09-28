"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    <div className="space-y-6">
      <PageHeader
        title="Security Posture Timeline"
        subtitle="Longitudinal evaluation of IPsec VPN security posture, risk transitions, and cryptographic evolution across sessions."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Posture Timeline" },
        ]}
      />

      {/* USP Banner */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0F1218] to-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-[#F4F7FA] flex items-center gap-2 flex-wrap">
              <span>AbhedyaX USP-05: Security Posture Progression</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                Longitudinal View
              </span>
            </div>
            <p className="text-xs text-[#9AA4B2] mt-0.5 leading-relaxed">
              Demonstrates continuous security assessment capabilities without presenting one-shot siloed analyses.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#9AA4B2] shrink-0">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Prototype Demo Mode</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3" />
          Aggregating longitudinal posture metrics...
        </div>
      ) : !posture ? (
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          Posture data unavailable.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218]">
              <span className="text-[11px] font-mono uppercase text-[#9AA4B2] font-semibold">Total Inspected Sessions</span>
              <div className="text-3xl font-bold font-mono text-[#F4F7FA] mt-1.5">
                {posture.total_sessions}
              </div>
              <div className="text-xs text-[#687384] mt-1">Spans 6 canonical archetypes</div>
            </div>

            <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218]">
              <span className="text-[11px] font-mono uppercase text-[#9AA4B2] font-semibold">Mean Posture Score</span>
              <div className="text-3xl font-bold font-mono text-indigo-400 mt-1.5">
                {posture.average_score}/100
              </div>
              <div className="text-xs text-[#687384] mt-1">Deterministic arithmetic mean</div>
            </div>

            <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218]">
              <span className="text-[11px] font-mono uppercase text-[#9AA4B2] font-semibold">Highest Verified Posture</span>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1.5">
                {posture.highest_score}/100
              </div>
              <div className="text-xs text-emerald-400/80 mt-1">Grade A (Compliant AEAD)</div>
            </div>

            <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218]">
              <span className="text-[11px] font-mono uppercase text-[#9AA4B2] font-semibold">Lowest Detected Posture</span>
              <div className="text-3xl font-bold font-mono text-red-400 mt-1.5">
                {posture.lowest_score}/100
              </div>
              <div className="text-xs text-red-400/80 mt-1">Grade F (Legacy Vulnerable)</div>
            </div>
          </div>

          {/* Visual Timeline of Sessions */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#252B35] gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F7FA]">Chronological Security Session Progression</h3>
                <p className="text-xs text-[#9AA4B2] mt-0.5">{posture.posture_summary}</p>
              </div>
              <span className="text-xs font-mono text-[#9AA4B2]">{posture.timeline.length} Assessment Nodes</span>
            </div>

            <div className="relative mt-6 pt-2 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 relative">
                {posture.timeline.map((entry, idx) => {
                  const isHigh = entry.score >= 90;
                  const isMed = entry.score >= 75 && entry.score < 90;
                  return (
                    <div key={entry.analysis_id} className="flex flex-col items-center text-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold z-10 border-2 ${
                          isHigh
                            ? "bg-[#090B10] border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/20"
                            : isMed
                            ? "bg-[#090B10] border-amber-500 text-amber-400 shadow-sm shadow-amber-500/20"
                            : "bg-[#090B10] border-red-500 text-red-400 shadow-sm shadow-red-500/20"
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="mt-3 p-3.5 rounded-xl border border-[#252B35] bg-[#141820] w-full text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#9AA4B2]">
                            {entry.analysis_id}
                          </span>
                          <span
                            className={`text-xs font-mono font-bold ${
                              isHigh ? "text-emerald-400" : isMed ? "text-amber-400" : "text-red-400"
                            }`}
                          >
                            {entry.score}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center gap-1.5">
                          <RiskBadge level={entry.risk as RiskLevel} />
                        </div>

                        <div className="mt-2 text-[11px] font-medium text-[#F4F7FA] truncate" title={entry.scenario}>
                          {entry.scenario}
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#252B35]/60 flex items-center justify-between">
                          <Link
                            href={`/analyses/${entry.analysis_id}`}
                            className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                          <Link
                            href={`/security-twin/${entry.analysis_id}`}
                            className="text-[10px] font-mono text-[#9AA4B2] hover:text-[#F4F7FA]"
                          >
                            Twin
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
            <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218]">
              <h3 className="text-sm font-semibold text-[#F4F7FA] mb-4">Inter-Session Posture Transitions</h3>
              <div className="space-y-3">
                {posture.transitions.map((tr, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#252B35] bg-[#141820] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[#F4F7FA] font-medium">
                        {tr.from_id} → {tr.to_id}
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                          tr.score_delta > 0
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : tr.score_delta < 0
                            ? "bg-red-500/10 text-red-400 border-red-500/25"
                            : "bg-[#090B10] text-[#9AA4B2] border-[#252B35]"
                        }`}
                      >
                        {tr.score_delta > 0 ? `+${tr.score_delta}` : tr.score_delta} pts ({tr.risk_transition})
                      </span>
                    </div>

                    <div className="text-[#9AA4B2] text-[11px] font-sans">
                      {tr.key_changes.join(" • ")}
                    </div>

                    <Link
                      href={`/compare?baseline=${tr.from_id}&current=${tr.to_id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 font-medium"
                    >
                      <span>Compare Drift</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 rounded-xl border border-[#252B35] bg-[#090B10] text-xs text-[#9AA4B2] font-mono flex items-center gap-2.5">
            <Info className="w-4 h-4 text-[#687384] shrink-0" />
            <span className="leading-relaxed">{posture.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
