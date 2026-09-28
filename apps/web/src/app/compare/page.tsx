"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
    <div className="space-y-6">
      <PageHeader
        title="Configuration Drift & Comparison"
        subtitle="Evaluate security divergence between a known-good baseline and an active or historical tunnel session."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Compare" },
        ]}
      />

      {/* USP Banner */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0F1218] to-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-[#F4F7FA] flex items-center gap-2 flex-wrap">
              <span>AbhedyaX USP-02: Configuration Drift Detection</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                Architectural USP
              </span>
            </div>
            <p className="text-xs text-[#9AA4B2] mt-0.5 leading-relaxed">
              Exposes protocol, cryptographic, and operational deviations with exact canonical score deltas.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-[#9AA4B2] shrink-0">
          Provenance: <strong className="text-[#F4F7FA]">{comparison?.provenance || "Demo Comparison"}</strong>
        </div>
      </div>

      {/* Judge Mode Curated Presets */}
      <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218] backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase font-mono text-indigo-400 mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Judge Demo Presets (1-Click Walkthrough)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((pr) => {
            const isActive = pr.baseline_id === baselineId && pr.current_id === currentId;
            return (
              <button
                key={pr.id}
                onClick={() => selectPreset(pr)}
                className={`p-3.5 text-left rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isActive
                    ? "bg-indigo-600/20 border-indigo-500/60 text-[#F4F7FA] shadow-md shadow-indigo-950/40"
                    : "bg-[#141820] border-[#252B35] text-[#9AA4B2] hover:text-[#F4F7FA] hover:border-[#3B4252]"
                }`}
              >
                <div>
                  <div className="font-semibold text-[#F4F7FA] flex items-center justify-between">
                    <span>{pr.name}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </div>
                  <div className="text-[11px] text-[#9AA4B2] mt-1.5 line-clamp-2 leading-relaxed">
                    {pr.description}
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#252B35]/60 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-indigo-300 font-semibold">{pr.expected_score_transition}</span>
                  <ArrowRight className="w-3 h-3 text-[#687384]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Selectors Bar */}
      <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5">
          <label className="block text-[11px] font-mono uppercase text-[#9AA4B2] mb-1.5 font-semibold">
            Baseline Analysis (Reference Anchor)
          </label>
          <select
            value={baselineId}
            onChange={(e) => handleBaselineChange(e.target.value)}
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg px-3 py-2 text-xs font-mono text-[#F4F7FA] focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {CANONICAL_RECENT_ANALYSES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} — {a.sourceName} ({a.securityScore}/100 {a.riskLevel})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-center py-2 md:py-0">
          <div className="p-2.5 rounded-full bg-[#141820] text-indigo-400 border border-[#252B35]">
            <GitCompare className="w-4 h-4" />
          </div>
        </div>

        <div className="md:col-span-5">
          <label className="block text-[11px] font-mono uppercase text-[#9AA4B2] mb-1.5 font-semibold">
            Target Analysis (Comparison Subject)
          </label>
          <select
            value={currentId}
            onChange={(e) => handleCurrentChange(e.target.value)}
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg px-3 py-2 text-xs font-mono text-[#F4F7FA] focus:outline-none focus:border-indigo-500 cursor-pointer"
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
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3" />
          Computing configuration drift and security delta...
        </div>
      ) : !comparison ? (
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          Comparison data unavailable.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Impact Metric Header */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218] backdrop-blur-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-3.5 rounded-lg bg-[#141820] border border-[#252B35]">
              <div className="text-xs text-[#9AA4B2]">Baseline Posture</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-[#F4F7FA]">
                  {comparison.security_impact.baseline_score}
                </span>
                <RiskBadge level={comparison.security_impact.baseline_risk as RiskLevel} />
              </div>
              <div className="text-[11px] text-[#687384] font-mono mt-1">
                ID: {comparison.baseline_analysis_id}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#141820] border border-[#252B35]">
              <div className="text-xs text-[#9AA4B2]">Target Posture</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-[#F4F7FA]">
                  {comparison.security_impact.current_score}
                </span>
                <RiskBadge level={comparison.security_impact.current_risk as RiskLevel} />
              </div>
              <div className="text-[11px] text-[#687384] font-mono mt-1">
                ID: {comparison.current_analysis_id}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#141820] border border-[#252B35]">
              <div className="text-xs text-[#9AA4B2]">Score Delta</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-2xl font-bold font-mono flex items-center gap-1 ${
                    comparison.security_impact.score_delta > 0
                      ? "text-emerald-400"
                      : comparison.security_impact.score_delta < 0
                      ? "text-red-400"
                      : "text-[#F4F7FA]"
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
                <span className="text-xs text-[#9AA4B2]">pts</span>
              </div>
              <div className="text-[11px] text-[#687384] font-mono mt-1">
                Transition: {comparison.security_impact.baseline_risk} → {comparison.security_impact.current_risk}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#141820] border border-[#252B35]">
              <div className="text-xs text-[#9AA4B2]">Change Metrics</div>
              <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                <span className="text-[#F4F7FA]">
                  <strong>{comparison.summary.total_changes}</strong> Total
                </span>
                <span className="text-[#3B4252]">•</span>
                <span className="text-red-400">
                  <strong>{comparison.summary.weakened_changes}</strong> Weakened
                </span>
                <span className="text-[#3B4252]">•</span>
                <span className="text-emerald-400">
                  <strong>{comparison.summary.strengthened_changes}</strong> Stronger
                </span>
              </div>
              <div className="text-[11px] text-[#687384] font-mono mt-1">
                Compatibility: {comparison.compatibility.compatible ? "Verified IPsec" : "Incompatible"}
              </div>
            </div>
          </div>

          {/* Drift Changes Detailed Table */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#252B35] gap-2">
              <h3 className="text-sm font-semibold text-[#F4F7FA]">Configuration Drift Breakdown</h3>
              <span className="text-xs font-mono text-[#9AA4B2]">
                {comparison.changes.length} properties evaluated
              </span>
            </div>

            <div className="w-full overflow-x-auto mt-4">
              <table className="w-full min-w-[760px] text-left text-xs font-mono border-collapse">
                <thead className="bg-[#141820] text-[#9AA4B2] text-[10px] uppercase border-b border-[#252B35]">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Property</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Baseline</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Target</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Change Type</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Severity</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Finding Ref</th>
                    <th className="py-2.5 px-3">Security Reasoning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252B35]/60">
                  {comparison.changes.map((ch, idx) => (
                    <tr key={idx} className="hover:bg-[#141820]/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-[#F4F7FA] whitespace-nowrap">{ch.property}</td>
                      <td className="py-3 px-3 text-[#9AA4B2] whitespace-nowrap">{String(ch.before)}</td>
                      <td className="py-3 px-3 text-[#F4F7FA] whitespace-nowrap">{String(ch.after)}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${
                            ch.change_type === "weakened"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : ch.change_type === "strengthened"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : ch.change_type === "changed"
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                              : "text-[#687384] border-[#252B35]"
                          }`}
                        >
                          {ch.change_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 capitalize whitespace-nowrap">
                        <span
                          className={
                            ch.severity === "critical"
                              ? "text-red-400 font-bold"
                              : ch.severity === "high"
                              ? "text-orange-400 font-semibold"
                              : ch.severity === "moderate"
                              ? "text-amber-400"
                              : "text-[#9AA4B2]"
                          }
                        >
                          {ch.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#9AA4B2] whitespace-nowrap">
                        {ch.finding_id ? (
                          <span className="px-1.5 py-0.5 rounded bg-[#141820] text-[#F4F7FA] border border-[#252B35]">
                            {ch.finding_id}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-3 font-sans text-[#9AA4B2] text-[11px] max-w-md">
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
  );
}

export default function ComparePage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3" />
          Loading configuration comparison...
        </div>
      }
    >
      <ComparePageContent />
    </React.Suspense>
  );
}
