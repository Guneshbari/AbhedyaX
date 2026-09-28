"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
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
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/security-twin"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Security Twin Overview</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/compare?current=${analysisId}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compare Drift</span>
            </Link>
            <Link
              href={`/analyses/${analysisId}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Analysis Dossier</span>
            </Link>
          </div>
        </div>

        <PageHeader
          title={`Security Twin: ${analysisId}`}
          subtitle="Detailed alignment breakdown between intended enterprise VPN policy and extracted wire observations."
        />

        {loading ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Loading Security Twin for {analysisId}...
          </div>
        ) : !twin ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Security Twin unavailable for {analysisId}.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Posture Card */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white tracking-tight">
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
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-400 font-mono">
                  <span>Provenance: <strong className="text-neutral-200">{twin.provenance.observed_state}</strong></span>
                  <span>•</span>
                  <span>Mode: <strong className="text-neutral-200 capitalize">{twin.mode}</strong></span>
                  <span>•</span>
                  <span>Mismatches: <strong className="text-neutral-200">{twin.alignment.mismatched_count}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-neutral-400">Canonical Score</div>
                  <div className="flex items-center gap-2 mt-1">
                    <SecurityScore score={twin.security_impact.risk_score} size="md" />
                    <RiskBadge level={twin.security_impact.risk as RiskLevel} />
                  </div>
                </div>
              </div>
            </div>

            {/* Side-by-side states */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Expected Policy Baseline</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {twin.provenance.expected_state}
                  </span>
                </div>
                <dl className="mt-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <dt className="text-neutral-500">IKE Protocol</dt>
                    <dd className="text-neutral-200">{twin.expected_state.ike_version}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <dt className="text-neutral-500">Encryption</dt>
                    <dd className="text-neutral-200">{twin.expected_state.encryption}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <dt className="text-neutral-500">Diffie-Hellman</dt>
                    <dd className="text-neutral-200">{twin.expected_state.dh_group}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <dt className="text-neutral-500">Forward Secrecy</dt>
                    <dd className="text-emerald-400">PFS Enabled</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <dt className="text-neutral-500">Replay Protection</dt>
                    <dd className="text-emerald-400">Active Window</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-neutral-500">SA Lifetime</dt>
                    <dd className="text-neutral-200">{twin.expected_state.sa_lifetime}s</dd>
                  </div>
                </dl>
              </div>

              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">Observed Session State</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {twin.provenance.observed_state}
                  </span>
                </div>
                <dl className="mt-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <dt className="text-neutral-500">IKE Protocol</dt>
                    <dd className="text-neutral-200">{twin.observed_state.ike_version}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <dt className="text-neutral-500">Encryption</dt>
                    <dd className="text-neutral-200">{twin.observed_state.encryption}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <dt className="text-neutral-500">Diffie-Hellman</dt>
                    <dd className="text-neutral-200">{twin.observed_state.dh_group}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <dt className="text-neutral-500">Forward Secrecy</dt>
                    <dd className={twin.observed_state.pfs ? "text-emerald-400" : "text-amber-400"}>
                      {twin.observed_state.pfs ? "PFS Enabled" : "PFS Disabled"}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800/40">
                    <dt className="text-neutral-500">Replay Protection</dt>
                    <dd className={twin.observed_state.replay_protection ? "text-emerald-400" : "text-red-400"}>
                      {twin.observed_state.replay_protection ? "Active Window" : "Disabled (Vulnerable)"}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-neutral-500">SA Lifetime</dt>
                    <dd className="text-neutral-200">{twin.observed_state.sa_lifetime}s</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Matrix */}
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60">
              <h3 className="text-sm font-semibold text-white mb-4">Evidence Alignment Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-950 text-neutral-400 text-[10px] uppercase border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-3">Property</th>
                      <th className="py-2.5 px-3">Expected</th>
                      <th className="py-2.5 px-3">Observed</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Evidence Ref</th>
                      <th className="py-2.5 px-3">Impact Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {twin.alignment.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-medium text-white">{it.property}</td>
                        <td className="py-2.5 px-3 text-neutral-300">{String(it.expected)}</td>
                        <td className="py-2.5 px-3 text-neutral-300">{String(it.observed)}</td>
                        <td className="py-2.5 px-3">
                          {it.status === "match" ? (
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">Match</span>
                          ) : (
                            <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded text-[11px]">Mismatch</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-400">{it.evidence_ids.join(", ") || "—"}</td>
                        <td className="py-2.5 px-3 font-sans text-neutral-300 text-[11px]">{it.impact_note || "—"}</td>
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
