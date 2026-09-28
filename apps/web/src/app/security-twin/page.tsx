"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    <div className="space-y-6">
      <PageHeader
        title="Security Twin"
        subtitle="Correlate intended enterprise VPN security policies with observed wire/session parameters to detect drift and verify continuous compliance."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Security Twin" },
        ]}
      />

      {/* USP Highlight Banner */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0F1218] to-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-[#F4F7FA] flex items-center gap-2 flex-wrap">
              <span>AbhedyaX USP-01: Evidence-Backed Security Twin</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                Architectural USP
              </span>
            </div>
            <p className="text-xs text-[#9AA4B2] mt-0.5 leading-relaxed">
              Evaluates whether observed cryptographic and protocol behavior strictly satisfies the intended security specification.
            </p>
          </div>
        </div>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#141820] hover:bg-[#1C222C] text-[#F4F7FA] border border-[#252B35] transition-colors shrink-0"
        >
          <span>Compare Configurations</span>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
        </Link>
      </div>

      {/* Analysis Session Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#252B35] pb-3">
        {CANONICAL_RECENT_ANALYSES.map((item) => {
          const isSelected = item.id === selectedAnalysisId;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectAnalysis(item.id)}
              className={`px-3 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 border shrink-0 ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500/50 text-[#F4F7FA] font-medium shadow-sm"
                  : "bg-[#0F1218] border-[#252B35] text-[#9AA4B2] hover:text-[#F4F7FA] hover:border-[#3B4252]"
              }`}
            >
              <span>{item.id}</span>
              <span className="text-[10px] text-[#687384]">({item.vpnProtocol})</span>
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
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3" />
          Loading Security Twin for {selectedAnalysisId}...
        </div>
      ) : !twin ? (
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          Security Twin unavailable.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Twin Header Card */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218] backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#F4F7FA] tracking-tight">
                    Twin Representation: {twin.twin_id}
                  </h2>
                  <span
                    className={`text-xs uppercase font-mono px-2.5 py-0.5 rounded-full font-medium ${
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
                <p className="text-xs text-[#9AA4B2] mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Analysis ID: <strong className="font-mono text-[#F4F7FA]">{twin.analysis_id}</strong></span>
                  <span className="text-[#3B4252]">•</span>
                  <span>Mode: <strong className="capitalize font-mono text-[#F4F7FA]">{twin.mode}</strong></span>
                  <span className="text-[#3B4252]">•</span>
                  <span>Expected: <strong className="font-mono text-[#F4F7FA]">{twin.provenance.expected_state}</strong></span>
                  <span className="text-[#3B4252]">•</span>
                  <span>Observed: <strong className="font-mono text-[#F4F7FA]">{twin.provenance.observed_state}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-end lg:self-center">
                <div className="text-right">
                  <div className="text-xs text-[#9AA4B2]">Canonical Security Score</div>
                  <div className="flex items-center gap-2 mt-1">
                    <SecurityScore score={twin.security_impact.risk_score} size="md" />
                    <RiskBadge level={twin.security_impact.risk as RiskLevel} />
                  </div>
                </div>

                <Link
                  href={`/security-twin/${twin.analysis_id}`}
                  className="p-2.5 rounded-lg bg-[#141820] hover:bg-[#1C222C] border border-[#252B35] text-[#9AA4B2] hover:text-[#F4F7FA] transition-colors"
                  title="Open Detailed View"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Expected vs Observed State Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expected Intended Policy State */}
            <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218]">
              <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-[#F4F7FA]">Intended Security Policy (Expected)</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141820] text-[#9AA4B2] border border-[#252B35]">
                  {twin.provenance.expected_state}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">IKE Protocol</span>
                  <span className="font-mono text-[#F4F7FA] font-medium">{twin.expected_state.ike_version || "IKEv2"}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">Encryption</span>
                  <span className="font-mono text-[#F4F7FA] font-medium">{twin.expected_state.encryption || "AES-256-GCM"}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">Key Exchange</span>
                  <span className="font-mono text-[#F4F7FA] font-medium">{twin.expected_state.dh_group || "DH Group 19"}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">Forward Secrecy</span>
                  <span className="font-mono text-emerald-400 font-medium">PFS Enabled</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">Replay Window</span>
                  <span className="font-mono text-emerald-400 font-medium">Active (Protected)</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">SA Rekey Lifetime</span>
                  <span className="font-mono text-[#F4F7FA] font-medium">{twin.expected_state.sa_lifetime || 28800}s (8h)</span>
                </div>
              </div>
            </div>

            {/* Observed Wire State */}
            <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218]">
              <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-[#F4F7FA]">Wire Inspection (Observed State)</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141820] text-[#9AA4B2] border border-[#252B35]">
                  {twin.provenance.observed_state}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">IKE Protocol</span>
                  <span className="font-mono text-[#F4F7FA] font-medium">{twin.observed_state.ike_version}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">Encryption</span>
                  <span className="font-mono text-[#F4F7FA] font-medium">{twin.observed_state.encryption}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">Key Exchange</span>
                  <span className="font-mono text-[#F4F7FA] font-medium">{twin.observed_state.dh_group}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">Forward Secrecy</span>
                  <span className={`font-mono font-medium ${twin.observed_state.pfs ? "text-emerald-400" : "text-amber-400"}`}>
                    {twin.observed_state.pfs ? "PFS Enabled" : "PFS Disabled"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">Replay Window</span>
                  <span
                    className={`font-mono font-medium ${
                      twin.observed_state.replay_protection ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {twin.observed_state.replay_protection ? "Active (Protected)" : "Disabled (Vulnerable)"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
                  <span className="text-[#687384] block text-[10px] uppercase font-mono">SA Rekey Lifetime</span>
                  <span className="font-mono text-[#F4F7FA] font-medium">{twin.observed_state.sa_lifetime}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alignment Evaluation Matrix */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#252B35] gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-[#F4F7FA]">Policy Alignment Matrix</h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-[#9AA4B2]">
                <span className="text-emerald-400">{twin.alignment.matched_count} Aligned</span>
                <span>•</span>
                <span className="text-red-400">{twin.alignment.mismatched_count} Mismatched</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto mt-4">
              <table className="w-full min-w-[720px] text-left text-xs border-collapse">
                <thead className="bg-[#141820] text-[#9AA4B2] font-mono uppercase text-[10px] border-b border-[#252B35]">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Property</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Expected Policy</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Observed Wire</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Evidence Ref</th>
                    <th className="py-2.5 px-3">Impact Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252B35]/60 font-mono">
                  {twin.alignment.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#141820]/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-[#F4F7FA] whitespace-nowrap">{item.property}</td>
                      <td className="py-3 px-3 text-[#9AA4B2] whitespace-nowrap">{String(item.expected)}</td>
                      <td className="py-3 px-3 text-[#F4F7FA] whitespace-nowrap">{String(item.observed)}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.status === "match" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded text-[11px] font-medium border border-red-500/20">
                            <XCircle className="w-3 h-3" /> Mismatch
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#9AA4B2] whitespace-nowrap">
                        {item.evidence_ids.join(", ") || "—"}
                      </td>
                      <td className="py-3 px-3 font-sans text-[#9AA4B2] text-[11px]">
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
            <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218]">
              <h4 className="text-xs font-mono uppercase text-[#9AA4B2] mb-3 font-semibold">Remediation Guidance</h4>
              <ul className="space-y-2 text-xs text-[#F4F7FA]">
                {twin.security_impact.remediation_advice.map((adv, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-indigo-400 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
