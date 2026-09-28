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
      <div className="p-4 sm:p-5 bg-[#C084FC]/20 border-2 sm:border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#C084FC] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-black flex items-center gap-2 flex-wrap">
              <span>AbhedyaX USP-01: Evidence-Backed Security Twin</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 border-2 border-black bg-white text-black font-black shadow-[2px_2px_0px_0px_#000]">
                Architectural USP
              </span>
            </div>
            <p className="text-xs text-zinc-800 mt-0.5 leading-relaxed font-bold">
              Evaluates whether observed cryptographic and protocol behavior strictly satisfies the intended security specification.
            </p>
          </div>
        </div>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-black bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all shrink-0"
        >
          <span>Compare Configurations</span>
          <ArrowRight className="w-3.5 h-3.5 text-black" />
        </Link>
      </div>

      {/* Analysis Session Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-black pb-3">
        {CANONICAL_RECENT_ANALYSES.map((item) => {
          const isSelected = item.id === selectedAnalysisId;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectAnalysis(item.id)}
              className={`px-3 py-2 text-xs font-mono transition-all flex items-center gap-2 border-2 border-black shrink-0 ${
                isSelected
                  ? "bg-[#FFE600] text-black font-black shadow-[3px_3px_0px_0px_#000]"
                  : "bg-white text-black font-bold shadow-[2px_2px_0px_0px_#000] hover:bg-[#FAF8F5]"
              }`}
            >
              <span>{item.id}</span>
              <span className="text-[10px] text-zinc-600">({item.vpnProtocol})</span>
              <span
                className={`w-2.5 h-2.5 rounded-full border border-black ${
                  item.securityScore >= 90
                    ? "bg-[#4ADE80]"
                    : item.securityScore >= 75
                    ? "bg-[#FBBF24]"
                    : "bg-[#FF4B4B]"
                }`}
              />
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          <div className="w-6 h-6 rounded-full border-2 border-black border-t-[#FFE600] animate-spin mx-auto mb-3" />
          Loading Security Twin for {selectedAnalysisId}...
        </div>
      ) : !twin ? (
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          Security Twin unavailable.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Twin Header Card */}
          <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
                    Twin Representation: {twin.twin_id}
                  </h2>
                  <span
                    className={`text-xs uppercase font-mono px-2.5 py-1 border-2 border-black font-black shadow-[2px_2px_0px_0px_#000] ${
                      twin.alignment.overall === "aligned"
                        ? "bg-[#4ADE80] text-black"
                        : twin.alignment.overall === "partial"
                        ? "bg-[#FBBF24] text-black"
                        : "bg-[#FF4B4B] text-black"
                    }`}
                  >
                    {twin.alignment.overall}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono">
                  <span>Analysis ID: <strong className="font-mono text-black font-black">{twin.analysis_id}</strong></span>
                  <span className="text-black">•</span>
                  <span>Mode: <strong className="capitalize font-mono text-black font-black">{twin.mode}</strong></span>
                  <span className="text-black">•</span>
                  <span>Expected: <strong className="font-mono text-black font-black">{twin.provenance.expected_state}</strong></span>
                  <span className="text-black">•</span>
                  <span>Observed: <strong className="font-mono text-black font-black">{twin.provenance.observed_state}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-end lg:self-center">
                <div className="text-right">
                  <div className="text-xs text-zinc-700 font-bold">Canonical Security Score</div>
                  <div className="flex items-center gap-2 mt-1">
                    <SecurityScore score={twin.security_impact.risk_score} size="md" />
                    <RiskBadge level={twin.security_impact.risk as RiskLevel} />
                  </div>
                </div>

                <Link
                  href={`/security-twin/${twin.analysis_id}`}
                  className="p-2.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
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
            <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-black" />
                  <h3 className="text-sm font-black text-black">Intended Security Policy (Expected)</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 border-2 border-black bg-[#FAF8F5] text-black font-bold shadow-[2px_2px_0px_0px_#000]">
                  {twin.provenance.expected_state}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">IKE Protocol</span>
                  <span className="font-mono text-black font-black">{twin.expected_state.ike_version || "IKEv2"}</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">Encryption</span>
                  <span className="font-mono text-black font-black">{twin.expected_state.encryption || "AES-256-GCM"}</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">Key Exchange</span>
                  <span className="font-mono text-black font-black">{twin.expected_state.dh_group || "DH Group 19"}</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">Forward Secrecy</span>
                  <span className="font-mono text-emerald-700 font-black">PFS Enabled</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">Replay Window</span>
                  <span className="font-mono text-emerald-700 font-black">Active (Protected)</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">SA Rekey Lifetime</span>
                  <span className="font-mono text-black font-black">{twin.expected_state.sa_lifetime || 28800}s (8h)</span>
                </div>
              </div>
            </div>

            {/* Observed Wire State */}
            <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-black" />
                  <h3 className="text-sm font-black text-black">Wire Inspection (Observed State)</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 border-2 border-black bg-[#FAF8F5] text-black font-bold shadow-[2px_2px_0px_0px_#000]">
                  {twin.provenance.observed_state}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">IKE Protocol</span>
                  <span className="font-mono text-black font-black">{twin.observed_state.ike_version}</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">Encryption</span>
                  <span className="font-mono text-black font-black">{twin.observed_state.encryption}</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">Key Exchange</span>
                  <span className="font-mono text-black font-black">{twin.observed_state.dh_group}</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">Forward Secrecy</span>
                  <span className={`font-mono font-black ${twin.observed_state.pfs ? "text-emerald-700" : "text-amber-700"}`}>
                    {twin.observed_state.pfs ? "PFS Enabled" : "PFS Disabled"}
                  </span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">Replay Window</span>
                  <span
                    className={`font-mono font-black ${
                      twin.observed_state.replay_protection ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {twin.observed_state.replay_protection ? "Active (Protected)" : "Disabled (Vulnerable)"}
                  </span>
                </div>
                <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-zinc-700 block text-[10px] uppercase font-mono font-bold">SA Rekey Lifetime</span>
                  <span className="font-mono text-black font-black">{twin.observed_state.sa_lifetime}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alignment Evaluation Matrix */}
          <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <h3 className="text-sm font-black text-black">Policy Alignment Matrix</h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-black font-bold">
                <span className="text-emerald-700">{twin.alignment.matched_count} Aligned</span>
                <span>•</span>
                <span className="text-red-700">{twin.alignment.mismatched_count} Mismatched</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto mt-4">
              <table className="w-full min-w-[720px] text-left text-xs border-collapse border-2 border-black">
                <thead className="bg-[#FFE600] text-black font-mono font-black uppercase text-[11px] border-b-2 border-black">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Property</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Expected Policy</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Observed Wire</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Evidence Ref</th>
                    <th className="py-2.5 px-3">Impact Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black font-mono">
                  {twin.alignment.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FFF9D2]/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-black whitespace-nowrap">{item.property}</td>
                      <td className="py-3 px-3 text-zinc-700 whitespace-nowrap">{String(item.expected)}</td>
                      <td className="py-3 px-3 text-black font-bold whitespace-nowrap">{String(item.observed)}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.status === "match" ? (
                          <span className="inline-flex items-center gap-1 text-black bg-[#4ADE80] px-2 py-0.5 border-2 border-black text-[11px] font-black shadow-[2px_2px_0px_0px_#000]">
                            <CheckCircle2 className="w-3 h-3 text-black" /> Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-black bg-[#FF4B4B] px-2 py-0.5 border-2 border-black text-[11px] font-black shadow-[2px_2px_0px_0px_#000]">
                            <XCircle className="w-3 h-3 text-black" /> Mismatch
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-zinc-700 whitespace-nowrap font-bold">
                        {item.evidence_ids.join(", ") || "—"}
                      </td>
                      <td className="py-3 px-3 font-sans text-zinc-800 text-[11px] font-medium">
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
            <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <h4 className="text-xs font-mono uppercase text-black mb-3 font-black">Remediation Guidance</h4>
              <ul className="space-y-2 text-xs text-black">
                {twin.security_impact.remediation_advice.map((adv, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-black font-black mt-0.5">•</span>
                    <span className="leading-relaxed font-bold">{adv}</span>
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
