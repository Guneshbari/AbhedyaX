"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BrainCircuit,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
import { AnalysisNavTabs } from "@/components/analysis/AnalysisNavTabs";
import { CandidateClassesChart } from "@/components/traffic/CandidateClassesChart";
import { TrafficFeatureMetrics } from "@/components/traffic/TrafficFeatureMetrics";
import { TrafficTimeline } from "@/components/traffic/TrafficTimeline";
import { ExplanationPanel } from "@/components/traffic/ExplanationPanel";
import { getAnalysisResult } from "@/lib/api/analyses";

export default function TrafficIntelligencePage() {
  const params = useParams();
  const analysisId = String(params.id);

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["analysis-result", analysisId],
    queryFn: () => getAnalysisResult(analysisId),
    enabled: Boolean(analysisId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs text-[#9AA4B2] font-mono">
          Extracting flow classification telemetry for {analysisId}...
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="p-8 rounded-xl border border-red-500/30 bg-red-500/10 text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h2 className="text-base font-semibold text-[#F4F7FA]">
          Traffic Data Unavailable
        </h2>
        <p className="text-xs text-[#9AA4B2]">
          {error?.message || `Unable to load traffic intelligence for ${analysisId}.`}
        </p>
        <PrimaryButton variant="primary" size="sm" href={`/analyses/${analysisId}`}>
          Back to Overview
        </PrimaryButton>
      </div>
    );
  }

  const { traffic } = result;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <PageHeader
        title={`Traffic Intelligence: ${analysisId}`}
        subtitle="AI-assisted classification of encrypted traffic metadata without tunnel payload decryption"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analyses", href: "/analyses" },
          { label: analysisId, href: `/analyses/${analysisId}` },
          { label: "Traffic Intelligence" },
        ]}
        badge={<SimulationModeBadge />}
        actions={
          <PrimaryButton
            variant="outline"
            size="sm"
            href={`/analyses/${analysisId}`}
            icon={ArrowLeft}
          >
            Back to Overview
          </PrimaryButton>
        }
      />

      {/* 2. Context Navigation Tabs */}
      <AnalysisNavTabs
        analysisId={analysisId}
        activeTab="traffic"
        findingsCount={result.findings.length}
        confidenceScore={traffic.confidence}
      />

      {/* 3. Hero Classification Banner */}
      <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 shrink-0">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#687384]">
                Inferred Application Profile
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                High Confidence Match
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-[#F4F7FA]">
              {traffic.predicted_class}
            </h2>
            <p className="text-xs text-[#9AA4B2] mt-1 max-w-xl leading-relaxed">
              Statistical inference derived from packet size distributions, burst timing, and session duration vectors over ESP protocol streams.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#141820] border border-[#252B35] text-center min-w-[180px] shrink-0 space-y-1">
          <span className="text-[10px] uppercase font-mono text-[#687384] block">
            Model Confidence
          </span>
          <div className="text-3xl font-mono font-bold text-blue-400">
            {(traffic.confidence * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] font-mono text-emerald-400 block">
            Statistical Threshold Passed
          </span>
        </div>
      </div>

      {/* 4. Candidate Classes Distribution Chart */}
      <CandidateClassesChart
        candidates={traffic.candidate_classes}
        predictedClass={traffic.predicted_class}
      />

      {/* 5. Metadata Feature Vectors */}
      <TrafficFeatureMetrics
        features={traffic.features}
        predictedClass={traffic.predicted_class}
      />

      {/* 6. Timeline & Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <TrafficTimeline
            predictedClass={traffic.predicted_class}
            durationSeconds={traffic.features?.session_duration_seconds ?? 600}
          />
        </div>
        <div className="lg:col-span-6">
          <ExplanationPanel traffic={traffic} />
        </div>
      </div>
    </div>
  );
}
