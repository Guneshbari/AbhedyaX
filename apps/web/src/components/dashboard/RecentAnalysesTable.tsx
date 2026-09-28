"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, FileCode2, FileText } from "lucide-react";
import { AnalysisSummary } from "@/types/dashboard";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SecurityScore } from "@/components/ui/SecurityScore";
import { formatDate } from "@/lib/utils";

interface RecentAnalysesTableProps {
  analyses: AnalysisSummary[];
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
  showViewAll?: boolean;
}

export const RecentAnalysesTable: React.FC<RecentAnalysesTableProps> = ({
  analyses,
  title = "Recent Analyses",
  subtitle = "Inspected tunnels, cryptographic suites, and deterministic compliance findings",
  hideHeader = false,
  showViewAll = true,
}) => {
  const router = useRouter();
  const columns: Column<AnalysisSummary>[] = [
    {
      key: "id",
      header: "Analysis ID",
      render: (row) => (
        <Link
          href={`/analyses/${row.id}`}
          className="font-mono font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1.5"
        >
          <FileCode2 className="w-3.5 h-3.5 text-[#687384]" />
          <span>{row.id}</span>
        </Link>
      ),
    },
    {
      key: "sourceName",
      header: "Source",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs text-[#F4F7FA] truncate max-w-[180px]" title={row.sourceName}>
            {row.sourceName}
          </span>
          <span className="text-[10px] text-[#687384] capitalize">
            {row.sourceType === "simulation" ? "Simulation Scenario" : "PCAP Capture"}
          </span>
        </div>
      ),
    },
    {
      key: "vpnProtocol",
      header: "VPN Configuration",
      render: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-[#F4F7FA]">{row.vpnProtocol}</span>
          <span className="text-[#3B4252]">/</span>
          <span className="text-[#9AA4B2]">{row.vpnMode}</span>
          <span className="text-[#3B4252]">/</span>
          <span className="text-[#687384] text-[10px]">{row.ipVersion}</span>
        </div>
      ),
    },
    {
      key: "encryption",
      header: "Cryptography",
      render: (row) => (
        <div className="flex flex-col font-mono text-xs">
          <span className="text-[#F4F7FA]">{row.encryption}</span>
          <span className="text-[10px] text-[#687384] truncate max-w-[160px]">
            {row.dhGroup} {row.pfsEnabled ? "(PFS)" : "(No PFS)"}
          </span>
        </div>
      ),
    },
    {
      key: "securityScore",
      header: "Security Score",
      render: (row) => (
        <SecurityScore
          score={row.securityScore}
          grade={row.grade}
          size="sm"
          showProgress={true}
        />
      ),
    },
    {
      key: "riskLevel",
      header: "Risk",
      render: (row) => <RiskBadge level={row.riskLevel} />,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Timestamp",
      render: (row) => (
        <span className="text-[#687384] font-mono text-[11px]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/reports?analysisId=${row.id}`}
            onClick={(e) => e.stopPropagation()}
            title="Open Security & Compliance Report"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#141820] border border-[#252B35] text-[11px] text-blue-400 hover:text-blue-300 hover:border-blue-500/40 hover:bg-[#1a202c] transition-colors font-medium"
          >
            <FileText className="w-3 h-3" />
            <span>Report</span>
          </Link>
          <Link
            href={`/analyses/${row.id}`}
            onClick={(e) => e.stopPropagation()}
            title="Inspect Telemetry & Findings"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/15 border border-blue-500/30 text-[11px] text-blue-300 hover:text-white hover:bg-blue-600/30 transition-colors font-medium"
          >
            <span>View</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[#F4F7FA]">
              {title}
            </h2>
            <p className="text-xs text-[#9AA4B2]">{subtitle}</p>
          </div>
          {showViewAll && (
            <Link
              href="/analyses"
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All Analyses</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        data={analyses}
        keyExtractor={(item) => item.id}
        onRowClick={(row) => router.push(`/analyses/${row.id}`)}
        emptyMessage="No recent analyses recorded."
      />
    </div>
  );
};
