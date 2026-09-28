"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SecurityScore } from "@/components/ui/SecurityScore";
import { CANONICAL_RECENT_ANALYSES } from "@/data/dashboardData";
import { getSecurityTwin } from "@/lib/api/securityTwin";
import { SecurityTwin } from "@/types/securityTwin";
import { RiskLevel } from "@/types/dashboard";
import { ShieldCheck, ArrowRight, CheckCircle2, XCircle, Layers, Sliders, ExternalLink } from "lucide-react";

export default function SecurityTwinIndexPage() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>("AX-2026-00428");
  const [twin, setTwin] = useState<SecurityTwin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getSecurityTwin(selectedAnalysisId)
      .then((data) => {
        if (isMounted) {
          setTwin(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load Security Twin:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedAnalysisId]);

  const handleSelectAnalysis = (id: string) => {
    setLoading(true);
    setSelectedAnalysisId(id);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Security Twin"
          subtitle="Correlate intended enterprise VPN security policies with observed wire/session parameters to detect drift and verify continuous compliance."
        />

        {/* USP Highlight Banner */}
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>AbhedyaX USP-01: Evidence-Backed Security Twin</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Architectural USP
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Evaluates whether observed cryptographic and protocol behavior strictly satisfies the intended security specification.
              </p>
            </div>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors shrink-0"
          >
            <span>Compare Configurations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Analysis Session Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
          {CANONICAL_RECENT_ANALYSES.map((item) => {
            const isSelected = item.id === selectedAnalysisId;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectAnalysis(item.id)}
                className={`px-3 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 border ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500/50 text-white font-medium shadow-sm"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                <span>{item.id}</span>
                <span className="text-[10px] text-neutral-400">({item.vpnProtocol})</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.securityScore >= 90
                      ? "bg-emerald-400"
                      : item.securityScore >= 75
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Loading Security Twin for {selectedAnalysisId}...
          </div>
        ) : !twin ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Security Twin unavailable.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Twin Header Card */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                      Twin Representation: {twin.twin_id}
                    </h2>
                    <span
                      className={`text-xs uppercase font-mono px-2 py-0.5 rounded-full font-medium ${
                        twin.alignment.overall === "aligned"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : twin.alignment.overall === "partial"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {twin.alignment.overall}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Analysis ID: <span className="font-mono text-neutral-300">{twin.analysis_id}</span> | Mode:{" "}
                    <span className="capitalize font-mono text-neutral-300">{twin.mode}</span> | Expected Provenance:{" "}
                    <span className="font-mono text-neutral-300">{twin.provenance.expected_state}</span> | Observed:{" "}
                    <span className="font-mono text-neutral-300">{twin.provenance.observed_state}</span>
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-neutral-400">Canonical Security Score</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <SecurityScore score={twin.security_impact.risk_score} size="md" />
                      <RiskBadge level={twin.security_impact.risk as RiskLevel} />
                    </div>
                  </div>

                  <Link
                    href={`/security-twin/${twin.analysis_id}`}
                    className="p-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                    title="Open Detailed View"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Expected vs Observed State Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expected Intended Policy State */}
              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Intended Security Policy (Expected)</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {twin.provenance.expected_state}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">IKE Protocol</span>
                    <span className="font-mono text-neutral-200">{twin.expected_state.ike_version || "IKEv2"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Encryption</span>
                    <span className="font-mono text-neutral-200">{twin.expected_state.encryption || "AES-256-GCM"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Key Exchange</span>
                    <span className="font-mono text-neutral-200">{twin.expected_state.dh_group || "DH Group 19"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Forward Secrecy</span>
                    <span className="font-mono text-emerald-400 font-medium">PFS Enabled</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Replay Window</span>
                    <span className="font-mono text-emerald-400 font-medium">Active (Protected)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">SA Rekey Lifetime</span>
                    <span className="font-mono text-neutral-200">{twin.expected_state.sa_lifetime || 28800}s (8h)</span>
                  </div>
                </div>
              </div>

              {/* Observed Wire State */}
              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">Wire Inspection (Observed State)</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {twin.provenance.observed_state}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">IKE Protocol</span>
                    <span className="font-mono text-neutral-200">{twin.observed_state.ike_version}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Encryption</span>
                    <span className="font-mono text-neutral-200">{twin.observed_state.encryption}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Key Exchange</span>
                    <span className="font-mono text-neutral-200">{twin.observed_state.dh_group}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Forward Secrecy</span>
                    <span className={`font-mono font-medium ${twin.observed_state.pfs ? "text-emerald-400" : "text-amber-400"}`}>
                      {twin.observed_state.pfs ? "PFS Enabled" : "PFS Disabled"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Replay Window</span>
                    <span
                      className={`font-mono font-medium ${
                        twin.observed_state.replay_protection ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {twin.observed_state.replay_protection ? "Active (Protected)" : "Disabled (Vulnerable)"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">SA Rekey Lifetime</span>
                    <span className="font-mono text-neutral-200">{twin.observed_state.sa_lifetime}s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alignment Evaluation Matrix */}
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Policy Alignment Matrix</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                  <span className="text-emerald-400">{twin.alignment.matched_count} Aligned</span>
                  <span>•</span>
                  <span className="text-red-400">{twin.alignment.mismatched_count} Mismatched</span>
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 text-neutral-400 font-mono uppercase text-[10px] border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-3">Property</th>
                      <th className="py-2.5 px-3">Expected Policy</th>
                      <th className="py-2.5 px-3">Observed Wire</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Evidence Ref</th>
                      <th className="py-2.5 px-3">Impact Analysis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono">
                    {twin.alignment.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-800/20 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-white">{item.property}</td>
                        <td className="py-2.5 px-3 text-neutral-300">{String(item.expected)}</td>
                        <td className="py-2.5 px-3 text-neutral-300">{String(item.observed)}</td>
                        <td className="py-2.5 px-3">
                          {item.status === "match" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> Match
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded text-[11px]">
                              <XCircle className="w-3 h-3" /> Mismatch
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-400">
                          {item.evidence_ids.join(", ") || "—"}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-neutral-300 text-[11px]">
                          {item.impact_note || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Remediation Advice & Security Actions */}
            {twin.security_impact.remediation_advice.length > 0 && (
              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h4 className="text-xs font-mono uppercase text-neutral-400 mb-2">Remediation Guidance</h4>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {twin.security_impact.remediation_advice.map((adv, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
