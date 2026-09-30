"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AbhedyaLogo } from "@/components/ui/AbhedyaLogo";
import { JudgeDemoController } from "@/components/ui/JudgeDemoController";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Standalone pages (e.g. standalone audit reports) render without sidebar/topbar shell
  if (pathname?.startsWith("/reports/standalone")) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-black print:bg-white">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-black">
      {/* Sidebar (Desktop fixed, Mobile offcanvas) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen w-full min-w-0 overflow-x-hidden print:pl-0 print:min-h-0 print:overflow-visible">
        <Topbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl 2xl:max-w-[1600px] w-full min-w-0 mx-auto print:p-0 print:m-0 print:max-w-none">
          {/* Judge Demo Guided Workflow Controller — appears above page content during demo */}
          <JudgeDemoController />

          {children}
        </main>

        {/* Global Footer info bar - Neubrutalism */}
        <footer className="px-6 py-4 border-t-2 border-black bg-white text-xs text-black font-mono flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0px_-2px_0px_0px_#000] print:hidden">
          <div className="flex items-center gap-2 font-medium">
            <AbhedyaLogo size={20} />
            <span className="font-black bg-[#FFE600] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
              AbhedyaX
            </span>
            <span>—</span>
            <span className="text-zinc-800">AI-Powered IPsec Protocol Analyzer &amp; Security Assessment</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="bg-[#FAF8F5] px-2 py-0.5 border border-black">NTRO Problem 26160</span>
            <span>|</span>
            <span className="bg-[#4ADE80] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
              Phase 1: Simulation Mode
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};
