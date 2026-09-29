"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
import { NAVIGATION_ITEMS } from "@/data/navigation";

import { useDataProvider } from "@/lib/providers";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const pathname = usePathname();
  const { effectiveMode, isApiAvailable } = useDataProvider();

  // Find active navigation item title
  const currentItem = NAVIGATION_ITEMS.find((item) =>
    item.route === "/" ? pathname === "/" : pathname.startsWith(item.route)
  );

  const title = currentItem ? currentItem.label : "Overview";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b-2 sm:border-b-[3px] border-black shadow-[0px_3px_0px_0px_#000] print:hidden">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 border-2 border-black bg-white text-black hover:bg-[#FFE600] shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm sm:text-base font-black text-black truncate tracking-tight">
            {title}
          </span>
          <span className="text-black font-black hidden sm:inline shrink-0">/</span>
          <span className="text-xs font-mono font-bold text-zinc-600 hidden sm:inline truncate uppercase">
            AbhedyaX Protocol Analyzer
          </span>
        </div>
      </div>

      {/* Right: Status Indicators & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Simulation Mode Indicator */}
        <SimulationModeBadge />

        {/* System Health Status */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-bold font-mono ${
            effectiveMode === "demo"
              ? "bg-[#FAF8F5] text-black"
              : isApiAvailable
              ? "bg-[#4ADE80] text-black"
              : "bg-[#FF4B4B] text-white"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              effectiveMode === "demo"
                ? "bg-black"
                : isApiAvailable
                ? "bg-black animate-pulse"
                : "bg-white"
            }`}
          />
          <span>
            {effectiveMode === "demo"
              ? "Engine: Demo"
              : isApiAvailable
              ? "Engine: Live"
              : "Engine: Offline"}
          </span>
        </div>

        {/* Notifications */}
        <button
          className="p-2 border-2 border-black bg-white hover:bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all relative cursor-pointer"
          title="Security Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF4B4B] border-2 border-black rounded-full" />
        </button>

        {/* User / Analyst Profile Badge */}
        <div className="flex items-center gap-2 pl-2 border-l-2 border-black">
          <div className="w-8 h-8 bg-[#38BDF8] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center text-xs font-mono font-black text-black">
            NT
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-black text-black leading-tight">
              NTRO Analyst
            </span>
            <span className="text-[10px] font-mono font-bold text-zinc-600 leading-tight">
              SEC-26160
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
