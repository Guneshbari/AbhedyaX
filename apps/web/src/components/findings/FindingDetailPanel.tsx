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
      <div className="p-8 border-2 border-dashed border-black bg-white shadow-[4px_4px_0px_0px_#000] flex flex-col items-center justify-center text-center h-full min-h-[350px]">
        <ShieldAlert className="w-10 h-10 text-black stroke-[2] mb-3" />
        <h3 className="text-base font-black text-black">
          No Finding Selected
        </h3>
        <p className="text-xs text-zinc-700 max-w-xs mt-1 font-medium">
          Select a finding from the list on the left to inspect detailed cryptographic evidence, impact analysis, and remediation steps.
        </p>
      </div>
    );
  }

  const severityBadgeStyles = {
    Critical: "bg-[#FF4B4B] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
    High: "bg-[#FB923C] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
    Medium: "bg-[#FBBF24] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
    Low: "bg-[#4ADE80] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
    Informational: "bg-white text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
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
    <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-6">
      {/* 1. Header & Badges */}
      <div className="space-y-3 pb-5 border-b-2 border-black">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-black font-black bg-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
              {finding.id}
            </span>
            <span
              className={cn(
                "text-xs px-2.5 py-0.5 font-mono font-black uppercase tracking-wider",
                severityBadgeStyles
              )}
            >
              {finding.severity}
            </span>
            {finding.provenance && (
              <EvidenceBadge source={finding.provenance} />
            )}
            <span className="text-xs px-2.5 py-0.5 bg-[#FAF8F5] border border-black text-black font-mono font-bold shadow-[1px_1px_0px_0px_#000]">
              {finding.category}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-black font-bold">
            <span>Confidence:</span>
            <span className="bg-[#FFE600] px-1.5 py-0.5 border border-black font-black">
              {(finding.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <h3 className="text-xl font-black text-black leading-tight">
          {finding.title}
        </h3>
      </div>

      {/* 2. Why It Matters: Description & Security Impact */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase font-mono tracking-wider text-black flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          <span>Why It Matters & Security Impact</span>
        </h4>
        <p className="text-sm text-black leading-relaxed font-medium">
          {finding.description}
        </p>
        <p className="text-xs text-black leading-relaxed pt-1 bg-[#FEF08A] p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-medium">
          {getImpactExplanation(finding.category, finding.severity)}
        </p>
      </div>

      {/* 3. Inspection Evidence */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase font-mono tracking-wider text-black flex items-center gap-1.5">
          <Terminal className="w-4 h-4 stroke-[2.5]" />
          <span>Observed Evidence & Parameters</span>
        </h4>
        <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1.5 font-mono text-xs">
          {finding.evidence.map((ev, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-black font-black shrink-0">&gt;</span>
              <span className="text-black font-bold leading-relaxed">{ev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recommendation */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase font-mono tracking-wider text-black flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 stroke-[2.5]" />
          <span>Remediation Guidance</span>
        </h4>
        <div className="p-3.5 bg-[#4ADE80] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs text-black leading-relaxed font-bold">
          {finding.recommendation}
        </div>
      </div>

      {/* 5. Standards References */}
      <div className="pt-4 border-t-2 border-black flex items-center justify-between text-xs font-mono font-bold text-black flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
          <span>Compliance Reference:</span>
        </div>
        <span className="bg-[#FAF8F5] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
          {getStandardsReference(finding.category)}
        </span>
      </div>
    </div>
  );
};
