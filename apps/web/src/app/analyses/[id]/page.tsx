"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Lock,
  Layers,
  BrainCircuit,
  PlusCircle,
  AlertTriangle,
  Terminal,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecurityScore } from "@/components/ui/SecurityScore";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
import { AnalysisNavTabs } from "@/components/analysis/AnalysisNavTabs";
import { RiskScoreBreakdown } from "@/components/analysis/RiskScoreBreakdown";
import { ValidationStatusCard } from "@/components/analysis/ValidationStatusCard";
import { AssessmentProvenance } from "@/components/analysis/AssessmentProvenance";
import { ReportActions } from "@/components/analysis/ReportActions";
import { EvidenceBadge } from "@/components/analysis/EvidenceBadge";
import { getAnalysisResult } from "@/lib/api/analyses";
import { getPredefinedAnalysis } from "@/data/dashboardData";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AnalysisResultPage() {
  const params = useParams();
  const analysisId = String(params.id);

  const predefined = React.useMemo(
    () => getPredefinedAnalysis(analysisId),
    [analysisId]
  );

  const {
    data: queryResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analysis-result", analysisId],
    queryFn: () => getAnalysisResult(analysisId),
    enabled: Boolean(analysisId),
    retry: 1,
  });

  const result = queryResult || predefined;

  if (isLoading && !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs text-[#9AA4B2] font-mono">
          Loading analysis telemetry for {analysisId}...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 rounded-xl border border-red-500/30 bg-red-500/10 text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <h2 className="text-base font-semibold text-[#F4F7FA]">
          Analysis Result Not Found
        </h2>
        <p className="text-xs text-[#9AA4B2] leading-relaxed">
          {error?.message ||
            `The requested session '${analysisId}' was not found or is still processing.`}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <PrimaryButton variant="secondary" size="sm" href={`/analyses/${analysisId}/processing`}>
            Check Processing Status
          </PrimaryButton>
          <PrimaryButton variant="primary" size="sm" href="/analyze">
            Start New Analysis
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const { security, vpn, cryptography, traffic, findings, summary, source } =
    result;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header with Breadcrumbs & Actions */}
      <PageHeader
        title={`Analysis Overview: ${result.analysis_id}`}
        subtitle={`Evaluated IPsec tunnel session '${source.name}' (${source.type === "simulation" ? "Simulation Benchmark" : "PCAP File"})`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analyses", href: "/analyses" },
          { label: result.analysis_id },
        ]}
        badge={
          result.engine_type === "real" ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real Analysis Engine (TShark)
              </span>
            </div>
          ) : (
            <SimulationModeBadge />
          )
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <ReportActions analysisId={analysisId} variant="compact" />
            <PrimaryButton
              variant="outline"
              size="sm"
              href={`/analyses/${analysisId}/findings`}
              icon={AlertTriangle}
            >
              Findings ({summary.total_findings})
            </PrimaryButton>
            <PrimaryButton
              variant="primary"
              size="sm"
              href="/analyze"
              icon={PlusCircle}
            >
              New Analysis
            </PrimaryButton>
          </div>
        }
      />

      {/* Context Navigation Tabs */}
      <AnalysisNavTabs
        analysisId={analysisId}
        activeTab="overview"
        findingsCount={findings.length}
        confidenceScore={traffic.confidence}
      />

      {/* Capture Telemetry Card (for Real PCAP Analyses) */}
      {result.capture_metadata && (
        <div className="p-4 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#F4F7FA]">
                  {result.capture_metadata.file_name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  TShark Structured Dissection
                </span>
              </div>
              <div className="text-[11px] text-[#687384] font-mono mt-0.5">
                {result.capture_metadata.packet_count} frames dissected • {((result.capture_metadata.file_size_bytes || 0) / 1024).toFixed(1)} KB • {result.capture_metadata.duration_seconds}s capture span
              </div>
            </div>
          </div>

          {result.protocol_observations && (
            <div className="flex items-center gap-4 text-xs font-mono text-[#9AA4B2]">
              <div>
                <span className="text-[#687384]">IKE Handshakes: </span>
                <strong className="text-[#F4F7FA]">{result.protocol_observations.ike_sessions}</strong>
              </div>
              <div>
                <span className="text-[#687384]">ESP Sessions: </span>
                <strong className="text-[#F4F7FA]">{result.protocol_observations.esp_sessions}</strong>
              </div>
              <div>
                <span className="text-[#687384]">NAT-T: </span>
                <strong className={result.protocol_observations.nat_traversal_detected ? "text-emerald-400" : "text-[#687384]"}>
                  {result.protocol_observations.nat_traversal_detected ? "Active (UDP 4500)" : "Inactive"}
                </strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ground Truth Validation Status */}
      {result.validation && (
        <ValidationStatusCard
          validation={result.validation}
          engineType={result.engine_type}
        />
      )}

      {/* 2. Security Hero & Risk Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Security Score Hero Card */}
        <div className="lg:col-span-7 xl:col-span-8 p-6 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#687384]">
                Security Assessment
              </span>
              <RiskBadge level={security.risk_level} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-6">
              <SecurityScore
                score={security.score}
                grade={security.grade}
                size="lg"
                showProgress={false}
              />
              <div className="space-y-1 text-xs text-[#9AA4B2]">
                <div>
                  Posture Evaluation:{" "}
                  <strong className="text-[#F4F7FA]">
                    Grade {security.grade} ({security.risk_level} Risk)
                  </strong>
                </div>
                <div className="text-[11px] text-[#687384]">
                  Deterministic score computed against NIST SP 800-77 Rev. 1 & RFC 8221 rules.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Security Attributes Grid */}
          <div className="pt-4 border-t border-[#252B35] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">Replay Protection</span>
              <span className={security.replay_protection ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                {security.replay_protection ? "Enabled (Anti-Replay Window)" : "Disabled (Vulnerable)"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">SA Lifetime</span>
              <span className="text-[#F4F7FA] font-semibold">
                {security.sa_lifetime_seconds}s ({(security.sa_lifetime_seconds / 3600).toFixed(0)}h)
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#141820] border border-[#252B35] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[#687384] block">Perfect Forward Secrecy</span>
              <span className={cryptography.pfs ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {cryptography.pfs ? "Enforced (Child SA)" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {/* Findings Severity Breakdown Pill Card */}
        <div className="lg:col-span-5 xl:col-span-4 p-6 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#687384]">
                Findings Breakdown
              </span>
              <span className="text-xs font-mono font-bold text-[#F4F7FA]">
                {summary.total_findings} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { label: "Critical", count: summary.critical, color: "text-red-400 bg-red-500/10 border-red-500/25" },
                { label: "High", count: summary.high, color: "text-orange-400 bg-orange-500/10 border-orange-500/25" },
                { label: "Medium", count: summary.medium, color: "text-amber-400 bg-amber-500/10 border-amber-500/25" },
                { label: "Low", count: summary.low, color: "text-blue-400 bg-blue-500/10 border-blue-500/25" },
                { label: "Informational", count: summary.informational, color: "text-[#9AA4B2] bg-[#141820] border-[#252B35]" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#141820]/60 border border-[#252B35]/60 text-xs"
                >
                  <span className="text-[#9AA4B2]">{item.label}</span>
                  <span className={cn("px-2 py-0.5 rounded font-mono font-bold border", item.color)}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 text-[11px] text-[#687384] text-center">
            All rule evaluations are deterministic and evidence-backed.
          </div>
        </div>
      </div>

      {/* Deterministic Risk Scoring Breakdown */}
      <RiskScoreBreakdown
        scoring={result.risk_scoring}
        fallbackScore={security.score}
        fallbackRiskLevel={security.risk_level}
      />

      {/* 3. Protocol & Cryptographic Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VPN Protocol Architecture */}
        <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#252B35]">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-[#F4F7FA]">
              VPN Protocol Configuration
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">Protocol Family</span>
              <span className="text-[#F4F7FA] font-semibold">{vpn.protocol}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">IKE Version</span>
              <span className="text-[#F4F7FA] font-semibold">{vpn.ike_version}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">Encapsulation Mode</span>
              <span className="text-[#F4F7FA] font-semibold">{vpn.mode}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">IP Version</span>
              <span className="text-[#F4F7FA] font-semibold">{vpn.ip_version}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">NAT-Traversal</span>
              <span className={vpn.nat_traversal ? "text-blue-400 font-semibold" : "text-[#9AA4B2]"}>
                {vpn.nat_traversal ? "UDP 4500 (Floated)" : "Direct IP Protocol"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">Protocols Detected</span>
              <span className="text-[#F4F7FA] font-semibold">
                {vpn.protocols_detected.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Transforms */}
        <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#252B35]">
            <Lock className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-[#F4F7FA]">
              Cryptographic Suite & Transforms
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">Encryption Algorithm</span>
              <span className="text-[#F4F7FA] font-semibold truncate block" title={cryptography.encryption}>
                {cryptography.encryption}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">Integrity / Auth</span>
              <span className="text-[#F4F7FA] font-semibold">{cryptography.authentication}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">Diffie-Hellman Group</span>
              <span className="text-[#F4F7FA] font-semibold">{cryptography.dh_group}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35]">
              <span className="text-[10px] text-[#687384] block">PFS Status</span>
              <span className={cryptography.pfs ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {cryptography.pfs ? "PFS Verified" : "PFS Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Traffic Intelligence Card */}
      <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-[#F4F7FA]">
              AI Encrypted Traffic Intelligence
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Zero-Decryption ML Inference
            </span>
            <Link
              href={`/analyses/${analysisId}/traffic`}
              className="text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              Explore AI Traffic &rarr;
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Predicted Class Hero */}
          <div className="p-4 rounded-lg bg-[#141820] border border-[#252B35] text-center space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#687384] tracking-wider">
              Predicted Application Class
            </span>
            <div className="text-2xl font-bold text-[#F4F7FA]">
              {traffic.predicted_class}
            </div>
            <div className="text-xs font-mono text-emerald-400 font-semibold">
              {(traffic.confidence * 100).toFixed(1)}% Confidence
            </div>
          </div>

          {/* Candidate Classes Breakdown */}
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-[#9AA4B2] block">
              Candidate Class Probability Distribution
            </span>
            <div className="space-y-1.5">
              {traffic.candidate_classes.map((cand) => (
                <div key={cand.class} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#F4F7FA]">{cand.class}</span>
                    <span className="text-[#9AA4B2]">{(cand.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#141820] h-1.5 rounded-full overflow-hidden border border-[#252B35]">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${cand.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Vectors */}
        {traffic.features && (
          <div className="pt-3 border-t border-[#252B35] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-[#687384] block text-[10px]">Packet Size Vector</span>
              <span className="text-[#F4F7FA]">
                {traffic.features.packet_size_pattern
                  ? String(traffic.features.packet_size_pattern)
                  : typeof traffic.features.mean_packet_size === "number"
                  ? `${Math.round(traffic.features.mean_packet_size as number)}B avg`
                  : "Standard Variance"}
              </span>
            </div>
            <div>
              <span className="text-[#687384] block text-[10px]">Directionality</span>
              <span className="text-[#F4F7FA]">
                {traffic.features.directionality
                  ? String(traffic.features.directionality)
                  : typeof traffic.features.direction_ratio === "number"
                  ? `${(traffic.features.direction_ratio as number).toFixed(2)} ratio`
                  : "Bidirectional"}
              </span>
            </div>
            <div>
              <span className="text-[#687384] block text-[10px]">Burst Cadence</span>
              <span className="text-[#F4F7FA]">
                {traffic.features.inter_arrival_pattern
                  ? String(traffic.features.inter_arrival_pattern)
                  : typeof traffic.features.burst_rate === "number"
                  ? `${(traffic.features.burst_rate as number).toFixed(1)} bursts/s`
                  : "Continuous Burst"}
              </span>
            </div>
            <div>
              <span className="text-[#687384] block text-[10px]">Session Duration</span>
              <span className="text-[#F4F7FA]">
                {typeof traffic.features.session_duration_seconds === "number"
                  ? `${traffic.features.session_duration_seconds}s`
                  : typeof traffic.features.flow_duration === "number"
                  ? `${Math.round(traffic.features.flow_duration as number)}s`
                  : "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Security Findings Section */}
      <div id="findings" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#F4F7FA]">
              Security Findings & Policy Violations ({findings.length})
            </h3>
            <p className="text-xs text-[#9AA4B2]">
              Deterministic rule evaluations with auditable cryptographic evidence and actionable remediation steps
            </p>
          </div>
          <Link
            href={`/analyses/${analysisId}/findings`}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 self-start sm:self-auto shrink-0"
          >
            Open Investigation Workspace &rarr;
          </Link>
        </div>

        {findings.length === 0 ? (
          <div className="p-8 rounded-xl border border-[#252B35] bg-[#0F1218] text-center text-xs text-[#687384]">
            No vulnerabilities or policy violations detected in this tunnel session.
          </div>
        ) : (
          <div className="space-y-3.5">
            {findings.map((f) => {
              const severityStyles = {
                Critical: "border-red-500/30 bg-red-500/5",
                High: "border-orange-500/30 bg-orange-500/5",
                Medium: "border-amber-500/30 bg-amber-500/5",
                Low: "border-blue-500/30 bg-blue-500/5",
                Informational: "border-[#252B35] bg-[#0F1218]",
              }[f.severity];

              return (
                <div
                  key={f.id}
                  className={cn(
                    "p-5 rounded-xl border space-y-3 transition-colors",
                    severityStyles
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#687384]">{f.id}</span>
                      <span className="text-[#3B4252]">•</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded border border-[#252B35] bg-[#141820] text-[#9AA4B2]">
                        {f.category}
                      </span>
                      <h4 className="text-sm font-semibold text-[#F4F7FA]">
                        {f.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {f.provenance && (
                        <EvidenceBadge source={f.provenance} />
                      )}
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider border",
                          f.severity === "Critical"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : f.severity === "High"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                            : f.severity === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : f.severity === "Low"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-[#141820] text-[#9AA4B2] border-[#252B35]"
                        )}
                      >
                        {f.severity}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#9AA4B2] leading-relaxed">
                    {f.description}
                  </p>

                  {/* Concrete Evidence */}
                  {f.evidence && f.evidence.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#090B10] border border-[#252B35] space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#687384] flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-blue-400" />
                        <span>Inspection Evidence</span>
                      </span>
                      <ul className="text-xs font-mono text-[#F4F7FA] space-y-0.5 list-disc list-inside">
                        {f.evidence.map((ev, i) => (
                          <li key={i} className="text-[#9AA4B2]">
                            <span className="text-[#F4F7FA]">{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Remediation */}
                  <div className="p-3 rounded-lg bg-[#141820]/70 border border-[#252B35] text-xs">
                    <span className="font-semibold text-blue-400">
                      Remediation:{" "}
                    </span>
                    <span className="text-[#F4F7FA]">{f.recommendation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Evidence Provenance Trail */}
      {result.evidence_provenance && result.evidence_provenance.length > 0 && (
        <AssessmentProvenance provenance={result.evidence_provenance} />
      )}

      {/* Automated Reports & Export Actions */}
      <ReportActions analysisId={analysisId} />

      {/* 6. Metadata Footer Card */}
      <div className="p-4 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#687384]">
        <div>
          <span>Engine: AbhedyaX MockAnalysisEngine v0.1 • Mode: </span>
          <span className="text-amber-400">Simulation</span>
        </div>
        <div>
          <span suppressHydrationWarning>Created: {formatDate(result.created_at)}</span>
          {result.completed_at && (
            <span suppressHydrationWarning> • Completed: {formatDate(result.completed_at)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
