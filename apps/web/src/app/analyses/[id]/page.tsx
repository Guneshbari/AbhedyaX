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
import { AuditableReasoningPanel } from "@/components/analysis/AuditableReasoningPanel";
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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-3 font-mono">
        <div className="w-8 h-8 rounded-full border-4 border-black border-t-[#FFE600] animate-spin" />
        <p className="text-xs text-black font-bold">
          Loading analysis telemetry for {analysisId}...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000] text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-[#FF4B4B] stroke-[2.5] mx-auto" />
        <h2 className="text-xl font-black text-black">
          Analysis Result Not Found
        </h2>
        <p className="text-xs text-zinc-700 font-medium leading-relaxed">
          {error?.message ||
            `The requested session '${analysisId}' was not found or is still processing.`}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
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
              <span className="px-2.5 py-1 text-xs font-mono font-black border-2 border-black bg-[#4ADE80] text-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
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
        <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#4ADE80] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
              <Terminal className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-black">
                  {result.capture_metadata.file_name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#FFE600] text-black border border-black font-bold uppercase">
                  TShark Structured Dissection
                </span>
              </div>
              <div className="text-xs text-zinc-700 font-mono font-bold mt-0.5">
                {result.capture_metadata.packet_count} frames dissected • {((result.capture_metadata.file_size_bytes || 0) / 1024).toFixed(1)} KB • {result.capture_metadata.duration_seconds}s capture span
              </div>
            </div>
          </div>

          {result.protocol_observations && (
            <div className="flex items-center gap-4 text-xs font-mono font-bold text-black flex-wrap">
              <div>
                <span className="text-zinc-600">IKE Handshakes: </span>
                <strong className="text-black bg-[#FAF8F5] px-1 border border-black">{result.protocol_observations.ike_sessions}</strong>
              </div>
              <div>
                <span className="text-zinc-600">ESP Sessions: </span>
                <strong className="text-black bg-[#FAF8F5] px-1 border border-black">{result.protocol_observations.esp_sessions}</strong>
              </div>
              <div>
                <span className="text-zinc-600">NAT-T: </span>
                <strong className={result.protocol_observations.nat_traversal_detected ? "text-black bg-[#4ADE80] px-1 border border-black" : "text-zinc-600"}>
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
        <div className="lg:col-span-7 xl:col-span-8 p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-zinc-600">
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
              <div className="space-y-1 text-xs text-black">
                <div className="font-bold">
                  Posture Evaluation:{" "}
                  <strong className="text-black bg-[#FFE600] px-1.5 py-0.5 border border-black">
                    Grade {security.grade} ({security.risk_level} Risk)
                  </strong>
                </div>
                <div className="text-[11px] text-zinc-600 font-medium">
                  Deterministic score computed against NIST SP 800-77 Rev. 1 & RFC 8221 rules.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Security Attributes Grid */}
          <div className="pt-4 border-t-2 border-black grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">Replay Protection</span>
              <span className={security.replay_protection ? "text-emerald-700 font-black" : "text-[#FF4B4B] font-black"}>
                {security.replay_protection ? "Enabled (Anti-Replay)" : "Disabled (Vulnerable)"}
              </span>
            </div>
            <div className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">SA Lifetime</span>
              <span className="text-black font-black">
                {security.sa_lifetime_seconds}s ({(security.sa_lifetime_seconds / 3600).toFixed(0)}h)
              </span>
            </div>
            <div className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">Forward Secrecy</span>
              <span className={cryptography.pfs ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                {cryptography.pfs ? "Enforced (Child SA)" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {/* Findings Severity Breakdown Card */}
        <div className="lg:col-span-5 xl:col-span-4 p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-zinc-600">
                Findings Breakdown
              </span>
              <span className="text-xs font-mono font-black text-black bg-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                {summary.total_findings} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { label: "Critical", count: summary.critical, color: "bg-[#FF4B4B] text-black" },
                { label: "High", count: summary.high, color: "bg-[#FB923C] text-black" },
                { label: "Medium", count: summary.medium, color: "bg-[#FBBF24] text-black" },
                { label: "Low", count: summary.low, color: "bg-[#4ADE80] text-black" },
                { label: "Informational", count: summary.informational, color: "bg-white text-black" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-2 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-mono"
                >
                  <span className="text-black font-bold">{item.label}</span>
                  <span className={cn("px-2 py-0.5 font-bold border border-black shadow-[1px_1px_0px_0px_#000]", item.color)}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 text-[11px] text-zinc-600 font-mono font-bold text-center">
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

      {/* USP-03: Auditable Security Reasoning Chain */}
      <AuditableReasoningPanel analysisId={analysisId} />

      {/* 3. Protocol & Cryptographic Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VPN Protocol Architecture */}
        <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
            <Layers className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-black text-black">
              VPN Protocol Configuration
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">Protocol Family</span>
              <span className="text-black font-black">{vpn.protocol}</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">IKE Version</span>
              <span className="text-black font-black">{vpn.ike_version}</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">Encapsulation Mode</span>
              <span className="text-black font-black">{vpn.mode}</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">IP Version</span>
              <span className="text-black font-black">{vpn.ip_version}</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">NAT-Traversal</span>
              <span className="text-black font-black">
                {vpn.nat_traversal ? "UDP 4500 (Floated)" : "Direct IP Protocol"}
              </span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">Protocols Detected</span>
              <span className="text-black font-black">
                {vpn.protocols_detected.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Transforms */}
        <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
            <Lock className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-black text-black">
              Cryptographic Suite & Transforms
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">Encryption Algorithm</span>
              <span className="text-black font-black truncate block" title={cryptography.encryption}>
                {cryptography.encryption}
              </span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">Integrity / Auth</span>
              <span className="text-black font-black">{cryptography.authentication}</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">Diffie-Hellman Group</span>
              <span className="text-black font-black">{cryptography.dh_group}</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold">PFS Status</span>
              <span className={cryptography.pfs ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                {cryptography.pfs ? "PFS Verified" : "PFS Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Traffic Intelligence Card */}
      <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-5 h-5 stroke-[2.5]" />
            <h3 className="text-base font-black text-black">
              AI Encrypted Traffic Intelligence
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 bg-[#FFE600] text-black border border-black font-black uppercase shadow-[1px_1px_0px_0px_#000]">
              Zero-Decryption ML Inference
            </span>
            <Link
              href={`/analyses/${analysisId}/traffic`}
              className="text-xs font-mono font-black text-black hover:bg-[#FFE600] px-2 py-1 border border-black shadow-[1px_1px_0px_0px_#000] transition-colors"
            >
              Explore AI Traffic &rarr;
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Predicted Class Hero */}
          <div className="p-5 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-center space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-600 font-black tracking-wider">
              Predicted Application Class
            </span>
            <div className="text-2xl sm:text-3xl font-black text-black">
              {traffic.predicted_class}
            </div>
            <div className="text-xs font-mono text-emerald-700 font-black">
              {(traffic.confidence * 100).toFixed(1)}% Confidence
            </div>
          </div>

          {/* Candidate Classes Breakdown */}
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-mono font-bold text-zinc-700 block uppercase">
              Candidate Class Probability Distribution
            </span>
            <div className="space-y-2">
              {traffic.candidate_classes.map((cand) => (
                <div key={cand.class} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-black">{cand.class}</span>
                    <span className="text-zinc-700">{(cand.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white h-2.5 border-2 border-black overflow-hidden shadow-[1px_1px_0px_0px_#000]">
                    <div
                      className="h-full bg-[#FFE600] border-r-2 border-black"
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
          <div className="pt-3 border-t-2 border-black grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <span className="text-zinc-600 block text-[10px] font-bold uppercase">Packet Size Vector</span>
              <span className="text-black font-black">
                {traffic.features.packet_size_pattern
                  ? String(traffic.features.packet_size_pattern)
                  : typeof traffic.features.mean_packet_size === "number"
                  ? `${Math.round(traffic.features.mean_packet_size as number)}B avg`
                  : "Standard Variance"}
              </span>
            </div>
            <div className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <span className="text-zinc-600 block text-[10px] font-bold uppercase">Directionality</span>
              <span className="text-black font-black">
                {traffic.features.directionality
                  ? String(traffic.features.directionality)
                  : typeof traffic.features.direction_ratio === "number"
                  ? `${(traffic.features.direction_ratio as number).toFixed(2)} ratio`
                  : "Bidirectional"}
              </span>
            </div>
            <div className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <span className="text-zinc-600 block text-[10px] font-bold uppercase">Burst Cadence</span>
              <span className="text-black font-black">
                {traffic.features.inter_arrival_pattern
                  ? String(traffic.features.inter_arrival_pattern)
                  : typeof traffic.features.burst_rate === "number"
                  ? `${(traffic.features.burst_rate as number).toFixed(1)} bursts/s`
                  : "Continuous Burst"}
              </span>
            </div>
            <div className="p-2.5 bg-[#FAF8F5] border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
              <span className="text-zinc-600 block text-[10px] font-bold uppercase">Session Duration</span>
              <span className="text-black font-black">
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
            <h3 className="text-base sm:text-lg font-black tracking-tight text-black">
              Security Findings & Policy Violations ({findings.length})
            </h3>
            <p className="text-xs text-zinc-700 font-medium">
              Deterministic rule evaluations with auditable cryptographic evidence and actionable remediation steps
            </p>
          </div>
          <Link
            href={`/analyses/${analysisId}/findings`}
            className="text-xs font-mono font-black text-black hover:bg-[#FFE600] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] self-start sm:self-auto shrink-0 transition-colors"
          >
            Open Investigation Workspace &rarr;
          </Link>
        </div>

        {findings.length === 0 ? (
          <div className="p-8 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] text-center text-xs font-mono font-bold text-zinc-600">
            No vulnerabilities or policy violations detected in this tunnel session.
          </div>
        ) : (
          <div className="space-y-3.5">
            {findings.map((f) => {
              const severityStyles = {
                Critical: "bg-[#FF4B4B]/10 border-2 border-black shadow-[4px_4px_0px_0px_#000]",
                High: "bg-[#FB923C]/10 border-2 border-black shadow-[4px_4px_0px_0px_#000]",
                Medium: "bg-[#FBBF24]/10 border-2 border-black shadow-[4px_4px_0px_0px_#000]",
                Low: "bg-[#4ADE80]/10 border-2 border-black shadow-[4px_4px_0px_0px_#000]",
                Informational: "bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]",
              }[f.severity];

              return (
                <div
                  key={f.id}
                  className={cn(
                    "p-5 space-y-3 transition-all",
                    severityStyles
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-black font-black bg-white px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                        {f.id}
                      </span>
                      <span className="text-black font-black">•</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 border border-black bg-white text-black shadow-[1px_1px_0px_0px_#000]">
                        {f.category}
                      </span>
                      <h4 className="text-sm font-black text-black">
                        {f.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {f.provenance && (
                        <EvidenceBadge source={f.provenance} />
                      )}
                      <span
                        className={cn(
                          "text-xs px-2.5 py-0.5 font-mono font-black uppercase tracking-wider border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
                          f.severity === "Critical"
                            ? "bg-[#FF4B4B] text-black"
                            : f.severity === "High"
                            ? "bg-[#FB923C] text-black"
                            : f.severity === "Medium"
                            ? "bg-[#FBBF24] text-black"
                            : f.severity === "Low"
                            ? "bg-[#4ADE80] text-black"
                            : "bg-white text-black"
                        )}
                      >
                        {f.severity}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-black leading-relaxed font-medium">
                    {f.description}
                  </p>

                  {/* Concrete Evidence */}
                  {f.evidence && f.evidence.length > 0 && (
                    <div className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1">
                      <span className="text-[10px] font-mono uppercase text-black font-black flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Inspection Evidence</span>
                      </span>
                      <ul className="text-xs font-mono text-black space-y-0.5 list-disc list-inside">
                        {f.evidence.map((ev, i) => (
                          <li key={i} className="text-zinc-800 font-bold">
                            <span className="text-black">{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Remediation */}
                  <div className="p-3 bg-[#4ADE80] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs">
                    <span className="font-black text-black font-mono uppercase">
                      Remediation:{" "}
                    </span>
                    <span className="text-black font-medium">{f.recommendation}</span>
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
      <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono font-bold text-black">
        <div>
          <span>Engine: AbhedyaX MockAnalysisEngine v0.1 • Mode: </span>
          <span className="bg-[#FFE600] px-1 border border-black">Simulation</span>
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
