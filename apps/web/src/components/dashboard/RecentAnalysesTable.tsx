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
          className="font-mono font-black text-black hover:bg-[#FFE600] px-1 border border-black shadow-[1px_1px_0px_0px_#000] inline-flex items-center gap-1.5 transition-colors"
        >
          <FileCode2 className="w-3.5 h-3.5 text-black" />
          <span>{row.id}</span>
        </Link>
      ),
    },
    {
      key: "sourceName",
      header: "Source",
      render: (row) => (
        <div className="flex flex-col font-mono">
          <span className="text-xs font-bold text-black truncate max-w-[180px]" title={row.sourceName}>
            {row.sourceName}
          </span>
          <span className="text-[10px] text-zinc-600 uppercase font-semibold">
            {row.sourceType === "simulation" ? "Simulation Scenario" : "PCAP Capture"}
          </span>
        </div>
      ),
    },
    {
      key: "vpnProtocol",
      header: "VPN Configuration",
      render: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-black">
          <span>{row.vpnProtocol}</span>
          <span className="text-zinc-400">/</span>
          <span>{row.vpnMode}</span>
          <span className="text-zinc-400">/</span>
          <span className="bg-zinc-100 px-1 border border-black text-[10px]">{row.ipVersion}</span>
        </div>
      ),
    },
    {
      key: "encryption",
      header: "Cryptography",
      render: (row) => (
        <div className="flex flex-col font-mono text-xs">
          <span className="text-black font-bold">{row.encryption}</span>
          <span className="text-[10px] text-zinc-600 font-semibold truncate max-w-[160px]">
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
        <span className="text-zinc-700 font-mono text-[11px] font-bold" suppressHydrationWarning>
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/reports?analysisId=${row.id}`}
            onClick={(e) => e.stopPropagation()}
            title="Open Security & Compliance Report"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-[11px] text-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all font-mono font-bold"
          >
            <FileText className="w-3 h-3 stroke-[2.5]" />
            <span>Report</span>
          </Link>
          <Link
            href={`/analyses/${row.id}`}
            onClick={(e) => e.stopPropagation()}
            title="Inspect Telemetry & Findings"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFE600] hover:bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-[11px] text-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all font-mono font-black"
          >
            <span>View</span>
            <ArrowUpRight className="w-3 h-3 stroke-[3]" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-black">
              {title}
            </h2>
            <p className="text-xs text-zinc-700 font-medium">{subtitle}</p>
          </div>
          {showViewAll && (
            <Link
              href="/analyses"
              className="text-xs font-mono font-black text-black hover:bg-[#FFE600] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 self-start sm:self-auto transition-all"
            >
              <span>View All Analyses</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
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
