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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/25">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Monitoring</span>
        </span>
      }
      actions={
        <div className="flex items-center gap-2.5">
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
