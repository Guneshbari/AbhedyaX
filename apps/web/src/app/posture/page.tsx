"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { DemoNextStepCTA } from "@/components/ui/DemoNextStepCTA";
import { getPostureTimeline } from "@/lib/api/securityTwin";
import { getDemoPostureTimeline } from "@/demo";
import { PostureTimelineResult } from "@/types/securityTwin";
import { RiskLevel } from "@/types/dashboard";
import {
  TrendingUp,
  ArrowRight,
  Info,
} from "lucide-react";

export default function PosturePage() {
  const [posture, setPosture] = useState<PostureTimelineResult | null>(
    () => getDemoPostureTimeline()
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    getPostureTimeline()
      .then((data) => {
        if (isMounted && data) {
          setPosture(data);
        }
      })
      .catch((err) => {
        console.warn("API posture timeline failed, keeping demo fixture:", err);
        if (isMounted) {
          setPosture(getDemoPostureTimeline());
        }
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
      <div className="p-4 sm:p-5 bg-[#C084FC]/20 border-2 sm:border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#C084FC] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-black flex items-center gap-2 flex-wrap">
              <span>AbhedyaX USP-05: Security Posture Progression</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 border-2 border-black bg-white text-black font-black shadow-[2px_2px_0px_0px_#000]">
                Longitudinal View
              </span>
            </div>
            <p className="text-xs text-zinc-800 mt-0.5 leading-relaxed font-bold">
              Demonstrates continuous security assessment capabilities without presenting one-shot siloed analyses.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-black font-black shrink-0 bg-[#FFE600] px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <Info className="w-4 h-4 text-black" />
          <span>Prototype Demo Mode</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          <div className="w-6 h-6 rounded-full border-2 border-black border-t-[#FFE600] animate-spin mx-auto mb-3" />
          Aggregating longitudinal posture metrics...
        </div>
      ) : !posture ? (
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          Posture data unavailable.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <span className="text-[11px] font-mono uppercase text-zinc-700 font-black">Total Inspected Sessions</span>
              <div className="text-3xl font-black font-mono text-black mt-1.5">
                {posture.total_sessions}
              </div>
              <div className="text-xs text-zinc-600 mt-1 font-bold">Spans 6 canonical archetypes</div>
            </div>

            <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <span className="text-[11px] font-mono uppercase text-zinc-700 font-black">Mean Posture Score</span>
              <div className="text-3xl font-black font-mono text-black mt-1.5">
                {posture.average_score}/100
              </div>
              <div className="text-xs text-zinc-600 mt-1 font-bold">Deterministic arithmetic mean</div>
            </div>

            <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <span className="text-[11px] font-mono uppercase text-zinc-700 font-black">Highest Verified Posture</span>
              <div className="text-3xl font-black font-mono text-emerald-700 mt-1.5">
                {posture.highest_score}/100
              </div>
              <div className="text-xs text-emerald-800 font-bold mt-1">Grade A (Compliant AEAD)</div>
            </div>

            <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <span className="text-[11px] font-mono uppercase text-zinc-700 font-black">Lowest Detected Posture</span>
              <div className="text-3xl font-black font-mono text-red-700 mt-1.5">
                {posture.lowest_score}/100
              </div>
              <div className="text-xs text-red-800 font-bold mt-1">Grade F (Legacy Vulnerable)</div>
            </div>
          </div>

          {/* Visual Timeline of Sessions */}
          <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-2">
              <div>
                <h3 className="text-sm font-black text-black">Chronological Security Session Progression</h3>
                <p className="text-xs text-zinc-700 mt-0.5 font-medium">{posture.posture_summary}</p>
              </div>
              <span className="text-xs font-mono text-black font-bold">{posture.timeline.length} Assessment Nodes</span>
            </div>

            <div className="relative mt-6 pt-2 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 relative">
                {posture.timeline.map((entry, idx) => {
                  const isHigh = entry.score >= 90;
                  const isMed = entry.score >= 75 && entry.score < 90;
                  return (
                    <div key={entry.analysis_id} className="flex flex-col items-center text-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-black z-10 border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                          isHigh
                            ? "bg-[#4ADE80] text-black"
                            : isMed
                            ? "bg-[#FBBF24] text-black"
                            : "bg-[#FF4B4B] text-black"
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="mt-3 p-3.5 border-2 border-black bg-[#FAF8F5] shadow-[2px_2px_0px_0px_#000] w-full text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-700 font-bold">
                            {entry.analysis_id}
                          </span>
                          <span
                            className={`text-xs font-mono font-black ${
                              isHigh ? "text-emerald-700" : isMed ? "text-amber-700" : "text-red-700"
                            }`}
                          >
                            {entry.score}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center gap-1.5">
                          <RiskBadge level={entry.risk as RiskLevel} />
                        </div>

                        <div className="mt-2 text-[11px] font-bold text-black truncate" title={entry.scenario}>
                          {entry.scenario}
                        </div>

                        <div className="mt-3 pt-2 border-t-2 border-black/20 flex items-center justify-between">
                          <Link
                            href={`/analyses/${entry.analysis_id}`}
                            className="text-[10px] font-mono text-black font-black hover:underline flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                          <Link
                            href={`/security-twin/${entry.analysis_id}`}
                            className="text-[10px] font-mono text-zinc-700 font-bold hover:text-black"
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
            <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
              <h3 className="text-sm font-black text-black mb-4">Inter-Session Posture Transitions</h3>
              <div className="space-y-3">
                {posture.transitions.map((tr, idx) => (
                  <div
                    key={idx}
                    className="p-4 border-2 border-black bg-[#FAF8F5] shadow-[3px_3px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-black font-black">
                        {tr.from_id} → {tr.to_id}
                      </span>
                      <span
                        className={`font-black px-2 py-0.5 border-2 border-black text-[11px] shadow-[2px_2px_0px_0px_#000] ${
                          tr.score_delta > 0
                            ? "bg-[#4ADE80] text-black"
                            : tr.score_delta < 0
                            ? "bg-[#FF4B4B] text-black"
                            : "bg-white text-black"
                        }`}
                      >
                        {tr.score_delta > 0 ? `+${tr.score_delta}` : tr.score_delta} pts ({tr.risk_transition})
                      </span>
                    </div>

                    <div className="text-zinc-800 text-[11px] font-sans font-medium">
                      {tr.key_changes.join(" • ")}
                    </div>

                    <Link
                      href={`/compare?baseline=${tr.from_id}&current=${tr.to_id}`}
                      className="text-xs text-black font-black flex items-center gap-1 shrink-0 bg-[#FFE600] px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                      <span>Compare Drift</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 border-2 border-black bg-[#FAF8F5] shadow-[3px_3px_0px_0px_#000] text-xs text-zinc-800 font-mono font-bold flex items-center gap-2.5">
            <Info className="w-4 h-4 text-black shrink-0" />
            <span className="leading-relaxed">{posture.disclaimer}</span>
          </div>
        </div>
      )}
      {/* Demo Journey — Step 8 CTA: navigate to Auditable Report */}
      <DemoNextStepCTA
        nextRoute="/reports?analysisId=AX-2026-00428"
        nextLabel="View Auditable Report"
        context="Step 8 of 8 — Evidence chain, executive summary, and technical report for AX-2026-00428."
      />
    </div>
  );
}
