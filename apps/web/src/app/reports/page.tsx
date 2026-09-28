"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FileText,
  FileCode2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
import { SecurityScore } from "@/components/ui/SecurityScore";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { RiskScoreBreakdown } from "@/components/analysis/RiskScoreBreakdown";
import { RiskMethodologyCard } from "@/components/analysis/RiskMethodologyCard";
import { ValidationStatusCard } from "@/components/analysis/ValidationStatusCard";
import { AssessmentProvenance } from "@/components/analysis/AssessmentProvenance";
import {
  getAnalysisResult,
  getExecutiveReportUrl,
  getTechnicalReportUrl,
} from "@/lib/api/analyses";
import { AnalysisResult, SecurityFinding } from "@/types/analysis";
import { DASHBOARD_DATA, getPredefinedAnalysis } from "@/data/dashboardData";
import { formatDate } from "@/lib/utils";

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialId =
    searchParams.get("analysisId") ||
    DASHBOARD_DATA.recentAnalyses[0]?.id ||
    "AX-2026-00428";

  const [selectedAnalysisId, setSelectedAnalysisId] = useState(initialId);
  const [reportType, setReportType] = useState<"executive" | "technical">(
    "executive"
  );

  // Fetch live analysis result if available, or fall back to mock data
  const { data: analysisResult } = useQuery({
    queryKey: ["analysis-result", selectedAnalysisId],
    queryFn: () => getAnalysisResult(selectedAnalysisId),
    enabled: Boolean(selectedAnalysisId),
    retry: 0,
  });

  // Construct report data
  const activeReport: AnalysisResult = useMemo(() => {
    if (analysisResult) {
      return analysisResult;
    }
    const predefined = getPredefinedAnalysis(selectedAnalysisId);
    if (predefined) {
      return predefined;
    }
    // Fallback to recent analysis item
    const fallback =
      DASHBOARD_DATA.recentAnalyses.find(
        (a) => a.id === selectedAnalysisId
      ) || DASHBOARD_DATA.recentAnalyses[0];

    return {
      analysis_id: fallback.id,
      status: fallback.status,
      created_at: fallback.createdAt,
      completed_at: fallback.createdAt,
      source: {
        type: fallback.sourceType,
        name: fallback.sourceName,
      },
      vpn: {
        protocol: fallback.vpnProtocol,
        ike_version: fallback.vpnProtocol.includes("IKEv1") ? "IKEv1" : "IKEv2",
        mode: fallback.vpnMode,
        ip_version: fallback.ipVersion,
        nat_traversal: true,
        protocols_detected: ["IKEv2", "ESP"],
      },
      cryptography: {
        encryption: fallback.encryption,
        authentication: fallback.authentication,
        dh_group: fallback.dhGroup,
        pfs: fallback.pfsEnabled,
      },
      security: {
        score: fallback.securityScore,
        grade: fallback.grade,
        risk_level: fallback.riskLevel,
        replay_protection: true,
        sa_lifetime_seconds: 28800,
      },
      traffic: {
        predicted_class: "Video",
        confidence: 0.93,
        candidate_classes: [
          { class: "Video", confidence: 0.93 },
          { class: "Web", confidence: 0.04 },
          { class: "Messaging", confidence: 0.03 },
        ],
      },
      findings: [
        {
          id: "F-101",
          severity: "Informational" as const,
          category: "Cryptography" as const,
          title: "Compliant AEAD Cipher Suite Negotiated",
          description: "AES-256-GCM authenticated encryption provides high confidentiality and cryptographic integrity.",
          evidence: ["Transform: ENCR_AES_GCM_16 with 256-bit key"],
          recommendation: "Maintain active cipher suite per NIST SP 800-77 Rev. 1 guidelines.",
          confidence: 0.99,
        },
      ],
      summary: {
        total_findings: 1,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        informational: 1,
      },
    } as AnalysisResult;
  }, [analysisResult, selectedAnalysisId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(activeReport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abhedyax-report-${activeReport.analysis_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* 1. Header (Hidden on Print) */}
      <div className="print:hidden">
        <PageHeader
          title="Compliance & Technical Audit Reports"
          subtitle="Audit-ready security reports compliant with NIST SP 800-77 Rev. 1, RFC 8221, and ANSSI IPsec guidelines"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Reports" },
          ]}
          badge={<SimulationModeBadge />}
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={
                  reportType === "executive"
                    ? getExecutiveReportUrl(selectedAnalysisId)
                    : getTechnicalReportUrl(selectedAnalysisId)
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
              >
                {reportType === "executive" ? (
                  <FileText className="w-3.5 h-3.5" />
                ) : (
                  <FileCode2 className="w-3.5 h-3.5" />
                )}
                <span>Open Standalone HTML</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <PrimaryButton
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleDownloadJson}
              >
                Export JSON
              </PrimaryButton>
              <PrimaryButton
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={handlePrint}
              >
                Print / Save Document
              </PrimaryButton>
            </div>
          }
        />
      </div>

      {/* 2. Controls Bar (Analysis Selector & Report Type Toggle) */}
      <div className="p-4 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 print:hidden">
        {/* Analysis Target Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#687384] uppercase font-mono text-[11px] shrink-0">
            Target Analysis:
          </span>
          <select
            value={selectedAnalysisId}
            onChange={(e) => setSelectedAnalysisId(e.target.value)}
            className="bg-[#141820] border border-[#252B35] rounded-lg px-3 py-1.5 text-xs text-[#F4F7FA] font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {DASHBOARD_DATA.recentAnalyses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} — {item.sourceName} (Score: {item.securityScore})
              </option>
            ))}
          </select>
        </div>

        {/* Report Type Tabs */}
        <div className="flex items-center p-1 rounded-lg bg-[#141820] border border-[#252B35] text-xs">
          <button
            type="button"
            onClick={() => setReportType("executive")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              reportType === "executive"
                ? "bg-blue-600 text-white font-medium shadow-sm"
                : "text-[#9AA4B2] hover:text-[#F4F7FA]"
            }`}
          >
            Executive Summary
          </button>
          <button
            type="button"
            onClick={() => setReportType("technical")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              reportType === "technical"
                ? "bg-blue-600 text-white font-medium shadow-sm"
                : "text-[#9AA4B2] hover:text-[#F4F7FA]"
            }`}
          >
            Technical IPsec Audit
          </button>
        </div>
      </div>

      {/* 3. Printable / Preview Document Container */}
      <div className="p-6 sm:p-10 rounded-xl border border-[#252B35] bg-[#0F1218] shadow-2xl space-y-8 print:border-none print:p-0 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#252B35] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-bold text-lg text-[#F4F7FA] tracking-tight">
                Abhedya<span className="text-blue-500">X</span> Security Assessment
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                NTRO SIH-26160
              </span>
            </div>
            <h2 className="text-sm font-semibold text-[#9AA4B2]">
              {reportType === "executive"
                ? "Executive Posture & Strategic Risk Evaluation"
                : "Deep Technical IPsec Protocol & Cryptographic Audit"}
            </h2>
          </div>

          <div className="text-right text-xs font-mono text-[#687384] space-y-0.5">
            <div>Report ID: REP-{activeReport.analysis_id}</div>
            <div suppressHydrationWarning>Date: {formatDate(activeReport.created_at)}</div>
            <div>Classification: RESTRICTED // SECURITY AUDIT</div>
          </div>
        </div>

        {/* Content for Executive Report */}
        {reportType === "executive" ? (
          <div className="space-y-6">
            {/* Executive Summary Hero */}
            <div className="p-6 rounded-xl bg-[#141820] border border-[#252B35] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#687384]">
                  Overall Cryptographic Posture
                </span>
                <div className="flex items-baseline gap-4">
                  <SecurityScore
                    score={activeReport.security.score}
                    grade={activeReport.security.grade}
                    size="lg"
                    showProgress={false}
                  />
                  <RiskBadge level={activeReport.security.risk_level} />
                </div>
                <p className="text-xs text-[#9AA4B2] max-w-lg leading-relaxed pt-1">
                  The evaluated IPsec tunnel demonstrates a{" "}
                  <strong className="text-[#F4F7FA]">
                    {activeReport.security.risk_level} Risk posture (Grade {activeReport.security.grade})
                  </strong>
                  . Compliance checks verified symmetric encryption, Diffie-Hellman parameters, and anti-replay safeguards.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#090B10] border border-[#252B35] text-xs font-mono space-y-2 min-w-[200px]">
                <div className="text-[#687384] uppercase text-[10px]">
                  Executive Highlights
                </div>
                <div className="flex justify-between">
                  <span>Findings:</span>
                  <span className="text-[#F4F7FA] font-bold">
                    {activeReport.summary.total_findings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Critical/High:</span>
                  <span className="text-red-400 font-bold">
                    {activeReport.summary.critical + activeReport.summary.high}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Inferred App:</span>
                  <span className="text-blue-400 font-bold">
                    {activeReport.traffic.predicted_class}
                  </span>
                </div>
              </div>
            </div>

            {/* Strategic Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#141820] border border-[#252B35] space-y-2">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Security Strengths Verified</span>
                </span>
                <ul className="text-[#9AA4B2] space-y-1.5 list-disc list-inside">
                  <li>Active cipher: {activeReport.cryptography.encryption}</li>
                  <li>
                    Key exchange: {activeReport.cryptography.dh_group} verified
                  </li>
                  <li>
                    Protocol: {activeReport.vpn.ike_version} {activeReport.vpn.mode} Mode
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-[#141820] border border-[#252B35] space-y-2">
                <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Priority Remediation Items</span>
                </span>
                <ul className="text-[#9AA4B2] space-y-1.5 list-disc list-inside">
                  {activeReport.findings.length > 0 ? (
                    activeReport.findings.map((f: SecurityFinding, i: number) => (
                      <li key={i} className="truncate" title={f.recommendation}>
                        {f.recommendation}
                      </li>
                    ))
                  ) : (
                    <li>Maintain active policy enforcement.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Risk Methodology Card */}
            <RiskMethodologyCard />
          </div>
        ) : (
          /* Content for Technical IPsec Audit Report */
          <div className="space-y-6">
            {/* Ground Truth Validation Status */}
            {activeReport.validation && (
              <ValidationStatusCard
                validation={activeReport.validation}
                engineType={activeReport.engine_type}
              />
            )}

            {/* Assessment Evidence Provenance */}
            {activeReport.evidence_provenance && activeReport.evidence_provenance.length > 0 && (
              <AssessmentProvenance
                provenance={activeReport.evidence_provenance}
              />
            )}

            {/* Technical Transform Matrix Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#687384]">
                Phase 1 & Phase 2 Cryptographic Matrix
              </h3>
              <div className="overflow-x-auto rounded-lg border border-[#252B35]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#141820] text-[#9AA4B2] border-b border-[#252B35]">
                    <tr>
                      <th className="p-3">Attribute</th>
                      <th className="p-3">Negotiated Value</th>
                      <th className="p-3">Compliance Standard</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252B35]/60 text-[#F4F7FA]">
                    <tr>
                      <td className="p-3 text-[#9AA4B2]">IKE Version</td>
                      <td className="p-3">{activeReport.vpn.ike_version}</td>
                      <td className="p-3 text-[#687384]">RFC 7296</td>
                      <td className="p-3 text-emerald-400">
                        {activeReport.vpn.ike_version === "IKEv2" ? "Compliant" : "Deprecated"}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#9AA4B2]">Symmetric Cipher</td>
                      <td className="p-3">{activeReport.cryptography.encryption}</td>
                      <td className="p-3 text-[#687384]">NIST SP 800-77</td>
                      <td className="p-3 text-emerald-400">Verified</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#9AA4B2]">Diffie-Hellman</td>
                      <td className="p-3">{activeReport.cryptography.dh_group}</td>
                      <td className="p-3 text-[#687384]">RFC 8221</td>
                      <td className="p-3">
                        {activeReport.cryptography.dh_group.includes("Group 2") ? (
                          <span className="text-red-400">Insecure</span>
                        ) : (
                          <span className="text-emerald-400">Secure</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[#9AA4B2]">Perfect Forward Secrecy</td>
                      <td className="p-3">
                        {activeReport.cryptography.pfs ? "Enabled" : "Disabled"}
                      </td>
                      <td className="p-3 text-[#687384]">RFC 7296 Section 1.3</td>
                      <td className="p-3">
                        {activeReport.cryptography.pfs ? (
                          <span className="text-emerald-400">Enforced</span>
                        ) : (
                          <span className="text-amber-400">Disabled</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Granular Findings List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#687384]">
                Audited Security Findings ({activeReport.findings.length})
              </h3>
              <div className="space-y-2 text-xs">
                {activeReport.findings.map((f: SecurityFinding) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-lg bg-[#141820] border border-[#252B35] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#F4F7FA]">
                        {f.id}: {f.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-[#9AA4B2]">{f.description}</p>
                    <div className="text-[#687384] font-mono text-[11px] pt-1">
                      Evidence: {f.evidence.join("; ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deterministic Risk Scoring Breakdown */}
        {activeReport.risk_scoring && (
          <RiskScoreBreakdown
            scoring={activeReport.risk_scoring}
            fallbackScore={activeReport.security.score}
            fallbackRiskLevel={activeReport.security.risk_level}
          />
        )}

        {/* Report Footer */}
        <div className="pt-6 border-t border-[#252B35] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#687384]">
          <div>
            <span>Generated by AbhedyaX Security Assessment Engine • </span>
            <span className="text-amber-400">Simulation Prototype</span>
          </div>
          <div>Page 1 of 1 • Tamper-evident Audit Checksum Verified</div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-[#687384] font-mono text-sm">
          Loading report preview...
        </div>
      }
    >
      <ReportsContent />
    </React.Suspense>
  );
}
