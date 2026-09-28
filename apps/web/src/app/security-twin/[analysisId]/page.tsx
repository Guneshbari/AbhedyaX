"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SecurityScore } from "@/components/ui/SecurityScore";
import { getSecurityTwin } from "@/lib/api/securityTwin";
import { SecurityTwin } from "@/types/securityTwin";
import { RiskLevel } from "@/types/dashboard";
import { ArrowLeft, GitCompare, Sliders, Layers, FileText } from "lucide-react";

export default function SecurityTwinDetailPage() {
  const params = useParams();
  const analysisId = (params?.analysisId as string) || "AX-2026-00428";

  const [twin, setTwin] = useState<SecurityTwin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getSecurityTwin(analysisId)
      .then((data) => {
        if (isMounted) {
          setTwin(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading twin:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/security-twin"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-black hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Security Twin Overview</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/compare?current=${analysisId}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <GitCompare className="w-3.5 h-3.5 text-black" />
            <span>Compare Drift</span>
          </Link>
          <Link
            href={`/analyses/${analysisId}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-black" />
            <span>Analysis Dossier</span>
          </Link>
        </div>
      </div>

      <PageHeader
        title={`Security Twin: ${analysisId}`}
        subtitle="Detailed alignment breakdown between intended enterprise VPN policy and extracted wire observations."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Security Twin", href: "/security-twin" },
          { label: analysisId },
        ]}
      />

      {loading ? (
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          <div className="w-6 h-6 rounded-full border-2 border-black border-t-[#FFE600] animate-spin mx-auto mb-3" />
          Loading Security Twin for {analysisId}...
        </div>
      ) : !twin ? (
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          Security Twin unavailable for {analysisId}.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Posture Card */}
          <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
                  {twin.twin_id}
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
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-zinc-700 font-mono">
                <span>Provenance: <strong className="text-black font-black">{twin.provenance.observed_state}</strong></span>
                <span className="text-black">•</span>
                <span>Mode: <strong className="text-black capitalize font-black">{twin.mode}</strong></span>
                <span className="text-black">•</span>
                <span>Mismatches: <strong className="text-black font-black">{twin.alignment.mismatched_count}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
              <div className="text-right">
                <div className="text-xs text-zinc-700 font-bold">Canonical Score</div>
                <div className="flex items-center gap-2 mt-1">
                  <SecurityScore score={twin.security_impact.risk_score} size="md" />
                  <RiskBadge level={twin.security_impact.risk as RiskLevel} />
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-side states */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-black" />
                  <h3 className="text-sm font-black text-black">Expected Policy Baseline</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 border-2 border-black bg-[#FAF8F5] text-black font-bold shadow-[2px_2px_0px_0px_#000]">
                  {twin.provenance.expected_state}
                </span>
              </div>
              <dl className="mt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-black/20">
                  <dt className="text-zinc-700 font-bold">IKE Protocol</dt>
                  <dd className="text-black font-black">{twin.expected_state.ike_version}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-black/20">
                  <dt className="text-zinc-700 font-bold">Encryption</dt>
                  <dd className="text-black font-black">{twin.expected_state.encryption}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-black/20">
                  <dt className="text-zinc-700 font-bold">Diffie-Hellman</dt>
                  <dd className="text-black font-black">{twin.expected_state.dh_group}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-black/20">
                  <dt className="text-zinc-700 font-bold">Forward Secrecy</dt>
                  <dd className="text-emerald-700 font-black">PFS Enabled</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-black/20">
                  <dt className="text-zinc-700 font-bold">Replay Protection</dt>
                  <dd className="text-emerald-700 font-black">Active Window</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-zinc-700 font-bold">SA Lifetime</dt>
                  <dd className="text-black font-black">{twin.expected_state.sa_lifetime}s</dd>
                </div>
              </dl>
            </div>

            <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-black" />
                  <h3 className="text-sm font-black text-black">Observed Session State</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 border-2 border-black bg-[#FAF8F5] text-black font-bold shadow-[2px_2px_0px_0px_#000]">
                  {twin.provenance.observed_state}
                </span>
              </div>
              <dl className="mt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-black/20">
                  <dt className="text-zinc-700 font-bold">IKE Protocol</dt>
                  <dd className="text-black font-black">{twin.observed_state.ike_version}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-black/20">
                  <dt className="text-zinc-700 font-bold">Encryption</dt>
                  <dd className="text-black font-black">{twin.observed_state.encryption}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-black/20">
                  <dt className="text-zinc-700 font-bold">Diffie-Hellman</dt>
                  <dd className="text-black font-black">{twin.observed_state.dh_group}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-black/20">
                  <dt className="text-zinc-700 font-bold">Forward Secrecy</dt>
                  <dd className={twin.observed_state.pfs ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                    {twin.observed_state.pfs ? "PFS Enabled" : "PFS Disabled"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-black/20">
                  <dt className="text-zinc-700 font-bold">Replay Protection</dt>
                  <dd className={twin.observed_state.replay_protection ? "text-emerald-700 font-black" : "text-red-700 font-black"}>
                    {twin.observed_state.replay_protection ? "Active Window" : "Disabled (Vulnerable)"}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-zinc-700 font-bold">SA Lifetime</dt>
                  <dd className="text-black font-black">{twin.observed_state.sa_lifetime}s</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Matrix */}
          <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
            <h3 className="text-sm font-black text-black mb-4">Evidence Alignment Matrix</h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs font-mono border-collapse border-2 border-black">
                <thead className="bg-[#FFE600] text-black text-[11px] uppercase font-black border-b-2 border-black">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Property</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Expected</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Observed</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Evidence Ref</th>
                    <th className="py-2.5 px-3">Impact Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {twin.alignment.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-[#FFF9D2]/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-black whitespace-nowrap">{it.property}</td>
                      <td className="py-3 px-3 text-zinc-700 whitespace-nowrap">{String(it.expected)}</td>
                      <td className="py-3 px-3 text-black font-bold whitespace-nowrap">{String(it.observed)}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {it.status === "match" ? (
                          <span className="text-black bg-[#4ADE80] px-2 py-0.5 border-2 border-black text-[11px] font-black shadow-[2px_2px_0px_0px_#000]">Match</span>
                        ) : (
                          <span className="text-black bg-[#FF4B4B] px-2 py-0.5 border-2 border-black text-[11px] font-black shadow-[2px_2px_0px_0px_#000]">Mismatch</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-zinc-700 whitespace-nowrap font-bold">{it.evidence_ids.join(", ") || "—"}</td>
                      <td className="py-3 px-3 font-sans text-zinc-800 text-[11px] font-medium">{it.impact_note || "—"}</td>
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
