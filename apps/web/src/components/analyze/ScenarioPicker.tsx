import React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { ScenarioDefinition } from "@/types/analysis";

interface ScenarioPickerProps {
  scenarios: ScenarioDefinition[];
  selectedScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
}

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[#F4F7FA]">
            Select Simulation Scenario
          </h2>
          <p className="text-xs text-[#9AA4B2]">
            Choose an RFC benchmark profile to execute deterministic cryptographic audits
          </p>
        </div>
        <span className="text-xs font-mono text-[#687384]">5 Scenarios Available</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {scenarios.map((scen) => {
          const isSelected = selectedScenarioId === scen.id;

          return (
            <button
              type="button"
              key={scen.id}
              onClick={() => onSelectScenario(scen.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between relative",
                isSelected
                  ? "bg-[#141820] border-blue-500 shadow-sm ring-1 ring-blue-500/30"
                  : "bg-[#0F1218] border-[#252B35] hover:border-[#3B4252] hover:bg-[#141820]/40"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <RiskBadge level={scen.security.risk_level} />
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-blue-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Selected</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-[#F4F7FA] mt-1 mb-1">
                  {scen.name}
                </h3>
                <p className="text-xs text-[#9AA4B2] line-clamp-2 leading-relaxed mb-3">
                  {scen.description}
                </p>
              </div>

              {/* Specs Pills */}
              <div className="pt-3 border-t border-[#252B35]/70 grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] font-mono">
                <div>
                  <span className="text-[#687384]">Protocol: </span>
                  <span className="text-[#F4F7FA]">{scen.vpn.ike_version}</span>
                </div>
                <div>
                  <span className="text-[#687384]">Cipher: </span>
                  <span className="text-[#F4F7FA] truncate block" title={scen.cryptography.encryption}>
                    {scen.cryptography.encryption}
                  </span>
                </div>
                <div>
                  <span className="text-[#687384]">DH Group: </span>
                  <span className="text-[#F4F7FA]">{scen.cryptography.dh_group}</span>
                </div>
                <div>
                  <span className="text-[#687384]">PFS: </span>
                  <span
                    className={
                      scen.cryptography.pfs ? "text-emerald-400" : "text-amber-400"
                    }
                  >
                    {scen.cryptography.pfs ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
