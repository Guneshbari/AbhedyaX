"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";
import { DASHBOARD_DATA } from "@/data/dashboardData";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getAnalyses } from "@/lib/api/analyses";
import { AnalysisSummary } from "@/types/dashboard";

const FILTERS = ["All", "IKEv2", "IKEv1", "High Risk"] as const;
type FilterType = (typeof FILTERS)[number];

export default function AnalysesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const { data: apiAnalyses } = useQuery({
    queryKey: ["analyses-list"],
    queryFn: () => getAnalyses(),
    retry: 1,
  });

  const allAnalyses: AnalysisSummary[] = useMemo(() => {
    if (!apiAnalyses || apiAnalyses.length === 0) {
      return DASHBOARD_DATA.recentAnalyses;
    }
    return apiAnalyses.map((r) => {
      const existing = DASHBOARD_DATA.recentAnalyses.find((a) => a.id === r.analysis_id);
      return {
        id: r.analysis_id,
        sourceName: r.source.file_name || r.source.name,
        sourceType: r.source.type,
        vpnProtocol: r.vpn.ike_version || r.vpn.protocol,
        vpnMode: (r.vpn.mode as "Tunnel" | "Transport") || "Tunnel",
        ipVersion: (r.vpn.ip_version as "IPv4" | "IPv6") || "IPv4",
        encryption: r.cryptography.encryption,
        authentication: r.cryptography.authentication,
        dhGroup: r.cryptography.dh_group,
        pfsEnabled: r.cryptography.pfs,
        securityScore: r.security.score,
        grade: r.security.grade,
        riskLevel: r.security.risk_level,
        status: existing?.status || "completed",
        createdAt: r.created_at,
      };
    });
  }, [apiAnalyses]);

  const filteredAnalyses = useMemo(() => {
    return allAnalyses.filter((item) => {
      // Filter tab
      if (activeFilter === "IKEv2" && !item.vpnProtocol.includes("IKEv2")) {
        return false;
      }
      if (activeFilter === "IKEv1" && !item.vpnProtocol.includes("IKEv1")) {
        return false;
      }
      if (
        activeFilter === "High Risk" &&
        item.riskLevel !== "High" &&
        item.riskLevel !== "Critical"
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesSource = item.sourceName.toLowerCase().includes(q);
        const matchesProtocol = item.vpnProtocol.toLowerCase().includes(q);
        const matchesEncryption = item.encryption.toLowerCase().includes(q);
        const matchesDh = item.dhGroup.toLowerCase().includes(q);
        const matchesRisk = item.riskLevel.toLowerCase().includes(q);

        if (
          !matchesId &&
          !matchesSource &&
          !matchesProtocol &&
          !matchesEncryption &&
          !matchesDh &&
          !matchesRisk
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allAnalyses, searchQuery, activeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Session Analyses"
        subtitle="Searchable repository of decoded IPsec security evaluations, cryptographic assessments, and exportable findings."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analyses" },
        ]}
        actions={
          <PrimaryButton variant="primary" size="sm" href="/analyze">
            New Analysis
          </PrimaryButton>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687384]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, file name, cipher, or risk..."
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg pl-9 pr-8 py-1.5 text-xs text-[#F4F7FA] placeholder-[#687384] focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687384] hover:text-[#F4F7FA] p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#687384]">Filter:</span>
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`text-xs px-2.5 py-1 rounded-md border select-none transition-colors cursor-pointer ${
                activeFilter === filter
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-400 font-medium"
                  : "bg-[#141820] border-[#252B35] text-[#9AA4B2] hover:text-[#F4F7FA] hover:border-[#3B4252]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Showing count indicator */}
      <div className="flex items-center justify-between px-1 text-xs text-[#687384] font-mono">
        <span>
          Showing {filteredAnalyses.length} of {allAnalyses.length} recorded analyses
        </span>
        {(searchQuery || activeFilter !== "All") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveFilter("All");
            }}
            className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Full Analyses Table */}
      <RecentAnalysesTable analyses={filteredAnalyses} hideHeader />
    </div>
  );
}
