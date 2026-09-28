import React from "react";
import { BookOpen, Scale, ShieldAlert, Lock } from "lucide-react";

export const RiskMethodologyCard: React.FC = () => {
  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] p-5 sm:p-6">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b-2 border-black">
        <BookOpen className="w-5 h-5 stroke-[2.5]" />
        <h3 className="text-base sm:text-lg font-black text-black">
          Auditable Risk Scoring Methodology
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Pillar 1: Deterministic Baseline */}
        <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-black text-black mb-1.5 text-sm">
              <Scale className="w-4 h-4 stroke-[2.5]" />
              <span>Base 100 Deduction Model</span>
            </div>
            <p className="text-zinc-700 leading-relaxed font-medium">
              Every session starts with a baseline score of 100. Quantifiable, non-overlapping penalty deductions are applied strictly when non-compliant transforms or parameters are identified.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t-2 border-black font-mono text-xs font-black text-black">
            Formula: S = max(0, 100 - ∑ D)
          </div>
        </div>

        {/* Pillar 2: Fixed Risk Bands */}
        <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-black text-black mb-1.5 text-sm">
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
              <span>Calibrated Risk Bands</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs font-bold text-black mt-2">
              <div className="flex justify-between items-center bg-white px-2 py-0.5 border border-black">
                <span className="text-emerald-700">Low Risk:</span>
                <span>90 – 100 pts</span>
              </div>
              <div className="flex justify-between items-center bg-white px-2 py-0.5 border border-black">
                <span className="text-amber-700">Moderate Risk:</span>
                <span>75 – 89 pts</span>
              </div>
              <div className="flex justify-between items-center bg-white px-2 py-0.5 border border-black">
                <span className="text-orange-700">High Risk:</span>
                <span>50 – 74 pts</span>
              </div>
              <div className="flex justify-between items-center bg-white px-2 py-0.5 border border-black">
                <span className="text-rose-700">Critical Risk:</span>
                <span>0 – 49 pts</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t-2 border-black text-xs font-mono font-bold text-zinc-600">
            Aligned with NIST SP 800-77
          </div>
        </div>

        {/* Pillar 3: Zero-Payload Guarantee */}
        <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-black text-black mb-1.5 text-sm">
              <Lock className="w-4 h-4 stroke-[2.5]" />
              <span>Zero-Payload Inspection</span>
            </div>
            <p className="text-zinc-700 leading-relaxed font-medium">
              No private keys, user credentials, or inner application payloads are inspected or logged. All risk rules operate entirely on unencrypted outer headers and handshake proposals.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t-2 border-black font-mono text-xs font-black text-black">
            Privacy-Preserving Audit
          </div>
        </div>
      </div>
    </div>
  );
};
