/**
 * Canonical Dashboard Fixtures for AbhedyaX Demo Provider.
 * Deterministic aggregates derived from the six canonical scenario analyses.
 */

import {
  DashboardData,
  AnalysisSummary,
  KpiMetric,
  RiskDistributionItem,
  SecurityTrendPoint,
  QuickActionItem,
} from "@/types/dashboard";
import { CANONICAL_ANALYSES_LIST } from "./analyses";

export const CANONICAL_RECENT_ANALYSES: AnalysisSummary[] = CANONICAL_ANALYSES_LIST.map((a) => ({
  id: a.analysis_id,
  sourceName: a.source.file_name || a.source.name,
  sourceType: a.source.type,
  vpnProtocol: a.vpn.ike_version,
  vpnMode: (a.vpn.mode === "Transport" ? "Transport" : "Tunnel") as "Tunnel" | "Transport",
  ipVersion: (a.vpn.ip_version === "IPv6" ? "IPv6" : "IPv4") as "IPv4" | "IPv6",
  encryption: a.cryptography.encryption,
  authentication: a.cryptography.authentication,
  dhGroup: a.cryptography.dh_group,
  pfsEnabled: a.cryptography.pfs,
  securityScore: a.security.score,
  grade: a.security.grade,
  riskLevel: a.security.risk_level,
  status: a.security.score >= 90 ? "completed" : a.security.score >= 50 ? "warning" : "failed",
  createdAt: a.created_at,
}));

export const DEMO_KPIS: KpiMetric[] = [
  {
    id: "analyses-total",
    label: "Analyses",
    value: "6",
    trend: "+12.4%",
    trendDirection: "up",
    trendLabel: "vs previous week",
    sentiment: "positive",
    helperText: "Total VPN sessions inspected",
  },
  {
    id: "avg-security-score",
    label: "Average Security Score",
    value: "83/100",
    trend: "+5.2%",
    trendDirection: "up",
    trendLabel: "improved posture",
    sentiment: "positive",
    helperText: "Deterministic RFC/NIST compliance",
  },
  {
    id: "high-risk-findings",
    label: "High Risk Findings",
    value: "7",
    trend: "-18%",
    trendDirection: "down",
    trendLabel: "mitigated vulnerabilities",
    sentiment: "positive",
    helperText: "PFS, weak ciphers, or replay flaws",
  },
  {
    id: "ai-confidence",
    label: "AI Classification Confidence",
    value: "84.8%",
    trend: "+3.7%",
    trendDirection: "up",
    trendLabel: "on encrypted flows",
    sentiment: "positive",
    helperText: "Statistical payload inference score",
  },
];

export const DEMO_SECURITY_TREND: SecurityTrendPoint[] = [
  { date: "Sep 18", score: 76, benchmark: 80, sessionCount: 12 },
  { date: "Sep 19", score: 79, benchmark: 80, sessionCount: 14 },
  { date: "Sep 20", score: 78, benchmark: 80, sessionCount: 11 },
  { date: "Sep 21", score: 82, benchmark: 80, sessionCount: 16 },
  { date: "Sep 22", score: 81, benchmark: 80, sessionCount: 15 },
  { date: "Sep 23", score: 85, benchmark: 80, sessionCount: 18 },
  { date: "Sep 24", score: 83, benchmark: 80, sessionCount: 13 },
  { date: "Sep 25", score: 87, benchmark: 80, sessionCount: 20 },
  { date: "Sep 26", score: 86, benchmark: 80, sessionCount: 17 },
  { date: "Sep 27", score: 89, benchmark: 80, sessionCount: 22 },
  { date: "Sep 28", score: 83, benchmark: 80, sessionCount: 19 },
];

export const DEMO_RISK_DISTRIBUTION: RiskDistributionItem[] = [
  {
    category: "Low",
    count: 4,
    percentage: 67,
    color: "#22C55E",
    description: "Compliant with NIST SP 800-77 & RFC 8221",
  },
  {
    category: "Moderate",
    count: 1,
    percentage: 17,
    color: "#3B82F6",
    description: "Moderate parameters or disabled PFS",
  },
  {
    category: "High",
    count: 0,
    percentage: 0,
    color: "#F59E0B",
    description: "Substandard DH groups or legacy transforms",
  },
  {
    category: "Critical",
    count: 1,
    percentage: 17,
    color: "#EF4444",
    description: "Deprecated ciphers (AES-CBC/SHA1) or cleartext IKE",
  },
];

export const DEMO_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "action-analyze-pcap",
    title: "Analyze PCAP",
    description: "Upload Wireshark / tcpdump capture file for deep protocol decoding",
    actionText: "Upload & Decode",
    href: "/analyze?mode=pcap",
    iconName: "UploadCloud",
    badge: "Fast Inspection",
  },
  {
    id: "action-run-simulation",
    title: "Run Simulation",
    description: "Execute a standardized RFC benchmark scenario with zero configuration",
    actionText: "Select Scenario",
    href: "/analyze?mode=simulation",
    iconName: "PlayCircle",
    badge: "Instant Demo",
  },
  {
    id: "action-open-testbed",
    title: "Open Testbed",
    description: "Inspect active strongSwan tunnels in Linux network namespaces",
    actionText: "View Topology",
    href: "/testbed",
    iconName: "Network",
    badge: "strongSwan 5.9",
  },
];

export const CANONICAL_DASHBOARD_DATA: DashboardData = {
  kpis: DEMO_KPIS,
  recentAnalyses: CANONICAL_RECENT_ANALYSES,
  securityTrend: DEMO_SECURITY_TREND,
  riskDistribution: DEMO_RISK_DISTRIBUTION,
  quickActions: DEMO_QUICK_ACTIONS,
};
