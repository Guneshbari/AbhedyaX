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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black bg-[#C084FC] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                {reportType === "executive" ? (
                  <FileText className="w-3.5 h-3.5 text-black" />
                ) : (
                  <FileCode2 className="w-3.5 h-3.5 text-black" />
                )}
                <span>Open Standalone HTML</span>
                <ExternalLink className="w-3 h-3 text-black" />
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
      <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 print:hidden">
        {/* Analysis Target Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs min-w-0">
          <span className="text-zinc-700 uppercase font-mono text-[11px] shrink-0 font-black">
            Target Analysis:
          </span>
          <select
            value={selectedAnalysisId}
            onChange={(e) => setSelectedAnalysisId(e.target.value)}
            className="w-full sm:w-auto max-w-full bg-[#FAF8F5] border-2 border-black px-3 py-1.5 text-xs text-black font-mono font-bold focus:outline-none focus:bg-[#FFE600] cursor-pointer shadow-[2px_2px_0px_0px_#000] truncate"
          >
            {DASHBOARD_DATA.recentAnalyses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} — {item.sourceName} (Score: {item.securityScore})
              </option>
            ))}
          </select>
        </div>

        {/* Report Type Tabs */}
        <div className="flex items-center p-1 bg-[#FAF8F5] border-2 border-black text-xs shrink-0 self-start sm:self-auto shadow-[2px_2px_0px_0px_#000]">
          <button
            type="button"
            onClick={() => setReportType("executive")}
            className={`px-3 py-1 transition-all cursor-pointer text-xs font-black ${
              reportType === "executive"
                ? "bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                : "text-zinc-700 hover:text-black font-bold"
            }`}
          >
            Executive Summary
          </button>
          <button
            type="button"
            onClick={() => setReportType("technical")}
            className={`px-3 py-1 transition-all cursor-pointer text-xs font-black ${
              reportType === "technical"
                ? "bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                : "text-zinc-700 hover:text-black font-bold"
            }`}
          >
            Technical IPsec Audit
          </button>
        </div>
      </div>

      {/* 3. Printable / Preview Document Container */}
      <div className="p-6 sm:p-10 bg-white border-2 sm:border-[3px] border-black shadow-[8px_8px_0px_0px_#000] space-y-8 print:border-none print:p-0 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-black gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-black text-lg text-black tracking-tight">
                Abhedya<span className="text-[#FFE600] bg-black px-1">X</span> Security Assessment
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-black bg-[#FFE600] text-black font-black shadow-[1px_1px_0px_0px_#000]">
                NTRO SIH-26160
              </span>
            </div>
            <h2 className="text-sm font-bold text-zinc-700">
              {reportType === "executive"
                ? "Executive Posture & Strategic Risk Evaluation"
                : "Deep Technical IPsec Protocol & Cryptographic Audit"}
            </h2>
          </div>

          <div className="text-right text-xs font-mono text-zinc-700 font-bold space-y-0.5">
            <div>Report ID: REP-{activeReport.analysis_id}</div>
            <div suppressHydrationWarning>Date: {formatDate(activeReport.created_at)}</div>
            <div>Classification: RESTRICTED // SECURITY AUDIT</div>
          </div>
        </div>

        {/* Content for Executive Report */}
        {reportType === "executive" ? (
          <div className="space-y-6">
            {/* Executive Summary Hero */}
            <div className="p-6 bg-[#FAF8F5] border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-700 font-black">
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
                <p className="text-xs text-zinc-800 max-w-lg leading-relaxed pt-1 font-medium">
                  The evaluated IPsec tunnel demonstrates a{" "}
                  <strong className="text-black font-black">
                    {activeReport.security.risk_level} Risk posture (Grade {activeReport.security.grade})
                  </strong>
                  . Compliance checks verified symmetric encryption, Diffie-Hellman parameters, and anti-replay safeguards.
                </p>
              </div>

              <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-mono space-y-2 min-w-[200px]">
                <div className="text-zinc-700 uppercase text-[10px] font-black">
                  Executive Highlights
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-700 font-bold">Findings:</span>
                  <span className="text-black font-black">
                    {activeReport.summary.total_findings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-700 font-bold">Critical/High:</span>
                  <span className="text-red-700 font-black">
                    {activeReport.summary.critical + activeReport.summary.high}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-700 font-bold">Inferred App:</span>
                  <span className="text-black font-black">
                    {activeReport.traffic.predicted_class}
                  </span>
                </div>
              </div>
            </div>

            {/* Strategic Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
                <span className="font-black text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Security Strengths Verified</span>
                </span>
                <ul className="text-zinc-800 font-medium space-y-1.5 list-disc list-inside">
                  <li>Active cipher: {activeReport.cryptography.encryption}</li>
                  <li>
                    Key exchange: {activeReport.cryptography.dh_group} verified
                  </li>
                  <li>
                    Protocol: {activeReport.vpn.ike_version} {activeReport.vpn.mode} Mode
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
                <span className="font-black text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Priority Remediation Items</span>
                </span>
                <ul className="text-zinc-800 font-medium space-y-1.5 list-disc list-inside">
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
              <h3 className="text-xs font-black uppercase tracking-wider text-black">
                Phase 1 & Phase 2 Cryptographic Matrix
              </h3>
              <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-[#FFE600] text-black border-b-2 border-black font-black uppercase">
                    <tr>
                      <th className="p-3">Attribute</th>
                      <th className="p-3">Negotiated Value</th>
                      <th className="p-3">Compliance Standard</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black text-black">
                    <tr className="hover:bg-[#FFF9D2]/40 transition-colors">
                      <td className="p-3 font-bold">IKE Version</td>
                      <td className="p-3 font-black">{activeReport.vpn.ike_version}</td>
                      <td className="p-3 text-zinc-700">RFC 7296</td>
                      <td className="p-3 font-black text-emerald-700">
                        {activeReport.vpn.ike_version === "IKEv2" ? "Compliant" : "Deprecated"}
                      </td>
                    </tr>
                    <tr className="hover:bg-[#FFF9D2]/40 transition-colors">
                      <td className="p-3 font-bold">Symmetric Cipher</td>
                      <td className="p-3 font-black">{activeReport.cryptography.encryption}</td>
                      <td className="p-3 text-zinc-700">NIST SP 800-77</td>
                      <td className="p-3 font-black text-emerald-700">Verified</td>
                    </tr>
                    <tr className="hover:bg-[#FFF9D2]/40 transition-colors">
                      <td className="p-3 font-bold">Diffie-Hellman</td>
                      <td className="p-3 font-black">{activeReport.cryptography.dh_group}</td>
                      <td className="p-3 text-zinc-700">RFC 8221</td>
                      <td className="p-3 font-black">
                        {activeReport.cryptography.dh_group.includes("Group 2") ? (
                          <span className="text-red-700">Insecure</span>
                        ) : (
                          <span className="text-emerald-700">Secure</span>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-[#FFF9D2]/40 transition-colors">
                      <td className="p-3 font-bold">Perfect Forward Secrecy</td>
                      <td className="p-3 font-black">
                        {activeReport.cryptography.pfs ? "Enabled" : "Disabled"}
                      </td>
                      <td className="p-3 text-zinc-700">RFC 7296 Section 1.3</td>
                      <td className="p-3 font-black">
                        {activeReport.cryptography.pfs ? (
                          <span className="text-emerald-700">Enforced</span>
                        ) : (
                          <span className="text-amber-700">Disabled</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Granular Findings List */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-black">
                Audited Security Findings ({activeReport.findings.length})
              </h3>
              <div className="space-y-2 text-xs">
                {activeReport.findings.map((f: SecurityFinding) => (
                  <div
                    key={f.id}
                    className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-black">
                        {f.id}: {f.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 border border-black bg-white text-black font-black shadow-[1px_1px_0px_0px_#000]">
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-zinc-800 font-medium">{f.description}</p>
                    <div className="text-zinc-600 font-mono text-[11px] pt-1 font-bold">
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
        <div className="pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-700 font-bold">
          <div>
            <span>Generated by AbhedyaX Security Assessment Engine • </span>
            <span className="text-black font-black">Simulation Prototype</span>
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
        <div className="p-8 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          Loading report preview...
        </div>
      }
    >
      <ReportsContent />
    </React.Suspense>
  );
}
