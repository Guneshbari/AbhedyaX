"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { DemoNextStepCTA } from "@/components/ui/DemoNextStepCTA";
import { compareAnalyses, getDemoComparisons } from "@/lib/api/securityTwin";
import { getDemoDriftComparison, CANONICAL_DEMO_COMPARISONS } from "@/demo";
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
  const [comparison, setComparison] = useState<DriftComparisonResult | null>(
    () => getDemoDriftComparison(initialBaseline, initialCurrent)
  );
  const [presets, setPresets] = useState<DemoComparisonPreset[]>(CANONICAL_DEMO_COMPARISONS);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getDemoComparisons()
      .then((p) => {
        if (p && p.length > 0) setPresets(p);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    compareAnalyses(baselineId, currentId)
      .then((res) => {
        if (isMounted && res) {
          setComparison(res);
        }
      })
      .catch((err) => {
        console.warn("API comparison failed, keeping demo drift fixture:", err);
        if (isMounted) {
          setComparison(getDemoDriftComparison(baselineId, currentId));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [baselineId, currentId]);

  const selectPreset = (preset: DemoComparisonPreset) => {
    setBaselineId(preset.baseline_id);
    setCurrentId(preset.current_id);
    setComparison(getDemoDriftComparison(preset.baseline_id, preset.current_id));
  };

  const handleBaselineChange = (id: string) => {
    setBaselineId(id);
    setComparison(getDemoDriftComparison(id, currentId));
  };

  const handleCurrentChange = (id: string) => {
    setCurrentId(id);
    setComparison(getDemoDriftComparison(baselineId, id));
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
      <div className="p-4 sm:p-5 bg-[#C084FC]/20 border-2 sm:border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#C084FC] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black shrink-0">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-black flex items-center gap-2 flex-wrap">
              <span>AbhedyaX USP-02: Configuration Drift Detection</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 border-2 border-black bg-white text-black font-black shadow-[2px_2px_0px_0px_#000]">
                Architectural USP
              </span>
            </div>
            <p className="text-xs text-zinc-800 mt-0.5 leading-relaxed font-bold">
              Exposes protocol, cryptographic, and operational deviations with exact canonical score deltas.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-zinc-700 shrink-0 font-bold">
          Provenance: <strong className="text-black font-black">{comparison?.provenance || "Demo Comparison"}</strong>
        </div>
      </div>

      {/* Judge Mode Curated Presets */}
      <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center gap-2 text-xs font-black uppercase font-mono text-black mb-3">
          <Sparkles className="w-4 h-4 text-black" />
          <span>Judge Demo Presets (1-Click Walkthrough)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((pr) => {
            const isActive = pr.baseline_id === baselineId && pr.current_id === currentId;
            return (
              <button
                key={pr.id}
                onClick={() => selectPreset(pr)}
                className={`p-3.5 text-left border-2 border-black transition-all text-xs flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? "bg-[#FFE600] text-black shadow-[4px_4px_0px_0px_#000] font-black"
                    : "bg-[#FAF8F5] text-black shadow-[2px_2px_0px_0px_#000] hover:bg-white hover:translate-x-[1px] hover:translate-y-[1px]"
                }`}
              >
                <div>
                  <div className="font-black text-black flex items-center justify-between">
                    <span>{pr.name}</span>
                    {isActive && <span className="w-2.5 h-2.5 rounded-full border border-black bg-black" />}
                  </div>
                  <div className="text-[11px] text-zinc-700 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                    {pr.description}
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t-2 border-black flex items-center justify-between font-mono text-[10px]">
                  <span className="text-black font-black">{pr.expected_score_transition}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Selectors Bar */}
      <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5">
          <label className="block text-[11px] font-mono uppercase text-black mb-1.5 font-black">
            Baseline Analysis (Reference Anchor)
          </label>
          <select
            value={baselineId}
            onChange={(e) => handleBaselineChange(e.target.value)}
            className="w-full bg-[#FAF8F5] border-2 border-black px-3 py-2 text-xs font-mono text-black font-bold focus:outline-none focus:bg-[#FFE600] cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            {CANONICAL_RECENT_ANALYSES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} — {a.sourceName} ({a.securityScore}/100 {a.riskLevel})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-center py-2 md:py-0">
          <div className="p-2.5 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <GitCompare className="w-4 h-4" />
          </div>
        </div>

        <div className="md:col-span-5">
          <label className="block text-[11px] font-mono uppercase text-black mb-1.5 font-black">
            Target Analysis (Comparison Subject)
          </label>
          <select
            value={currentId}
            onChange={(e) => handleCurrentChange(e.target.value)}
            className="w-full bg-[#FAF8F5] border-2 border-black px-3 py-2 text-xs font-mono text-black font-bold focus:outline-none focus:bg-[#FFE600] cursor-pointer shadow-[2px_2px_0px_0px_#000]"
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
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          <div className="w-6 h-6 rounded-full border-2 border-black border-t-[#FFE600] animate-spin mx-auto mb-3" />
          Computing configuration drift and security delta...
        </div>
      ) : !comparison ? (
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          Comparison data unavailable.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Impact Metric Header */}
          <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-xs text-zinc-700 font-bold">Baseline Posture</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-black">
                  {comparison.security_impact.baseline_score}
                </span>
                <RiskBadge level={comparison.security_impact.baseline_risk as RiskLevel} />
              </div>
              <div className="text-[11px] text-zinc-600 font-mono mt-1 font-bold">
                ID: {comparison.baseline_analysis_id}
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-xs text-zinc-700 font-bold">Target Posture</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-black">
                  {comparison.security_impact.current_score}
                </span>
                <RiskBadge level={comparison.security_impact.current_risk as RiskLevel} />
              </div>
              <div className="text-[11px] text-zinc-600 font-mono mt-1 font-bold">
                ID: {comparison.current_analysis_id}
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-xs text-zinc-700 font-bold">Score Delta</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-2xl font-black font-mono flex items-center gap-1 ${
                    comparison.security_impact.score_delta > 0
                      ? "text-emerald-700"
                      : comparison.security_impact.score_delta < 0
                      ? "text-red-700"
                      : "text-black"
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
                <span className="text-xs text-zinc-600 font-bold">pts</span>
              </div>
              <div className="text-[11px] text-zinc-600 font-mono mt-1 font-bold">
                Transition: {comparison.security_impact.baseline_risk} → {comparison.security_impact.current_risk}
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-xs text-zinc-700 font-bold">Change Metrics</div>
              <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                <span className="text-black font-bold">
                  <strong>{comparison.summary.total_changes}</strong> Total
                </span>
                <span className="text-black">•</span>
                <span className="text-red-700 font-bold">
                  <strong>{comparison.summary.weakened_changes}</strong> Weakened
                </span>
                <span className="text-black">•</span>
                <span className="text-emerald-700 font-bold">
                  <strong>{comparison.summary.strengthened_changes}</strong> Stronger
                </span>
              </div>
              <div className="text-[11px] text-zinc-600 font-mono mt-1 font-bold">
                Compatibility: {comparison.compatibility.compatible ? "Verified IPsec" : "Incompatible"}
              </div>
            </div>
          </div>

          {/* Drift Changes Detailed Table */}
          <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-2">
              <h3 className="text-sm font-black text-black">Configuration Drift Breakdown</h3>
              <span className="text-xs font-mono text-zinc-700 font-bold">
                {comparison.changes.length} properties evaluated
              </span>
            </div>

            <div className="w-full overflow-x-auto mt-4">
              <table className="w-full min-w-[760px] text-left text-xs font-mono border-collapse border-2 border-black">
                <thead className="bg-[#FFE600] text-black text-[11px] uppercase font-black border-b-2 border-black">
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
                <tbody className="divide-y-2 divide-black">
                  {comparison.changes.map((ch, idx) => (
                    <tr key={idx} className="hover:bg-[#FFF9D2]/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-black whitespace-nowrap">{ch.property}</td>
                      <td className="py-3 px-3 text-zinc-700 whitespace-nowrap font-medium">{String(ch.before)}</td>
                      <td className="py-3 px-3 text-black font-black whitespace-nowrap">{String(ch.after)}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 border-2 border-black text-[10px] uppercase font-black shadow-[2px_2px_0px_0px_#000] ${
                            ch.change_type === "weakened"
                              ? "bg-[#FF4B4B] text-black"
                              : ch.change_type === "strengthened"
                              ? "bg-[#4ADE80] text-black"
                              : ch.change_type === "changed"
                              ? "bg-[#38BDF8] text-black"
                              : "bg-[#FAF8F5] text-zinc-700 border-black"
                          }`}
                        >
                          {ch.change_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 capitalize whitespace-nowrap font-black">
                        <span
                          className={
                            ch.severity === "critical"
                              ? "text-red-700 font-black"
                              : ch.severity === "high"
                              ? "text-orange-700 font-black"
                              : ch.severity === "moderate"
                              ? "text-amber-700 font-black"
                              : "text-zinc-700"
                          }
                        >
                          {ch.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-700 whitespace-nowrap">
                        {ch.finding_id ? (
                          <span className="px-1.5 py-0.5 border border-black bg-[#FAF8F5] text-black font-bold shadow-[1px_1px_0px_0px_#000]">
                            {ch.finding_id}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-3 font-sans text-zinc-800 text-[11px] max-w-md font-medium">
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
      {/* Demo Journey — Step 6 CTA: navigate to Metadata Exposure */}
      <DemoNextStepCTA
        nextRoute="/metadata-exposure"
        nextLabel="View Metadata Exposure"
        context="Step 7 of 8 — Analyze encrypted traffic metadata without decrypting payload."
      />
    </div>
  );
}

export default function ComparePage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          <div className="w-6 h-6 rounded-full border-2 border-black border-t-[#FFE600] animate-spin mx-auto mb-3" />
          Loading configuration comparison...
        </div>
      }
    >
      <ComparePageContent />
    </React.Suspense>
  );
}
