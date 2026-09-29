"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Play, AlertCircle, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
import { DemoNextStepCTA } from "@/components/ui/DemoNextStepCTA";

import { SourceSelector } from "@/components/analyze/SourceSelector";
import { ScenarioPicker } from "@/components/analyze/ScenarioPicker";
import {
  PcapUploader,
  SelectedPcapFile,
} from "@/components/analyze/PcapUploader";
import { ConfigurationSummary } from "@/components/analyze/ConfigurationSummary";
import {
  createAnalysis,
  uploadAnalysisPcap,
  getScenarios,
} from "@/lib/api/analyses";
import { DEFAULT_SCENARIOS } from "@/data/defaultScenarios";
import { ScenarioDefinition } from "@/types/analysis";

export default function AnalyzePage() {
  const router = useRouter();

  const [selectedSource, setSelectedSource] = useState<"simulation" | "pcap">(
    "simulation"
  );
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<string>("secure-enterprise");
  const [selectedFile, setSelectedFile] = useState<SelectedPcapFile | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch scenarios from API with fallback
  const { data: scenarios = DEFAULT_SCENARIOS } = useQuery<ScenarioDefinition[]>({
    queryKey: ["scenarios"],
    queryFn: getScenarios,
    initialData: DEFAULT_SCENARIOS,
  });

  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  // Validation
  const isValid =
    selectedSource === "simulation"
      ? Boolean(selectedScenarioId)
      : Boolean(selectedFile);

  // Mutation for creating simulation or server-side benchmark analysis
  const createMutation = useMutation({
    mutationFn: createAnalysis,
    onSuccess: (data) => {
      setFormError(null);
      router.push(`/analyses/${data.analysis_id}/processing`);
    },
    onError: (error: Error) => {
      setFormError(
        error.message || "Failed to initiate analysis session. Verify backend connectivity."
      );
    },
  });

  // Mutation for uploading real PCAP
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAnalysisPcap(file),
    onSuccess: (data) => {
      setFormError(null);
      router.push(`/analyses/${data.analysis_id}/processing`);
    },
    onError: (error: Error) => {
      setFormError(
        error.message || "Failed to upload capture. Verify TShark is available and file is a valid PCAP."
      );
    },
  });

  const isSubmitting = createMutation.isPending || uploadMutation.isPending;

  const handleStartAnalysis = () => {
    if (!isValid) return;

    setFormError(null);
    if (selectedSource === "pcap" && selectedFile) {
      if (selectedFile.rawFile) {
        uploadMutation.mutate(selectedFile.rawFile);
      } else {
        createMutation.mutate({
          source_type: "pcap",
          file_name: selectedFile.name,
        });
      }
    } else {
      createMutation.mutate({
        source_type: "simulation",
        scenario_id: selectedScenarioId,
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Configure & Start IPsec Analysis"
        subtitle="Submit packet captures or select standardized simulation scenarios for deep protocol decoding, cryptographic assessment, and encrypted traffic inference."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Analyze" },
        ]}
        badge={<SimulationModeBadge />}
        actions={
          <PrimaryButton
            variant="outline"
            size="sm"
            href="/"
            icon={ArrowLeft}
          >
            Back to Dashboard
          </PrimaryButton>
        }
      />

      {/* 1. Source Selector (Simulation vs PCAP) */}
      <SourceSelector
        selectedSource={selectedSource}
        onSelectSource={(source) => {
          setSelectedSource(source);
          setFormError(null);
        }}
      />

      {/* 2. Interactive Selection Panel */}
      {selectedSource === "simulation" ? (
        <ScenarioPicker
          scenarios={scenarios}
          selectedScenarioId={selectedScenarioId}
          onSelectScenario={(id) => setSelectedScenarioId(id)}
        />
      ) : (
        <PcapUploader
          selectedFile={selectedFile}
          onSelectFile={(file) => setSelectedFile(file)}
        />
      )}

      {/* 3. Configuration Summary Matrix */}
      <ConfigurationSummary
        sourceType={selectedSource}
        scenario={selectedSource === "simulation" ? activeScenario : null}
        fileName={selectedFile?.name}
      />

      {/* Error Display */}
      {formError && (
        <div className="p-4 bg-[#FF4B4B] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-3 text-black text-xs font-bold font-mono">
          <AlertCircle className="w-5 h-5 shrink-0 stroke-[2.5]" />
          <span>{formError}</span>
        </div>
      )}

      {/* 4. Action Bar */}
      <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-zinc-800 font-mono font-bold">
          {selectedSource === "simulation" ? (
            <span>
              Target: <strong className="text-black bg-[#FFE600] px-1.5 py-0.5 border border-black">{activeScenario.name}</strong> • Deterministic execution with simulated telemetry
            </span>
          ) : selectedFile ? (
            <span>
              Target: <strong className="text-black bg-[#FFE600] px-1.5 py-0.5 border border-black">{selectedFile.name}</strong> • Real TShark deep packet dissection & cryptographic audit
            </span>
          ) : (
            <span className="text-black bg-[#FEF08A] px-2 py-0.5 border border-black">Please select or upload a capture file to proceed</span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <PrimaryButton
            variant="outline"
            size="md"
            href="/"
          >
            Cancel
          </PrimaryButton>

          <PrimaryButton
            variant="primary"
            size="md"
            icon={Play}
            isLoading={isSubmitting}
            disabled={!isValid || isSubmitting}
            onClick={handleStartAnalysis}
          >
            {isSubmitting ? "Queuing Session..." : "Start Analysis"}
          </PrimaryButton>
        </div>
      </div>

      {/* Demo Journey — Step 2: after selecting "secure-enterprise" and clicking Start Analysis,
          the existing analysis flow navigates automatically to /analyses/[id]/processing.
          This CTA lets judges directly jump to the canonical result if needed. */}
      <DemoNextStepCTA
        nextRoute="/analyses/AX-2026-00428/processing"
        nextLabel="View Analysis Processing"
        context="Step 3 of 8 — Watch AbhedyaX process the secure-enterprise VPN capture."
      />
    </div>
  );
}
