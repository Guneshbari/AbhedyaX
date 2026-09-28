"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F7FA]">
      {/* Sidebar (Desktop fixed, Mobile offcanvas) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen w-full min-w-0 overflow-x-hidden">
        <Topbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl 2xl:max-w-[1600px] w-full min-w-0 mx-auto">
          {children}
        </main>

        {/* Global Footer info bar */}
        <footer className="px-6 py-4 border-t border-[#252B35] bg-[#090B10] text-center text-xs text-[#687384] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#9AA4B2]">AbhedyaX</span>
            <span>—</span>
            <span>AI-Powered IPsec VPN Protocol Analyzer & Security Assessment</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>NTRO Problem 26160</span>
            <span className="text-[#3B4252]">|</span>
            <span className="text-amber-400/80">Phase 1: Simulation Mode</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
