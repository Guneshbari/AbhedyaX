"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BrainCircuit,
  ArrowLeft,
  AlertCircle,
  Cpu,
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
  const isMl = traffic.classification_mode === "ml" || Boolean(traffic.model?.name);
  const isPassed = traffic.confidence >= 0.55 && traffic.predicted_class !== "Unknown";
  const rawFeatures = (traffic.features || {}) as Record<string, unknown>;
  const durationSec = Number(rawFeatures.session_duration_seconds ?? rawFeatures.flow_duration ?? 600);

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
        badge={
          isMl ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <Cpu className="w-3.5 h-3.5" />
              ML Engine ({traffic.model?.name ?? "traffic_classifier"} v{traffic.model?.version ?? "1.0.0"})
            </span>
          ) : (
            <SimulationModeBadge />
          )
        }
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
              {isPassed ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  High Confidence Match
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  Abstained (Low Confidence)
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-[#F4F7FA]">
              {traffic.predicted_class}
            </h2>
            <p className="text-xs text-[#9AA4B2] mt-1 max-w-xl leading-relaxed">
              {isMl
                ? `Statistical inference evaluated by ${traffic.model?.name ?? "traffic_classifier"} v${traffic.model?.version ?? "1.0.0"} across 28 zero-payload flow vectors over ESP protocol streams.`
                : "Statistical inference derived from packet size distributions, burst timing, and session duration vectors over ESP protocol streams."}
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
          <span
            className={`text-[11px] font-mono block ${
              isPassed ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {isPassed ? "Confidence Threshold Passed (≥55%)" : "Abstention Threshold Triggered"}
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
            durationSeconds={durationSec}
          />
        </div>
        <div className="lg:col-span-6">
          <ExplanationPanel traffic={traffic} />
        </div>
      </div>
    </div>
  );
}
