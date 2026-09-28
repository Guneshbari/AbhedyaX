export type RiskLevel = "Low" | "Moderate" | "Medium" | "High" | "Critical";

export type AnalysisStatus = "completed" | "processing" | "failed" | "warning";

export type SourceType = "pcap" | "simulation" | "live";

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  trendLabel?: string;
  sentiment: "positive" | "negative" | "neutral";
  helperText?: string;
}

export interface SecurityTrendPoint {
  date: string;
  score: number;
  benchmark: number;
  sessionCount: number;
}

export interface RiskDistributionItem {
  category: RiskLevel;
  count: number;
  percentage: number;
  color: string;
  description: string;
}

export interface AnalysisSummary {
  id: string;
  sourceName: string;
  sourceType: SourceType;
  vpnProtocol: string;
  vpnMode: "Tunnel" | "Transport";
  ipVersion: "IPv4" | "IPv6";
  encryption: string;
  authentication: string;
  dhGroup: string;
  pfsEnabled: boolean;
  securityScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  riskLevel: RiskLevel;
  status: AnalysisStatus;
  createdAt: string;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  actionText: string;
  href: string;
  iconName: string;
  badge?: string;
}

export interface DashboardData {
  kpis: KpiMetric[];
  securityTrend: SecurityTrendPoint[];
  riskDistribution: RiskDistributionItem[];
  recentAnalyses: AnalysisSummary[];
  quickActions: QuickActionItem[];
}
