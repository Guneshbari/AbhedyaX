"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileCode2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
import { getAnalysisStatus } from "@/lib/api/analyses";
import { cn } from "@/lib/utils";

const STEPPER_DEFINITIONS = [
  { id: "load_capture", label: "Load Capture", threshold: 15 },
  { id: "detect_ipsec", label: "Detect IPsec", threshold: 30 },
  { id: "parse_ike", label: "Parse IKE", threshold: 45 },
  { id: "analyze_esp", label: "Analyze ESP", threshold: 60 },
  { id: "classify_traffic", label: "Classify Traffic", threshold: 75 },
  { id: "security_assessment", label: "Assess Security Posture", threshold: 90 },
  { id: "complete", label: "Analysis Complete", threshold: 100 },
];

export default function AnalysisProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = String(params.id);

  // Poll status endpoint every 500ms
  const { data: statusData, error, refetch } = useQuery({
    queryKey: ["analysis-status", analysisId],
    queryFn: () => getAnalysisStatus(analysisId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 500;
    },
    enabled: Boolean(analysisId),
  });

  const status = statusData?.status || "processing";
  const progress = statusData?.progress ?? 0;
  const currentStep = statusData?.current_step || "Initializing analysis pipeline...";
  const message = statusData?.message || "Preparing inspection modules...";

  // Automatic navigation on completion
  useEffect(() => {
    if (status === "completed") {
      const timeout = setTimeout(() => {
        router.push(`/analyses/${encodeURIComponent(analysisId)}`);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [status, analysisId, router]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Analysis in Progress"
        subtitle="Executing multi-layer IPsec protocol extraction, cryptographic compliance checks, and encrypted flow classification."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analyze", href: "/analyze" },
          { label: "Processing" },
        ]}
        badge={<SimulationModeBadge />}
        actions={
          <PrimaryButton
            variant="outline"
            size="sm"
            href="/analyze"
            icon={ArrowLeft}
          >
            Cancel Analysis
          </PrimaryButton>
        }
      />

      {/* Main Processing Card */}
      <div className="p-6 sm:p-8 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] space-y-6">
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-black gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-700 uppercase font-mono font-bold">
                Session Identifier
              </div>
              <div className="text-lg font-mono font-black text-black">
                {analysisId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={status === "queued" ? "processing" : status} />
            <div className="font-mono text-sm font-black text-black bg-[#FAF8F5] px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {progress}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-black flex items-center gap-2">
              {status !== "completed" && status !== "failed" && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              )}
              {currentStep}
            </span>
            <span className="font-mono font-bold text-black">{progress} / 100%</span>
          </div>

          <div className="w-full bg-[#FAF8F5] h-3.5 border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_#000]">
            <div
              className={cn(
                "h-full transition-all duration-300",
                status === "failed" ? "bg-[#FF4B4B]" : "bg-[#FFE600]"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-zinc-700 font-mono font-bold pt-1">{message}</p>
        </div>

        {/* 7-Step Processing Stepper */}
        <div className="pt-4 border-t-2 border-black space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-black">
            Pipeline Execution Stepper
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {STEPPER_DEFINITIONS.map((step, idx) => {
              const isFinished = progress >= step.threshold || status === "completed";
              const isCurrent =
                !isFinished &&
                (idx === 0 || progress >= STEPPER_DEFINITIONS[idx - 1].threshold);

              return (
                <div
                  key={step.id}
                  className={cn(
                    "p-3 border-2 border-black flex items-center justify-between transition-colors",
                    isFinished
                      ? "bg-[#4ADE80] text-black shadow-[2px_2px_0px_0px_#000] font-bold"
                      : isCurrent
                      ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] font-black animate-pulse"
                      : "bg-[#FAF8F5] text-zinc-600 shadow-[2px_2px_0px_0px_#000]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 text-xs font-mono font-black">
                      {isFinished ? (
                        <CheckCircle2 className="w-5 h-5 text-black" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                      ) : (
                        <span className="w-5 h-5 border border-black flex items-center justify-center text-[10px] text-black font-bold">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-black">{step.label}</span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-black">
                    {isFinished ? "Completed" : isCurrent ? "Active" : "Queued"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Failure Alert State */}
        {status === "failed" && (
          <div className="p-4 bg-[#FF4B4B]/15 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-black font-bold">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#FF4B4B]" />
              <span>
                {error?.message || "Analysis failed to complete in the engine."}
              </span>
            </div>
            <PrimaryButton
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => refetch()}
            >
              Retry Polling
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
