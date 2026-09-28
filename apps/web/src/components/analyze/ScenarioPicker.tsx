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
          <h2 className="text-base font-black tracking-tight text-black">
            Select Simulation Scenario
          </h2>
          <p className="text-xs text-zinc-700 font-medium">
            Choose an RFC benchmark profile to execute deterministic cryptographic audits
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-black bg-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
          {scenarios.length} Scenarios Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scen) => {
          const isSelected = selectedScenarioId === scen.id;

          return (
            <button
              type="button"
              key={scen.id}
              onClick={() => onSelectScenario(scen.id)}
              className={cn(
                "p-4 border-2 border-black text-left transition-all duration-100 cursor-pointer flex flex-col justify-between relative",
                isSelected
                  ? "bg-[#FFE600] shadow-[5px_5px_0px_0px_#000] translate-x-[-2px] translate-y-[-2px]"
                  : "bg-white shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000]"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <RiskBadge level={scen.security.risk_level} />
                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-mono font-black text-black bg-white px-2 py-0.5 border border-black">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      <span>SELECTED</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-black text-black mt-2 mb-1">
                  {scen.name}
                </h3>
                <p className="text-xs text-zinc-800 line-clamp-2 leading-relaxed mb-3 font-medium">
                  {scen.description}
                </p>
              </div>

              {/* Specs Pills */}
              <div className="pt-3 border-t-2 border-black grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] font-mono">
                <div>
                  <span className="text-zinc-600 font-bold">Protocol: </span>
                  <span className="text-black font-black">{scen.vpn.ike_version}</span>
                </div>
                <div>
                  <span className="text-zinc-600 font-bold">Cipher: </span>
                  <span className="text-black font-black truncate block" title={scen.cryptography.encryption}>
                    {scen.cryptography.encryption}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-600 font-bold">DH Group: </span>
                  <span className="text-black font-black">{scen.cryptography.dh_group}</span>
                </div>
                <div>
                  <span className="text-zinc-600 font-bold">PFS: </span>
                  <span
                    className={
                      scen.cryptography.pfs ? "text-emerald-700 font-black" : "text-amber-700 font-black"
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
