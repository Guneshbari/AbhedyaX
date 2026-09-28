"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Download,
  ArrowLeft,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
import { AnalysisNavTabs } from "@/components/analysis/AnalysisNavTabs";
import { FindingCard } from "@/components/findings/FindingCard";
import { FindingDetailPanel } from "@/components/findings/FindingDetailPanel";
import { FindingsToolbar } from "@/components/findings/FindingsToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAnalysisResult } from "@/lib/api/analyses";

const SEVERITY_WEIGHT: Record<string, number> = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Informational: 1,
};

export default function FindingsInvestigationPage() {
  const params = useParams();
  const analysisId = String(params.id);

  const { data: result, isLoading } = useQuery({
    queryKey: ["analysis-result", analysisId],
    queryFn: () => getAnalysisResult(analysisId),
    enabled: Boolean(analysisId),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState<
    "Severity" | "Confidence" | "Category"
  >("Severity");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    null
  );

  const findings = useMemo(() => result?.findings ?? [], [result?.findings]);
  const summary = result?.summary ?? {
    total_findings: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
  };

  // Filter and sort findings
  const filteredFindings = useMemo(() => {
    return findings
      .filter((f) => {
        // Severity filter
        if (selectedSeverity !== "All" && f.severity !== selectedSeverity) {
          return false;
        }
        // Category filter
        if (selectedCategory !== "All" && f.category !== selectedCategory) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = f.title.toLowerCase().includes(q);
          const matchDesc = f.description.toLowerCase().includes(q);
          const matchId = f.id.toLowerCase().includes(q);
          const matchCat = f.category.toLowerCase().includes(q);
          const matchEvidence = f.evidence.some((ev) =>
            ev.toLowerCase().includes(q)
          );
          if (!matchTitle && !matchDesc && !matchId && !matchCat && !matchEvidence) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "Severity") {
          return (
            (SEVERITY_WEIGHT[b.severity] || 0) -
            (SEVERITY_WEIGHT[a.severity] || 0)
          );
        }
        if (selectedSort === "Confidence") {
          return b.confidence - a.confidence;
        }
        return a.category.localeCompare(b.category);
      });
  }, [findings, searchQuery, selectedSeverity, selectedCategory, selectedSort]);

  // Selected finding object
  const activeFinding = useMemo(() => {
    if (selectedFindingId) {
      const found = filteredFindings.find((f) => f.id === selectedFindingId);
      if (found) return found;
    }
    return filteredFindings[0] || null;
  }, [filteredFindings, selectedFindingId]);

  const handleExportFindings = () => {
    if (!result) return;
    const exportData = {
      analysis_id: result.analysis_id,
      timestamp: new Date().toISOString(),
      findings: filteredFindings,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abhedyax-findings-${result.analysis_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs text-[#9AA4B2] font-mono">
          Loading findings repository for {analysisId}...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <PageHeader
        title={`Security Findings: ${analysisId}`}
        subtitle={`Granular, evidence-backed vulnerability and compliance assessment for session '${result?.source.name ?? analysisId}'`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analyses", href: "/analyses" },
          { label: analysisId, href: `/analyses/${analysisId}` },
          { label: "Findings" },
        ]}
        badge={<SimulationModeBadge />}
        actions={
          <div className="flex items-center gap-2.5">
            <PrimaryButton
              variant="outline"
              size="sm"
              href={`/analyses/${analysisId}`}
              icon={ArrowLeft}
            >
              Back to Overview
            </PrimaryButton>
            <PrimaryButton
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleExportFindings}
            >
              Export Findings JSON
            </PrimaryButton>
          </div>
        }
      />

      {/* 2. Context Navigation Tabs */}
      <AnalysisNavTabs
        analysisId={analysisId}
        activeTab="findings"
        findingsCount={findings.length}
        confidenceScore={result?.traffic.confidence}
      />

      {/* 3. Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {
            label: "Total Findings",
            count: summary.total_findings,
            style: "text-[#F4F7FA] bg-[#0F1218] border-[#252B35]",
          },
          {
            label: "Critical",
            count: summary.critical,
            style: "text-red-400 bg-red-500/10 border-red-500/25",
          },
          {
            label: "High Severity",
            count: summary.high,
            style: "text-orange-400 bg-orange-500/10 border-orange-500/25",
          },
          {
            label: "Medium Severity",
            count: summary.medium,
            style: "text-amber-400 bg-amber-500/10 border-amber-500/25",
          },
          {
            label: "Low / Informational",
            count: summary.low + summary.informational,
            style: "text-blue-400 bg-blue-500/10 border-blue-500/25",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`p-3.5 rounded-xl border flex flex-col justify-between ${item.style}`}
          >
            <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">
              {item.label}
            </span>
            <span className="text-2xl font-bold font-mono mt-1">
              {item.count}
            </span>
          </div>
        ))}
      </div>

      {/* 4. Filter & Search Toolbar */}
      <FindingsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      {/* 5. Split Investigation Workspace */}
      {filteredFindings.length === 0 ? (
        <EmptyState
          title="No Findings Match Filter Criteria"
          description="Adjust your search query, severity, or category filter to inspect other recorded security issues."
          icon={AlertTriangle}
          actionText="Reset All Filters"
          onAction={() => {
            setSearchQuery("");
            setSelectedSeverity("All");
            setSelectedCategory("All");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Finding Cards List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#687384] px-1 font-mono">
              <span>Displaying {filteredFindings.length} findings</span>
              <span>Select to inspect</span>
            </div>

            <div className="space-y-3">
              {filteredFindings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  isSelected={activeFinding?.id === finding.id}
                  onSelect={() => setSelectedFindingId(finding.id)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Finding Detail Panel */}
          <div className="lg:col-span-7 sticky top-20">
            <FindingDetailPanel finding={activeFinding} />
          </div>
        </div>
      )}
    </div>
  );
}
