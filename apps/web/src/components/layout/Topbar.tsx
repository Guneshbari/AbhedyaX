"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
import { NAVIGATION_ITEMS } from "@/data/navigation";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const pathname = usePathname();

  // Find active navigation item title
  const currentItem = NAVIGATION_ITEMS.find((item) =>
    item.route === "/" ? pathname === "/" : pathname.startsWith(item.route)
  );

  const title = currentItem ? currentItem.label : "Overview";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#090B10]/90 backdrop-blur-md border-b border-[#252B35]">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-[#9AA4B2] hover:text-[#F4F7FA] hover:bg-[#141820] focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#F4F7FA]">{title}</span>
          <span className="text-[#3B4252] hidden sm:inline">/</span>
          <span className="text-xs text-[#687384] hidden sm:inline">
            AbhedyaX Protocol Analyzer
          </span>
        </div>
      </div>

      {/* Right: Status Indicators & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Simulation Mode Indicator */}
        <SimulationModeBadge />

        {/* System Health Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141820] border border-[#252B35] text-xs text-[#9AA4B2]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-[11px]">Engine: Ready</span>
        </div>

        {/* Notifications placeholder */}
        <button
          className="p-2 rounded-lg text-[#9AA4B2] hover:text-[#F4F7FA] hover:bg-[#141820] transition-colors relative"
          title="Security Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>

        {/* User / Analyst Profile Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#252B35]">
          <div className="w-8 h-8 rounded-full bg-[#141820] border border-[#252B35] flex items-center justify-center text-xs font-mono text-[#F4F7FA]">
            NT
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-medium text-[#F4F7FA] leading-tight">
              NTRO Analyst
            </span>
            <span className="text-[10px] font-mono text-[#687384] leading-tight">
              SEC-26160
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
