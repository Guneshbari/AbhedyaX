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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0F1218] border-r border-[#252B35]",
          "transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#252B35]">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            onClick={onClose}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 group-hover:border-blue-400 transition-colors">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-base text-[#F4F7FA]">
                  Abhedya<span className="text-blue-500">X</span>
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#141820] text-[#9AA4B2] border border-[#252B35]">
                  v0.1
                </span>
              </div>
              <p className="text-[10px] font-medium text-[#687384] tracking-wider uppercase">
                IPsec Intelligence
              </p>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-[#9AA4B2] hover:text-[#F4F7FA] hover:bg-[#141820]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#687384]">
            Navigation
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
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors select-none group",
                  isActive
                    ? "bg-[#141820] text-blue-400 border border-blue-500/25 font-semibold"
                    : "text-[#9AA4B2] hover:text-[#F4F7FA] hover:bg-[#141820]/60 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-blue-400"
                        : "text-[#687384] group-hover:text-[#9AA4B2]"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded font-mono",
                      isActive
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-[#141820] text-[#687384] border border-[#252B35]"
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
        <div className="p-3 border-t border-[#252B35] space-y-2.5 bg-[#090B10]/40">
          <div className="px-2 py-2 rounded-lg bg-[#141820] border border-[#252B35]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#687384]">
                Operating Mode
              </span>
              <SimulationModeBadge showIcon={false} />
            </div>
            <p className="text-[11px] text-[#9AA4B2] leading-tight">
              Deterministic scenario simulations active for Phase 1 validation.
            </p>
          </div>

          <div className="px-2 py-1 flex items-center justify-between text-[10px] text-[#687384] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              NTRO SIH 26160
            </span>
            <span>SEC-NODE-01</span>
          </div>
        </div>
      </aside>
    </>
  );
};
