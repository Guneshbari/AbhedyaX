import React from "react";
import { PlusCircle, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface DashboardHeaderProps {
  onAnalyzeClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  return (
    <PageHeader
      title="IPsec Security Operations Dashboard"
      subtitle="Real-time cryptographic posture, protocol inspection, and encrypted traffic analytics across monitored VPN sessions."
      badge={
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4ADE80] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono font-bold text-xs uppercase">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Active Monitoring</span>
        </span>
      }
      actions={
        <div className="flex items-center gap-2.5 flex-wrap">
          <PrimaryButton
            variant="secondary"
            size="sm"
            href="/analyze?mode=simulation"
            icon={Sparkles}
          >
            Quick Simulation
          </PrimaryButton>
          <PrimaryButton
            variant="primary"
            size="sm"
            href="/analyze"
            icon={PlusCircle}
          >
            Analyze New Capture
          </PrimaryButton>
        </div>
      }
    />
  );
};
