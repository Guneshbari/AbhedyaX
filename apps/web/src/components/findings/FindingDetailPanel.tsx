import React from "react";
import {
  Terminal,
  ShieldAlert,
  Lightbulb,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SecurityFinding } from "@/types/analysis";
import { EvidenceBadge } from "@/components/analysis/EvidenceBadge";

interface FindingDetailPanelProps {
  finding?: SecurityFinding | null;
}

export const FindingDetailPanel: React.FC<FindingDetailPanelProps> = ({
  finding,
}) => {
  if (!finding) {
    return (
      <div className="p-8 rounded-xl border border-dashed border-[#252B35] bg-[#0F1218]/50 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
        <ShieldAlert className="w-8 h-8 text-[#687384] mb-2" />
        <h3 className="text-sm font-semibold text-[#F4F7FA]">
          No Finding Selected
        </h3>
        <p className="text-xs text-[#9AA4B2] max-w-xs mt-1">
          Select a finding from the list on the left to inspect detailed cryptographic evidence, impact analysis, and remediation steps.
        </p>
      </div>
    );
  }

  const severityBadgeStyles = {
    Critical: "bg-red-500/10 text-red-400 border-red-500/30",
    High: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    Informational: "bg-[#141820] text-[#9AA4B2] border-[#252B35]",
  }[finding.severity];

  const getImpactExplanation = (cat: string, sev: string) => {
    switch (cat) {
      case "Key Exchange":
        return "Compromised or legacy Diffie-Hellman parameters enable offline or precomputation cryptanalysis (such as Logjam-class attacks), potentially allowing adversaries with captured traffic to compute session keys and retroactively decrypt communications.";
      case "Authentication":
        return "Weak or truncated hash/MAC algorithms (such as MD5 or SHA-1) reduce collision resistance below cryptographically acceptable thresholds, opening the tunnel negotiation to impersonation or man-in-the-middle packet forgery.";
      case "PFS":
        return "Without Perfect Forward Secrecy, compromise of the long-term private key or initial IKE SA key allows an adversary to retrospectively decrypt all historical Child SAs established under this session.";
      case "Replay Protection":
        return "Disabling the anti-replay window prevents the IPsec stack from rejecting duplicate sequence numbers, allowing an active network attacker to re-inject captured encrypted packets and manipulate application state.";
      case "Metadata Exposure":
        return "Packet length variance, burst cadences, and payload size entropy can expose side-channel information regarding the nature of encrypted flows, facilitating traffic fingerprinting and website/VoIP identification.";
      case "Protocol":
        return "Legacy protocol versions (such as IKEv1) lack modern renegotiation protections, have asymmetric negotiation vulnerabilities, and are officially deprecated across federal and international standards.";
      default:
        return sev === "Critical" || sev === "High"
          ? "This configuration deviates significantly from recommended cryptographic baselines and exposes the tunnel to cryptanalytic or state-level exploitation."
          : "This configuration adheres to baseline requirements or represents an operational trade-off that should be audited regularly.";
    }
  };

  const getStandardsReference = (cat: string) => {
    switch (cat) {
      case "Key Exchange":
        return "NIST SP 800-77 Rev. 1 (Section 4.1.2) & RFC 8221 (Section 4)";
      case "Authentication":
        return "NIST SP 800-131A Rev. 2 & RFC 8221 (Section 5)";
      case "PFS":
        return "RFC 7296 (Internet Key Exchange Protocol Version 2 - Section 1.3)";
      case "Replay Protection":
        return "RFC 4303 (IP Encapsulating Security Payload - Section 3.4.3)";
      case "Metadata Exposure":
        return "ANSSI IPsec Configuration Guidelines & IETF draft-ietf-ipsecme-iptfs";
      case "Protocol":
        return "RFC 8247 (Algorithm Implementation Requirements and Usage Guidance for IKEv2)";
      default:
        return "NIST SP 800-77 Rev. 1: Guide to IPsec VPNs";
    }
  };

  return (
    <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-6">
      {/* 1. Header & Badges */}
      <div className="space-y-3 pb-5 border-b border-[#252B35]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#687384] font-semibold">
              {finding.id}
            </span>
            <span className="text-[#3B4252]">•</span>
            <span
              className={cn(
                "text-xs px-2.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider border",
                severityBadgeStyles
              )}
            >
              {finding.severity}
            </span>
            {finding.provenance && (
              <EvidenceBadge source={finding.provenance} />
            )}
            <span className="text-xs px-2.5 py-0.5 rounded bg-[#141820] border border-[#252B35] text-[#9AA4B2] font-mono">
              {finding.category}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#9AA4B2]">
            <span>Confidence:</span>
            <span className="text-blue-400 font-bold">
              {(finding.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-[#F4F7FA] leading-tight">
          {finding.title}
        </h3>
      </div>

      {/* 2. Why It Matters: Description & Security Impact */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#687384] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Why It Matters & Security Impact</span>
        </h4>
        <p className="text-xs text-[#F4F7FA] leading-relaxed">
          {finding.description}
        </p>
        <p className="text-xs text-[#9AA4B2] leading-relaxed pt-1 bg-[#141820]/50 p-3 rounded-lg border border-[#252B35]/60">
          {getImpactExplanation(finding.category, finding.severity)}
        </p>
      </div>

      {/* 3. Inspection Evidence */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#687384] flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>Observed Evidence & Parameters</span>
        </h4>
        <div className="p-3.5 rounded-lg bg-[#090B10] border border-[#252B35] space-y-1.5 font-mono text-xs">
          {finding.evidence.map((ev, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-blue-500 shrink-0 font-bold">&gt;</span>
              <span className="text-[#F4F7FA] leading-relaxed">{ev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recommendation */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#687384] flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
          <span>Remediation Guidance</span>
        </h4>
        <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-[#F4F7FA] leading-relaxed">
          {finding.recommendation}
        </div>
      </div>

      {/* 5. Standards References */}
      <div className="pt-4 border-t border-[#252B35] flex items-center justify-between text-[11px] font-mono text-[#687384]">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#687384]" />
          <span>Compliance Reference:</span>
        </div>
        <span className="text-[#9AA4B2]">
          {getStandardsReference(finding.category)}
        </span>
      </div>
    </div>
  );
};
