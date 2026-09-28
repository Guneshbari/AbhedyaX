"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Play, AlertCircle, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
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
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* 4. Action Bar */}
      <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#9AA4B2]">
          {selectedSource === "simulation" ? (
            <span>
              Target: <strong className="text-[#F4F7FA]">{activeScenario.name}</strong> • Deterministic execution with simulated telemetry
            </span>
          ) : selectedFile ? (
            <span>
              Target: <strong className="text-[#F4F7FA]">{selectedFile.name}</strong> • Real TShark deep packet dissection & cryptographic audit
            </span>
          ) : (
            <span className="text-amber-400">Please select or upload a capture file to proceed</span>
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
    </div>
  );
}
