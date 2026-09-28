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
    label: "Testbed",
    route: "/testbed",
    iconName: "Network",
    description: "strongSwan network namespace testbed",
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
    label: "Settings",
    route: "/settings",
    iconName: "Settings",
    description: "Cryptographic policies & engine config",
  },
];
