"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, AlertTriangle, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisNavTabsProps {
  analysisId: string;
  activeTab: "overview" | "findings" | "traffic";
  findingsCount?: number;
  confidenceScore?: number;
  className?: string;
}

export const AnalysisNavTabs: React.FC<AnalysisNavTabsProps> = ({
  analysisId,
  activeTab,
  findingsCount,
  confidenceScore,
  className,
}) => {
  const tabs = [
    {
      id: "overview" as const,
      label: "Overview",
      href: `/analyses/${analysisId}`,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "findings" as const,
      label: "Security Findings",
      href: `/analyses/${analysisId}/findings`,
      icon: AlertTriangle,
      badge:
        typeof findingsCount === "number"
          ? `${findingsCount} Findings`
          : undefined,
    },
    {
      id: "traffic" as const,
      label: "Traffic Intelligence",
      href: `/analyses/${analysisId}/traffic`,
      icon: BrainCircuit,
      badge:
        typeof confidenceScore === "number"
          ? `${(confidenceScore * 100).toFixed(0)}% AI`
          : undefined,
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-[#252B35] pb-2 overflow-x-auto",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors select-none shrink-0",
              isActive
                ? "bg-[#141820] text-blue-400 border border-blue-500/30 font-semibold"
                : "text-[#9AA4B2] hover:text-[#F4F7FA] hover:bg-[#141820]/50 border border-transparent"
            )}
          >
            <Icon
              className={cn(
                "w-3.5 h-3.5",
                isActive ? "text-blue-400" : "text-[#687384]"
              )}
            />
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded font-mono",
                  isActive
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-[#090B10] text-[#687384] border border-[#252B35]"
                )}
              >
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
};
