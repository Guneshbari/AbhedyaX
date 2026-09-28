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
      <div className="p-6 sm:p-8 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-6">
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#252B35] gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#687384] uppercase font-mono">
                Session Identifier
              </div>
              <div className="text-lg font-mono font-bold text-[#F4F7FA]">
                {analysisId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={status === "queued" ? "processing" : status} />
            <div className="font-mono text-sm font-semibold text-blue-400">
              {progress}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#F4F7FA] flex items-center gap-2">
              {status !== "completed" && status !== "failed" && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              )}
              {currentStep}
            </span>
            <span className="font-mono text-[#687384]">{progress} / 100%</span>
          </div>

          <div className="w-full bg-[#141820] h-2.5 rounded-full overflow-hidden border border-[#252B35]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                status === "failed" ? "bg-red-500" : "bg-blue-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-[#9AA4B2] font-mono pt-1">{message}</p>
        </div>

        {/* 7-Step Processing Stepper */}
        <div className="pt-4 border-t border-[#252B35] space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#687384]">
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
                    "p-3 rounded-lg border flex items-center justify-between transition-colors",
                    isFinished
                      ? "bg-emerald-500/5 border-emerald-500/20 text-[#F4F7FA]"
                      : isCurrent
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : "bg-[#141820]/40 border-[#252B35]/60 text-[#687384]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono">
                      {isFinished ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-[#252B35] flex items-center justify-center text-[10px] text-[#687384]">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium">{step.label}</span>
                  </div>

                  <span className="text-[11px] font-mono text-[#687384]">
                    {isFinished ? "Completed" : isCurrent ? "Active" : "Queued"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Failure Alert State */}
        {status === "failed" && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
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
