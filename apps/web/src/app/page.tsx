import React from "react";
import { DASHBOARD_DATA } from "@/data/dashboardData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UspShowcaseBanner } from "@/components/dashboard/UspShowcaseBanner";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { SecurityTrendChart } from "@/components/dashboard/SecurityTrendChart";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Title, Status, and Actions */}
      <DashboardHeader />

      {/* AbhedyaX Phase 6 USP Layer Showcase */}
      <UspShowcaseBanner />

      {/* KPI Summary Cards */}
      <KpiGrid kpis={DASHBOARD_DATA.kpis} />

      {/* Primary Analytics Section: Trends & Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <SecurityTrendChart data={DASHBOARD_DATA.securityTrend} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <RiskDistributionChart data={DASHBOARD_DATA.riskDistribution} />
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <QuickActions actions={DASHBOARD_DATA.quickActions} />

      {/* Recent Analyses Telemetry Table */}
      <RecentAnalysesTable analyses={DASHBOARD_DATA.recentAnalyses} />
    </div>
  );
}
