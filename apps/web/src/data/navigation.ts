import { NavItem } from "@/types/navigation";

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    route: "/",
    iconName: "LayoutDashboard",
    description: "Executive posture & operational summary",
  },
  {
    label: "Analyze",
    route: "/analyze",
    iconName: "ShieldAlert",
    description: "Inspect PCAP capture or run scenario",
    badge: "Active",
  },
  {
    label: "Analyses",
    route: "/analyses",
    iconName: "Files",
    description: "Historical repository of inspected sessions",
  },
  {
    label: "Security Twin",
    route: "/security-twin",
    iconName: "ShieldCheck",
    description: "Intended vs observed state alignment",
    badge: "USP",
  },
  {
    label: "Compare",
    route: "/compare",
    iconName: "GitCompare",
    description: "Configuration drift & baseline deltas",
    badge: "USP",
  },
  {
    label: "Posture",
    route: "/posture",
    iconName: "TrendingUp",
    description: "Longitudinal security timeline & trends",
    badge: "USP",
  },
  {
    label: "Metadata Exposure",
    route: "/metadata-exposure",
    iconName: "Eye",
    description: "Zero-payload flow observability indicators",
    badge: "USP",
  },
  {
    label: "AI Intelligence",
    route: "/ai-intelligence",
    iconName: "BrainCircuit",
    description: "Encrypted traffic classification models",
  },
  {
    label: "Reports",
    route: "/reports",
    iconName: "FileText",
    description: "Executive compliance & technical audits",
  },
  {
    label: "Testbed",
    route: "/testbed",
    iconName: "Network",
    description: "strongSwan network namespace testbed",
  },
  {
    label: "Settings",
    route: "/settings",
    iconName: "Settings",
    description: "Cryptographic policies & engine config",
  },
];
