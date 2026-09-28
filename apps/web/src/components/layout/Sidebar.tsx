"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Files,
  Network,
  BrainCircuit,
  FileText,
  Settings,
  Shield,
  ShieldCheck,
  GitCompare,
  TrendingUp,
  Eye,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "@/data/navigation";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard,
  ShieldAlert,
  Files,
  ShieldCheck,
  GitCompare,
  TrendingUp,
  Eye,
  Network,
  BrainCircuit,
  FileText,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r-2 sm:border-r-[3px] border-black",
          "transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-[4px_0px_0px_0px_#000]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header - Neo-Brutalist Cyber Yellow */}
        <div className="flex items-center justify-between h-16 px-4 border-b-2 sm:border-b-[3px] border-black bg-[#FFE600]">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            onClick={onClose}
          >
            <div className="flex items-center justify-center w-9 h-9 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[3px_3px_0px_0px_#000] transition-all">
              <Shield className="w-5 h-5 text-black fill-[#FFE600]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-lg text-black">
                  Abhedya<span className="bg-black text-[#FFE600] px-1 ml-0.5">X</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-white text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                  v0.1
                </span>
              </div>
              <p className="text-[9px] font-black text-black tracking-wider uppercase">
                IPsec Intelligence
              </p>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-zinc-600 font-mono">
            OPERATIONAL CONSOLE
          </div>

          {NAVIGATION_ITEMS.map((item) => {
            const isActive =
              item.route === "/"
                ? pathname === "/"
                : pathname.startsWith(item.route);
            const Icon = ICON_MAP[item.iconName] || LayoutDashboard;

            return (
              <Link
                key={item.route}
                href={item.route}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs font-bold transition-all select-none group border-2",
                  isActive
                    ? "bg-[#FFE600] text-black border-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                    : "text-zinc-800 border-transparent hover:border-black hover:bg-zinc-100 hover:text-black hover:shadow-[2px_2px_0px_0px_#000]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-black"
                        : "text-zinc-700 group-hover:text-black"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 font-mono font-bold border border-black",
                      isActive
                        ? "bg-white text-black shadow-[1px_1px_0px_0px_#000]"
                        : "bg-[#FAF8F5] text-zinc-800"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer: Simulation & Platform Telemetry */}
        <div className="p-3 border-t-2 sm:border-t-[3px] border-black space-y-2 bg-[#FAF8F5]">
          <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-black font-mono">
                System Mode
              </span>
              <SimulationModeBadge showIcon={false} />
            </div>
            <p className="text-[11px] text-zinc-700 leading-snug font-medium">
              Deterministic scenario simulations active for Phase 1 validation.
            </p>
          </div>

          <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] text-black font-mono font-bold bg-white border-2 border-black">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] border border-black" />
              NTRO SIH 26160
            </span>
            <span className="bg-[#FFE600] px-1 border border-black">SEC-01</span>
          </div>
        </div>
      </aside>
    </>
  );
};
