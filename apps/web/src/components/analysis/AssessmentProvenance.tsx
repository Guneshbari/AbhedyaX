import React from "react";
import { EvidenceProvenanceItem } from "@/types/analysis";
import { EvidenceBadge } from "./EvidenceBadge";
import { GitBranch, Shield, Info } from "lucide-react";

interface AssessmentProvenanceProps {
  provenance?: EvidenceProvenanceItem[];
}

export const AssessmentProvenance: React.FC<AssessmentProvenanceProps> = ({
  provenance = [],
}) => {
  if (!provenance || provenance.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">Assessment Evidence Provenance</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>{provenance.length} Auditable Data Points</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Every parameter evaluated by AbhedyaX maintains an unbroken evidence trail tracing back to raw wire packets,
        cryptographic proposal payloads, or zero-payload flow metadata inference.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
              <th className="pb-2 font-medium">Ref ID</th>
              <th className="pb-2 font-medium">Evaluated Parameter</th>
              <th className="pb-2 font-medium">Provenance Source</th>
              <th className="pb-2 font-medium">Extracted Value</th>
              <th className="pb-2 font-medium pl-4">Evidence Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {provenance.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/20">
                <td className="py-2.5 font-mono text-cyan-400 font-medium text-xs">
                  {item.id}
                </td>
                <td className="py-2.5 font-mono text-slate-300 text-xs">
                  {item.field}
                </td>
                <td className="py-2.5">
                  <EvidenceBadge
                    source={item.source_type}
                    confidence={item.confidence}
                  />
                </td>
                <td className="py-2.5 font-mono text-slate-200">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {item.value}
                  </span>
                  {item.packet_ref && (
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {item.packet_ref}
                    </span>
                  )}
                </td>
                <td className="py-2.5 pl-4 text-xs text-slate-400 max-w-xs">
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2 p-2.5 rounded bg-cyan-950/20 border border-cyan-800/30 text-cyan-300 text-xs">
        <Info className="w-4 h-4 shrink-0" />
        <span>
          Zero Payload Decryption: Wire-observed evidence is extracted strictly from unencrypted IKE handshake headers and outer IP/ESP headers.
        </span>
      </div>
    </div>
  );
};
