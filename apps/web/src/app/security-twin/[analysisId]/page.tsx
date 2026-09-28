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
          className="inline-flex items-center gap-2 text-xs font-mono text-[#9AA4B2] hover:text-[#F4F7FA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Security Twin Overview</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/compare?current=${analysisId}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#141820] hover:bg-[#1C222C] text-[#F4F7FA] border border-[#252B35] transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Compare Drift</span>
          </Link>
          <Link
            href={`/analyses/${analysisId}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#141820] hover:bg-[#1C222C] text-[#F4F7FA] border border-[#252B35] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
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
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3" />
          Loading Security Twin for {analysisId}...
        </div>
      ) : !twin ? (
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          Security Twin unavailable for {analysisId}.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Posture Card */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218] backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg sm:text-xl font-semibold text-[#F4F7FA] tracking-tight">
                  {twin.twin_id}
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
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#9AA4B2] font-mono">
                <span>Provenance: <strong className="text-[#F4F7FA]">{twin.provenance.observed_state}</strong></span>
                <span className="text-[#3B4252]">•</span>
                <span>Mode: <strong className="text-[#F4F7FA] capitalize">{twin.mode}</strong></span>
                <span className="text-[#3B4252]">•</span>
                <span>Mismatches: <strong className="text-[#F4F7FA]">{twin.alignment.mismatched_count}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
              <div className="text-right">
                <div className="text-xs text-[#9AA4B2]">Canonical Score</div>
                <div className="flex items-center gap-2 mt-1">
                  <SecurityScore score={twin.security_impact.risk_score} size="md" />
                  <RiskBadge level={twin.security_impact.risk as RiskLevel} />
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-side states */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218]">
              <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-[#F4F7FA]">Expected Policy Baseline</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141820] text-[#9AA4B2] border border-[#252B35]">
                  {twin.provenance.expected_state}
                </span>
              </div>
              <dl className="mt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#252B35]/50">
                  <dt className="text-[#687384]">IKE Protocol</dt>
                  <dd className="text-[#F4F7FA] font-medium">{twin.expected_state.ike_version}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B35]/50">
                  <dt className="text-[#687384]">Encryption</dt>
                  <dd className="text-[#F4F7FA] font-medium">{twin.expected_state.encryption}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B35]/50">
                  <dt className="text-[#687384]">Diffie-Hellman</dt>
                  <dd className="text-[#F4F7FA] font-medium">{twin.expected_state.dh_group}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B35]/50">
                  <dt className="text-[#687384]">Forward Secrecy</dt>
                  <dd className="text-emerald-400 font-medium">PFS Enabled</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B35]/50">
                  <dt className="text-[#687384]">Replay Protection</dt>
                  <dd className="text-emerald-400 font-medium">Active Window</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-[#687384]">SA Lifetime</dt>
                  <dd className="text-[#F4F7FA] font-medium">{twin.expected_state.sa_lifetime}s</dd>
                </div>
              </dl>
            </div>

            <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218]">
              <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-[#F4F7FA]">Observed Session State</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141820] text-[#9AA4B2] border border-[#252B35]">
                  {twin.provenance.observed_state}
                </span>
              </div>
              <dl className="mt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#252B35]/50">
                  <dt className="text-[#687384]">IKE Protocol</dt>
                  <dd className="text-[#F4F7FA] font-medium">{twin.observed_state.ike_version}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B35]/50">
                  <dt className="text-[#687384]">Encryption</dt>
                  <dd className="text-[#F4F7FA] font-medium">{twin.observed_state.encryption}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B35]/50">
                  <dt className="text-[#687384]">Diffie-Hellman</dt>
                  <dd className="text-[#F4F7FA] font-medium">{twin.observed_state.dh_group}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B35]/50">
                  <dt className="text-[#687384]">Forward Secrecy</dt>
                  <dd className={twin.observed_state.pfs ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                    {twin.observed_state.pfs ? "PFS Enabled" : "PFS Disabled"}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B35]/50">
                  <dt className="text-[#687384]">Replay Protection</dt>
                  <dd className={twin.observed_state.replay_protection ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                    {twin.observed_state.replay_protection ? "Active Window" : "Disabled (Vulnerable)"}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-[#687384]">SA Lifetime</dt>
                  <dd className="text-[#F4F7FA] font-medium">{twin.observed_state.sa_lifetime}s</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Matrix */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218]">
            <h3 className="text-sm font-semibold text-[#F4F7FA] mb-4">Evidence Alignment Matrix</h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs font-mono border-collapse">
                <thead className="bg-[#141820] text-[#9AA4B2] text-[10px] uppercase border-b border-[#252B35]">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Property</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Expected</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Observed</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Evidence Ref</th>
                    <th className="py-2.5 px-3">Impact Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252B35]/60">
                  {twin.alignment.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-[#141820]/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-[#F4F7FA] whitespace-nowrap">{it.property}</td>
                      <td className="py-3 px-3 text-[#9AA4B2] whitespace-nowrap">{String(it.expected)}</td>
                      <td className="py-3 px-3 text-[#F4F7FA] whitespace-nowrap">{String(it.observed)}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {it.status === "match" ? (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-500/20">Match</span>
                        ) : (
                          <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded text-[11px] font-medium border border-red-500/20">Mismatch</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#9AA4B2] whitespace-nowrap">{it.evidence_ids.join(", ") || "—"}</td>
                      <td className="py-3 px-3 font-sans text-[#9AA4B2] text-[11px]">{it.impact_note || "—"}</td>
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
