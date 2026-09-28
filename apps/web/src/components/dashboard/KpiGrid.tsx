import React from "react";
import { Activity, ShieldCheck, AlertTriangle, BrainCircuit, LucideIcon } from "lucide-react";
import { KpiMetric } from "@/types/dashboard";
import { MetricCard } from "@/components/ui/MetricCard";

interface KpiGridProps {
  kpis: KpiMetric[];
}

const KPI_ICON_MAP: Record<string, LucideIcon> = {
  "analyses-total": Activity,
  "avg-security-score": ShieldCheck,
  "high-risk-findings": AlertTriangle,
  "ai-confidence": BrainCircuit,
};

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = KPI_ICON_MAP[kpi.id] || Activity;
        return (
          <MetricCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            trendDirection={kpi.trendDirection}
            trendLabel={kpi.trendLabel}
            icon={Icon}
            helperText={kpi.helperText}
          />
        );
      })}
    </div>
  );
};
