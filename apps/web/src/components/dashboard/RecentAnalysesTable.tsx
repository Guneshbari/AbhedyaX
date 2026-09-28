"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, FileCode2 } from "lucide-react";
import { AnalysisSummary } from "@/types/dashboard";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SecurityScore } from "@/components/ui/SecurityScore";
import { formatDate } from "@/lib/utils";

interface RecentAnalysesTableProps {
  analyses: AnalysisSummary[];
}

export const RecentAnalysesTable: React.FC<RecentAnalysesTableProps> = ({
  analyses,
}) => {
  const columns: Column<AnalysisSummary>[] = [
    {
      key: "id",
      header: "Analysis ID",
      render: (row) => (
        <Link
          href={`/analyses?id=${row.id}`}
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
      header: "",
      className: "text-right",
      render: (row) => (
        <Link
          href={`/analyses?id=${row.id}`}
          className="inline-flex items-center gap-1 text-xs text-[#9AA4B2] hover:text-[#F4F7FA] font-medium"
        >
          <span>View</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[#F4F7FA]">
            Recent Analyses
          </h2>
          <p className="text-xs text-[#9AA4B2]">
            Inspected tunnels, cryptographic suites, and deterministic compliance findings
          </p>
        </div>
        <Link
          href="/analyses"
          className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <span>View All Analyses</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={analyses}
        keyExtractor={(item) => item.id}
        emptyMessage="No recent analyses recorded."
      />
    </div>
  );
};
