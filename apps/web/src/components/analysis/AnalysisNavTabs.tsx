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
        "flex items-center gap-2.5 border-b-2 sm:border-b-[3px] border-black pb-3 overflow-x-auto",
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
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-black border-2 border-black transition-all select-none shrink-0",
              isActive
                ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                : "bg-white text-black shadow-[2px_2px_0px_0px_#000] hover:bg-zinc-50 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000]"
            )}
          >
            <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 font-mono font-bold border border-black",
                  isActive
                    ? "bg-white text-black shadow-[1px_1px_0px_0px_#000]"
                    : "bg-[#FAF8F5] text-black"
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
