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
import { getPredefinedAnalysis } from "@/data/dashboardData";

export default function TrafficIntelligencePage() {
  const params = useParams();
  const analysisId = String(params.id);

  const predefined = React.useMemo(
    () => getPredefinedAnalysis(analysisId),
    [analysisId]
  );

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ["analysis-result", analysisId],
    queryFn: () => getAnalysisResult(analysisId),
    enabled: Boolean(analysisId),
    retry: 1,
  });

  const result = queryResult || predefined;

  if (isLoading && !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-black border-t-[#FFE600] animate-spin" />
        <p className="text-xs text-black font-mono font-bold">
          Extracting flow classification telemetry for {analysisId}...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 border-2 border-black bg-[#FF4B4B]/15 shadow-[4px_4px_0px_0px_#000] text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-[#FF4B4B] mx-auto" />
        <h2 className="text-base font-black text-black">
          Traffic Data Unavailable
        </h2>
        <p className="text-xs text-zinc-800 font-mono">
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#4ADE80] text-black shadow-[2px_2px_0px_0px_#000] text-[11px] font-mono font-black">
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
      <div className="p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-[#38BDF8] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black shrink-0">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-black font-mono tracking-wider text-black">
                Inferred Application Profile
              </span>
              {isPassed ? (
                <span className="text-[10px] font-mono font-black px-2 py-0.5 border-2 border-black bg-[#4ADE80] text-black shadow-[2px_2px_0px_0px_#000]">
                  High Confidence Match
                </span>
              ) : (
                <span className="text-[10px] font-mono font-black px-2 py-0.5 border-2 border-black bg-[#FBBF24] text-black shadow-[2px_2px_0px_0px_#000]">
                  Abstained (Low Confidence)
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-mono text-black">
              {traffic.predicted_class}
            </h2>
            <p className="text-xs text-zinc-700 mt-1 max-w-xl leading-relaxed">
              {isMl
                ? `Statistical inference evaluated by ${traffic.model?.name ?? "traffic_classifier"} v${traffic.model?.version ?? "1.0.0"} across 28 zero-payload flow vectors over ESP protocol streams.`
                : "Statistical inference derived from packet size distributions, burst timing, and session duration vectors over ESP protocol streams."}
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-center min-w-[180px] shrink-0 space-y-1">
          <span className="text-[10px] uppercase font-mono font-black text-black block">
            Model Confidence
          </span>
          <div className="text-3xl font-mono font-black text-black">
            {(traffic.confidence * 100).toFixed(1)}%
          </div>
          <span
            className={`text-[11px] font-mono font-bold block ${
              isPassed ? "text-emerald-700" : "text-amber-700"
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
