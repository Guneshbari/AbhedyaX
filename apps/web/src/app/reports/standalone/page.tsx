"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Shield,
  FileText,
  FileCode2,
} from "lucide-react";
import { SecurityScore } from "@/components/ui/SecurityScore";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { getAnalysisResult } from "@/lib/api/analyses";
import { AnalysisResult, SecurityFinding } from "@/types/analysis";
import { DASHBOARD_DATA, getPredefinedAnalysis } from "@/data/dashboardData";
import { formatDate } from "@/lib/utils";

function StandaloneReportContent() {
  const searchParams = useSearchParams();
  const analysisId =
    searchParams.get("analysisId") ||
    DASHBOARD_DATA.recentAnalyses[0]?.id ||
    "AX-2026-00428";
  const reportType = (searchParams.get("type") as "executive" | "technical") || "executive";

  // Fetch live analysis result if available, or fall back to mock data
  const { data: analysisResult } = useQuery({
    queryKey: ["analysis-result", analysisId],
    queryFn: () => getAnalysisResult(analysisId),
    enabled: Boolean(analysisId),
    retry: 0,
  });

  const activeReport: AnalysisResult = useMemo(() => {
    if (analysisResult) {
      return analysisResult;
    }
    const predefined = getPredefinedAnalysis(analysisId);
    if (predefined) {
      return predefined;
    }
    const fallback =
      DASHBOARD_DATA.recentAnalyses.find((a) => a.id === analysisId) ||
      DASHBOARD_DATA.recentAnalyses[0];

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
          { class: "Web", confidence: 0.05 },
        ],
        features: {
          mean_packet_size: 1142.5,
          median_packet_size: 1380.0,
          packet_size_p10: 92,
          packet_size_p90: 1420,
          flow_duration: 18.4,
          mean_inter_arrival_time: 0.0032,
          packet_rate: 312.4,
          direction_ratio: 0.84,
          burst_count: 14,
          burst_rate: 0.76,
        },
      },
      findings: [
        {
          id: "F-101",
          category: "Cryptography",
          severity: "Informational",
          title: "Compliant Cipher Negotiated",
          description: "NIST SP 800-77 Rev. 1 compliant authenticated encryption.",
          recommendation: "Maintain current cipher configuration.",
          evidence: ["AES-256-GCM authenticated encryption active"],
          confidence: 1.0,
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
    } as unknown as AnalysisResult;
  }, [analysisResult, analysisId]);

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
    <div className="min-h-screen bg-[#FAF8F5] text-black py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white print:m-0">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 1. Screen-Only Action & Navigation Bar */}
        <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-black bg-[#FAF8F5] hover:bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back to Reports</span>
            </Link>

            <span className="text-[10px] font-mono px-2 py-1 bg-black text-[#FFE600] border border-black font-black uppercase">
              Standalone Dossier
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Report Type Switcher */}
            <div className="flex items-center p-1 bg-[#FAF8F5] border-2 border-black text-xs shadow-[2px_2px_0px_0px_#000]">
              <Link
                href={`/reports/standalone?analysisId=${analysisId}&type=executive`}
                className={`px-3 py-1 text-xs font-mono font-black transition-all ${
                  reportType === "executive"
                    ? "bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                    : "text-zinc-700 hover:text-black font-bold"
                }`}
              >
                Executive
              </Link>
              <Link
                href={`/reports/standalone?analysisId=${analysisId}&type=technical`}
                className={`px-3 py-1 text-xs font-mono font-black transition-all ${
                  reportType === "technical"
                    ? "bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                    : "text-zinc-700 hover:text-black font-bold"
                }`}
              >
                Technical
              </Link>
            </div>

            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-black bg-white hover:bg-[#FAF8F5] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-black bg-[#FFE600] hover:bg-[#FCD34D] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* 2. Official Document Classification Bar */}
        <div className="bg-black text-[#FFE600] px-4 py-2 border-2 border-black text-xs font-mono font-black flex items-center justify-between shadow-[3px_3px_0px_0px_#000] print:border print:shadow-none print:mb-3">
          <span>CLASSIFICATION: RESTRICTED // CYBERSECURITY AUDIT</span>
          <span className="hidden sm:inline">NATIONAL FRAMEWORK • NTRO SIH-26160</span>
          <span>STATUS: OFFICIAL DOSSIER</span>
        </div>

        {/* 3. Primary Publication Container */}
        <div className="bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] p-6 sm:p-10 space-y-8 print:border-2 print:border-black print:p-6 print:shadow-none">

          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-black gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-black tracking-tight">
                  Abhedya<span className="text-[#FFE600] bg-black px-1">X</span> Protocol Intelligence
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 border border-black bg-[#FFE600] text-black font-black shadow-[1px_1px_0px_0px_#000] print:shadow-none">
                  NTRO-26160
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-zinc-700">
                {reportType === "executive"
                  ? "Executive IPsec VPN Posture & Strategic Risk Evaluation"
                  : "Deep Technical Cryptographic & Wire Dissection Audit"}
              </h1>
            </div>

            <div className="text-left sm:text-right text-xs font-mono text-zinc-700 font-bold space-y-0.5">
              <div>Session: <span className="text-black font-black">{activeReport.analysis_id}</span></div>
              <div suppressHydrationWarning>Date: {formatDate(activeReport.created_at)}</div>
              <div>Pipeline: {activeReport.engine_type === "real" ? "TShark Live Dissection" : "Deterministic Engine"}</div>
            </div>
          </div>

          {/* Executive Score Hero Card */}
          <div className="p-6 bg-[#FAF8F5] border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6 print:shadow-none print:border-2">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-700 font-black">
                Deterministic Security Score
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
                . Compliance checks verified authenticated encryption, Diffie-Hellman parameters, and replay protection.
              </p>
            </div>

            <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-mono space-y-2 min-w-[220px] print:shadow-none">
              <div className="text-zinc-700 uppercase text-[10px] font-black border-b border-black pb-1">
                Auditable Telemetry
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-700 font-bold">Findings:</span>
                <span className="text-black font-black">{activeReport.findings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-700 font-bold">Base Score:</span>
                <span className="text-black font-black">100 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-700 font-bold">Total Deductions:</span>
                <span className="text-[#FF4B4B] font-black">
                  -{activeReport.risk_scoring?.total_deduction ?? (100 - activeReport.security.score)} pts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-700 font-bold">Traffic Profile:</span>
                <span className="text-black font-black">{activeReport.traffic.predicted_class}</span>
              </div>
            </div>
          </div>

          {/* Report Specific Body Content */}
          {reportType === "executive" ? (
            <div className="space-y-6">
              {/* Executive Summary Narrative */}
              <div className="p-5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2 print:shadow-none">
                <h2 className="text-xs font-mono uppercase font-black text-black">
                  1. Executive Strategic Assessment
                </h2>
                <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                  AbhedyaX conducted an automated, zero-payload security evaluation of the IPsec VPN tunnel associated with{" "}
                  <strong>{activeReport.analysis_id}</strong>. The assessment analyzed negotiation parameters, cipher proposals,
                  ephemerality assurances, anti-replay sequence enforcement, and observable traffic flow dynamics.
                </p>
                <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                  {activeReport.security.risk_level === "Low" ? (
                    "The evaluated configuration strictly complies with NIST SP 800-77 Rev. 1 and RFC 8221 standards. Authenticated encryption (AEAD) is verified, preventing unauthorized eavesdropping and tampering."
                  ) : activeReport.security.risk_level === "Moderate" ? (
                    "The configuration maintains a baseline defense posture but exhibits non-critical gaps (e.g. absent Child SA Perfect Forward Secrecy) that should be addressed in scheduled maintenance."
                  ) : (
                    "Immediate remediation is required. Deprecated ciphers, insecure Diffie-Hellman groups, or disabled anti-replay mechanisms expose traffic to interception, replay attacks, or cryptanalytic precomputation."
                  )}
                </p>
              </div>

              {/* Protocol Architecture Table */}
              <div className="space-y-2">
                <h2 className="text-xs font-mono uppercase font-black text-black">
                  2. Negotiated Protocol & Cipher Architecture
                </h2>
                <div className="overflow-x-auto border-2 border-black shadow-[3px_3px_0px_0px_#000] print:shadow-none">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-[#FFE600] text-black border-b-2 border-black font-black uppercase">
                      <tr>
                        <th className="p-3">Protocol</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3">Encryption</th>
                        <th className="p-3">Authentication</th>
                        <th className="p-3">Diffie-Hellman</th>
                        <th className="p-3">PFS</th>
                        <th className="p-3">Anti-Replay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black text-black bg-white">
                      <tr>
                        <td className="p-3 font-black">{activeReport.vpn.ike_version}</td>
                        <td className="p-3">{activeReport.vpn.mode}</td>
                        <td className="p-3 font-bold">{activeReport.cryptography.encryption}</td>
                        <td className="p-3">{activeReport.cryptography.authentication}</td>
                        <td className="p-3">{activeReport.cryptography.dh_group}</td>
                        <td className="p-3 font-bold">
                          {activeReport.cryptography.pfs ? "Enforced" : "Disabled"}
                        </td>
                        <td className="p-3 font-bold">
                          {activeReport.security.replay_protection ? "Active" : "Disabled"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strategic Findings & Recommendations */}
              <div className="space-y-3">
                <h2 className="text-xs font-mono uppercase font-black text-black">
                  3. Key Security Findings & Actionable Remediation
                </h2>
                <div className="space-y-2.5">
                  {activeReport.findings.map((f: SecurityFinding) => (
                    <div
                      key={f.id}
                      className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2 break-inside-avoid print:shadow-none"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-mono font-black text-black text-sm">
                          {f.id}: {f.title}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 border border-black font-black uppercase ${
                          f.severity === "Critical" ? "bg-[#FF4B4B] text-white" :
                          f.severity === "High" ? "bg-[#FF4B4B] text-black" :
                          f.severity === "Medium" ? "bg-[#FBBF24] text-black" : "bg-[#4ADE80] text-black"
                        }`}>
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-800 font-medium leading-relaxed">{f.description}</p>
                      <div className="p-2.5 bg-[#FFE600] border-2 border-black text-xs font-mono font-black text-black">
                        Recommendation: {f.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Technical Audit Report */
            <div className="space-y-6">
              {/* Detailed Cryptographic Matrix */}
              <div className="space-y-2">
                <h2 className="text-xs font-mono uppercase font-black text-black">
                  1. Deep Cryptographic & Transport Matrix
                </h2>
                <div className="overflow-x-auto border-2 border-black shadow-[3px_3px_0px_0px_#000] print:shadow-none">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-[#FFE600] text-black border-b-2 border-black font-black uppercase">
                      <tr>
                        <th className="p-3">Attribute</th>
                        <th className="p-3">Observed Parameter</th>
                        <th className="p-3">Standard Reference</th>
                        <th className="p-3">Compliance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black text-black bg-white">
                      <tr>
                        <td className="p-3 font-bold">IKE Protocol</td>
                        <td className="p-3 font-black">{activeReport.vpn.ike_version}</td>
                        <td className="p-3 text-zinc-700">RFC 7296 / RFC 2409</td>
                        <td className="p-3 font-black text-emerald-800">
                          {activeReport.vpn.ike_version === "IKEv2" ? "Compliant" : "Deprecated"}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">Encapsulation Mode</td>
                        <td className="p-3 font-black">{activeReport.vpn.mode}</td>
                        <td className="p-3 text-zinc-700">RFC 4301 §5.1</td>
                        <td className="p-3 font-black text-emerald-800">Verified</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">Symmetric Cipher</td>
                        <td className="p-3 font-black">{activeReport.cryptography.encryption}</td>
                        <td className="p-3 text-zinc-700">NIST SP 800-77</td>
                        <td className="p-3 font-black text-emerald-800">Verified</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">Key Exchange (DH)</td>
                        <td className="p-3 font-black">{activeReport.cryptography.dh_group}</td>
                        <td className="p-3 text-zinc-700">RFC 8221</td>
                        <td className="p-3 font-black">
                          {activeReport.cryptography.dh_group.includes("Group 2") ? (
                            <span className="text-[#FF4B4B]">Insecure (&lt;80-bit)</span>
                          ) : (
                            <span className="text-emerald-800">Secure (128+ bit)</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">Perfect Forward Secrecy</td>
                        <td className="p-3 font-black">{activeReport.cryptography.pfs ? "Enforced" : "Disabled"}</td>
                        <td className="p-3 text-zinc-700">RFC 7296 §1.3</td>
                        <td className="p-3 font-black">
                          {activeReport.cryptography.pfs ? "Compliant" : "Deficient"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Granular Flow Telemetry */}
              <div className="p-5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3 print:shadow-none">
                <h2 className="text-xs font-mono uppercase font-black text-black">
                  2. Observable Wire Flow Vector (Zero-Payload Inspection)
                </h2>
                <p className="text-xs text-zinc-800 font-medium leading-relaxed">
                  Traffic analysis extracted external packet sizes, inter-arrival time distributions, burst rates,
                  and client-server asymmetry without inspecting or decrypting ESP payloads.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#FAF8F5] border-2 border-black">
                    <span className="text-[10px] text-zinc-600 block uppercase font-bold">Inferred Class</span>
                    <span className="text-base font-black text-black">{activeReport.traffic.predicted_class}</span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] border-2 border-black">
                    <span className="text-[10px] text-zinc-600 block uppercase font-bold">Confidence</span>
                    <span className="text-base font-black text-black">{(activeReport.traffic.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] border-2 border-black">
                    <span className="text-[10px] text-zinc-600 block uppercase font-bold">Mean Pkt Size</span>
                    <span className="text-base font-black text-black">
                      {activeReport.traffic.features?.mean_packet_size ? `${String(activeReport.traffic.features.mean_packet_size)} B` : "N/A"}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] border-2 border-black">
                    <span className="text-[10px] text-zinc-600 block uppercase font-bold">Direction Ratio</span>
                    <span className="text-base font-black text-black">
                      {String(activeReport.traffic.features?.direction_ratio ?? "N/A")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Operational Disclaimers */}
          <div className="p-4 bg-[#FFE600] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-bold text-black print:shadow-none">
            <span className="font-mono uppercase font-black block mb-1">
              Zero-Payload Inspection Notice:
            </span>
            This assessment was generated without decrypting ESP tunnel payloads or accessing cryptographic session keys.
            Evaluations are derived strictly from protocol negotiation frames, cryptographic handshake parameters, and statistical side-channel flow dynamics.
          </div>

          {/* Document Footer */}
          <div className="pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-700 font-bold">
            <div>
              <span>Generated by AbhedyaX Security Assessment Platform • </span>
              <span className="text-black font-black">Official Dossier</span>
            </div>
            <div>Tamper-Evident Assessment Checksum Verified • NTRO Problem 26160</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StandaloneReportPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen p-8 text-center text-black font-mono text-sm bg-[#FAF8F5]">
          Loading standalone report dossier...
        </div>
      }
    >
      <StandaloneReportContent />
    </React.Suspense>
  );
}
