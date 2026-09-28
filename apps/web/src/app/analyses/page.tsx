import React from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";
import { DASHBOARD_DATA } from "@/data/dashboardData";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function AnalysesPage() {
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
            placeholder="Search by ID, file name, or cipher..."
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F4F7FA] placeholder-[#687384] focus:outline-none focus:border-blue-500"
            disabled
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-[#687384]">Filter:</span>
          {["All", "IKEv2", "IKEv1", "High Risk"].map((filter, i) => (
            <span
              key={filter}
              className={`text-xs px-2.5 py-1 rounded-md border select-none ${
                i === 0
                  ? "bg-blue-600/15 border-blue-500/30 text-blue-400 font-medium"
                  : "bg-[#141820] border-[#252B35] text-[#9AA4B2]"
              }`}
            >
              {filter}
            </span>
          ))}
        </div>
      </div>

      {/* Full Analyses Table */}
      <RecentAnalysesTable analyses={DASHBOARD_DATA.recentAnalyses} />
    </div>
  );
}
