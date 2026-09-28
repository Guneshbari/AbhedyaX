"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { compareAnalyses, getDemoComparisons } from "@/lib/api/securityTwin";
import { DriftComparisonResult, DemoComparisonPreset } from "@/types/securityTwin";
import { RiskLevel } from "@/types/dashboard";
import { CANONICAL_RECENT_ANALYSES } from "@/data/dashboardData";
import {
  GitCompare,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
} from "lucide-react";

function ComparePageContent() {
  const searchParams = useSearchParams();
  const initialCurrent = searchParams.get("current") || "AX-2026-00427";
  const initialBaseline = searchParams.get("baseline") || "AX-2026-00428";

  const [baselineId, setBaselineId] = useState<string>(initialBaseline);
  const [currentId, setCurrentId] = useState<string>(initialCurrent);
  const [comparison, setComparison] = useState<DriftComparisonResult | null>(null);
  const [presets, setPresets] = useState<DemoComparisonPreset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getDemoComparisons().then((p) => setPresets(p));
  }, []);

  useEffect(() => {
    let isMounted = true;
    compareAnalyses(baselineId, currentId)
      .then((res) => {
        if (isMounted) {
          setComparison(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Comparison failed:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [baselineId, currentId]);

  const selectPreset = (preset: DemoComparisonPreset) => {
    setLoading(true);
    setBaselineId(preset.baseline_id);
    setCurrentId(preset.current_id);
  };

  const handleBaselineChange = (id: string) => {
    setLoading(true);
    setBaselineId(id);
  };

  const handleCurrentChange = (id: string) => {
    setLoading(true);
    setCurrentId(id);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Configuration Drift & Comparison"
          subtitle="Evaluate security divergence between a known-good baseline and an active or historical tunnel session."
        />

        {/* USP Banner */}
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>AbhedyaX USP-02: Configuration Drift Detection</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Architectural USP
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Exposes protocol, cryptographic, and operational deviations with exact canonical score deltas.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-neutral-400 shrink-0">
            Provenance: <strong className="text-neutral-200">{comparison?.provenance || "Demo Comparison"}</strong>
          </div>
        </div>

        {/* Judge Mode Curated Presets */}
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase font-mono text-indigo-400 mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Judge Demo Presets (1-Click Walkthrough)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {presets.map((pr) => {
              const isActive = pr.baseline_id === baselineId && pr.current_id === currentId;
              return (
                <button
                  key={pr.id}
                  onClick={() => selectPreset(pr)}
                  className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isActive
                      ? "bg-indigo-600/20 border-indigo-500/60 text-white shadow-md shadow-indigo-950/40"
                      : "bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>{pr.name}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                      {pr.description}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-indigo-300 font-semibold">{pr.expected_score_transition}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Selectors Bar */}
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
              Baseline Analysis (Reference Anchor)
            </label>
            <select
              value={baselineId}
              onChange={(e) => handleBaselineChange(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            >
              {CANONICAL_RECENT_ANALYSES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.sourceName} ({a.securityScore}/100 {a.riskLevel})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-center pt-4 md:pt-0">
            <div className="p-2 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
              <GitCompare className="w-4 h-4" />
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
              Target Analysis (Comparison Subject)
            </label>
            <select
              value={currentId}
              onChange={(e) => handleCurrentChange(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            >
              {CANONICAL_RECENT_ANALYSES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.sourceName} ({a.securityScore}/100 {a.riskLevel})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Computing configuration drift and security delta...
          </div>
        ) : !comparison ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Comparison data unavailable.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Impact Metric Header */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-neutral-400">Baseline Posture</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-white">
                    {comparison.security_impact.baseline_score}
                  </span>
                  <RiskBadge level={comparison.security_impact.baseline_risk as RiskLevel} />
                </div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  ID: {comparison.baseline_analysis_id}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Target Posture</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-white">
                    {comparison.security_impact.current_score}
                  </span>
                  <RiskBadge level={comparison.security_impact.current_risk as RiskLevel} />
                </div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  ID: {comparison.current_analysis_id}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Score Delta</div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-2xl font-bold font-mono flex items-center gap-1 ${
                      comparison.security_impact.score_delta > 0
                        ? "text-emerald-400"
                        : comparison.security_impact.score_delta < 0
                        ? "text-red-400"
                        : "text-neutral-300"
                    }`}
                  >
                    {comparison.security_impact.score_delta > 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : comparison.security_impact.score_delta < 0 ? (
                      <TrendingDown className="w-5 h-5" />
                    ) : (
                      <Minus className="w-5 h-5" />
                    )}
                    {comparison.security_impact.score_delta > 0
                      ? `+${comparison.security_impact.score_delta}`
                      : comparison.security_impact.score_delta}
                  </span>
                  <span className="text-xs text-neutral-400">points</span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  Transition: {comparison.security_impact.baseline_risk} → {comparison.security_impact.current_risk}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Change Metrics</div>
                <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                  <span className="text-neutral-200">
                    <strong>{comparison.summary.total_changes}</strong> Total
                  </span>
                  <span>•</span>
                  <span className="text-red-400">
                    <strong>{comparison.summary.weakened_changes}</strong> Weakened
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400">
                    <strong>{comparison.summary.strengthened_changes}</strong> Stronger
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  Compatibility: {comparison.compatibility.compatible ? "Verified IPsec" : "Incompatible"}
                </div>
              </div>
            </div>

            {/* Drift Changes Detailed Table */}
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="text-sm font-semibold text-white">Configuration Drift Breakdown</h3>
                <span className="text-xs font-mono text-neutral-400">
                  {comparison.changes.length} properties evaluated
                </span>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-950 text-neutral-400 text-[10px] uppercase border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-3">Property</th>
                      <th className="py-2.5 px-3">Baseline</th>
                      <th className="py-2.5 px-3">Target</th>
                      <th className="py-2.5 px-3">Change Type</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Finding Ref</th>
                      <th className="py-2.5 px-3">Security Reasoning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {comparison.changes.map((ch, idx) => (
                      <tr key={idx} className="hover:bg-neutral-800/20 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-white">{ch.property}</td>
                        <td className="py-2.5 px-3 text-neutral-300">{String(ch.before)}</td>
                        <td className="py-2.5 px-3 text-neutral-300">{String(ch.after)}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                              ch.change_type === "weakened"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : ch.change_type === "strengthened"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : ch.change_type === "changed"
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "text-neutral-500"
                            }`}
                          >
                            {ch.change_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 capitalize">
                          <span
                            className={
                              ch.severity === "critical"
                                ? "text-red-400 font-bold"
                                : ch.severity === "high"
                                ? "text-orange-400 font-semibold"
                                : ch.severity === "moderate"
                                ? "text-amber-400"
                                : "text-neutral-400"
                            }
                          >
                            {ch.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-400">
                          {ch.finding_id ? (
                            <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">
                              {ch.finding_id}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-neutral-300 text-[11px] max-w-md">
                          {ch.reason || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function ComparePage() {
  return (
    <React.Suspense
      fallback={
        <AppShell>
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Loading configuration comparison...
          </div>
        </AppShell>
      }
    >
      <ComparePageContent />
    </React.Suspense>
  );
}

