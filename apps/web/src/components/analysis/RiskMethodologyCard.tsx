import React from "react";
import { BookOpen, Scale, ShieldAlert, Lock } from "lucide-react";

export const RiskMethodologyCard: React.FC = () => {
  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-lg p-5">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
        <BookOpen className="w-5 h-5 text-indigo-400" />
        <h3 className="text-base font-semibold text-white">Auditable Risk Scoring Methodology</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Pillar 1: Deterministic Baseline */}
        <div className="p-3 rounded bg-[#070d1e] border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1.5">
              <Scale className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Base 100 Deduction Model</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Every session starts with a baseline score of 100. Quantifiable, non-overlapping penalty deductions are applied strictly when non-compliant transforms or parameters are identified.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[11px] text-slate-400">
            Formula: S = max(0, 100 - ∑ D)
          </div>
        </div>

        {/* Pillar 2: Fixed Risk Bands */}
        <div className="p-3 rounded bg-[#070d1e] border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Calibrated Risk Bands</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-emerald-400">Low Risk:</span>
                <span>90 – 100 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400">Moderate Risk:</span>
                <span>75 – 89 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-400">High Risk:</span>
                <span>50 – 74 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-400">Critical Risk:</span>
                <span>0 – 49 pts</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Aligned with NIST SP 800-77
          </div>
        </div>

        {/* Pillar 3: Zero-Payload Guarantee */}
        <div className="p-3 rounded bg-[#070d1e] border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Zero-Payload Inspection</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              No private keys, user credentials, or inner application payloads are inspected or logged. All risk rules operate entirely on unencrypted outer headers and handshake proposals.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[11px] text-cyan-400">
            Privacy-Preserving Audit
          </div>
        </div>
      </div>
    </div>
  );
};
