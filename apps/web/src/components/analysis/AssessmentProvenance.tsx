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
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-black gap-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 stroke-[2.5]" />
          <h3 className="text-base sm:text-lg font-black text-black">
            Assessment Evidence Provenance
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-black bg-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
          <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{provenance.length} Auditable Data Points</span>
        </div>
      </div>

      <p className="text-xs text-zinc-700 font-medium mb-4 leading-relaxed">
        Every parameter evaluated by AbhedyaX maintains an unbroken evidence trail tracing back to raw wire packets,
        cryptographic proposal payloads, or zero-payload flow metadata inference.
      </p>

      <div className="overflow-x-auto border-2 border-black shadow-[3px_3px_0px_0px_#000]">
        <table className="w-full min-w-[700px] text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-[#FFE600] text-black text-[10px] font-black uppercase">
              <th className="py-2.5 px-3 border-r-2 border-black">Ref ID</th>
              <th className="py-2.5 px-3 border-r-2 border-black">Evaluated Parameter</th>
              <th className="py-2.5 px-3 border-r-2 border-black">Provenance Source</th>
              <th className="py-2.5 px-3 border-r-2 border-black">Extracted Value</th>
              <th className="py-2.5 px-3">Evidence Description</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black font-sans">
            {provenance.map((item) => (
              <tr key={item.id} className="hover:bg-[#FAF8F5] bg-white">
                <td className="py-2.5 px-3 font-mono text-black font-black text-xs border-r-2 border-black whitespace-nowrap">
                  {item.id}
                </td>
                <td className="py-2.5 px-3 font-mono text-black font-bold text-xs border-r-2 border-black whitespace-nowrap">
                  {item.field}
                </td>
                <td className="py-2.5 px-3 border-r-2 border-black whitespace-nowrap">
                  <EvidenceBadge
                    source={item.source_type}
                    confidence={item.confidence}
                  />
                </td>
                <td className="py-2.5 px-3 font-mono text-black border-r-2 border-black whitespace-nowrap">
                  <span className="px-1.5 py-0.5 bg-[#FAF8F5] border border-black font-bold text-black">
                    {item.value}
                  </span>
                  {item.packet_ref && (
                    <span className="block text-[10px] text-zinc-600 font-bold mt-0.5">
                      {item.packet_ref}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-xs text-zinc-800 font-medium">
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2 p-3 bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black text-xs">
        <Info className="w-4 h-4 stroke-[2.5] shrink-0" />
        <span className="font-medium">
          Zero Payload Decryption: Wire-observed evidence is extracted strictly from unencrypted IKE handshake headers and outer IP/ESP headers.
        </span>
      </div>
    </div>
  );
};
