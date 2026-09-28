import { apiFetch } from "./client";
import {
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  AnalysisStatusResponse,
  AnalysisResult,
  ScenarioDefinition,
} from "@/types/analysis";

export async function createAnalysis(
  request: CreateAnalysisRequest
): Promise<CreateAnalysisResponse> {
  return apiFetch<CreateAnalysisResponse>("/api/v1/analyses", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getAnalysisStatus(
  analysisId: string
): Promise<AnalysisStatusResponse> {
  return apiFetch<AnalysisStatusResponse>(
    `/api/v1/analyses/${encodeURIComponent(analysisId)}/status`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
}

export async function getAnalysisResult(
  analysisId: string
): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>(
    `/api/v1/analyses/${encodeURIComponent(analysisId)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
}

export async function getAnalyses(): Promise<AnalysisResult[]> {
  return apiFetch<AnalysisResult[]>("/api/v1/analyses", {
    method: "GET",
    cache: "no-store",
  });
}

export async function getScenarios(): Promise<ScenarioDefinition[]> {
  return apiFetch<ScenarioDefinition[]>("/api/v1/analyses/scenarios", {
    method: "GET",
  });
}

export async function uploadAnalysisPcap(
  file: File,
  analysisName?: string
): Promise<CreateAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (analysisName) {
    formData.append("analysis_name", analysisName);
  }
  return apiFetch<CreateAnalysisResponse>("/api/v1/analyses/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getEnvironmentStatus(): Promise<{
  engine_mode: string;
  tshark_available: boolean;
  tshark_version?: string;
  tshark_binary: string;
  max_pcap_size_mb: number;
  timeout_seconds: number;
  supported_formats: string[];
}> {
  return apiFetch("/api/v1/analyses/environment", {
    method: "GET",
  });
}

export interface MLModelStatusResponse {
  status: string;
  model_name?: string;
  model_version?: string;
  algorithm?: string;
  dataset_version?: string;
  feature_count?: number;
  classes?: string[];
  abstention_threshold?: number;
  metrics?: {
    validation_macro_f1?: number;
    test_accuracy?: number;
    test_balanced_accuracy?: number;
    test_macro_f1?: number;
    test_weighted_f1?: number;
    confusion_matrix?: number[][];
    per_class_metrics?: Record<string, { precision: number; recall: number; f1_score: number; support: number }>;
    feature_importance?: Record<string, number>;
    candidate_comparisons?: Record<string, { accuracy: number; macro_f1: number }>;
  };
  created_at?: string;
  feature_names?: string[];
  message?: string;
}

export async function getActiveMLModel(): Promise<MLModelStatusResponse> {
  return apiFetch<MLModelStatusResponse>("/api/v1/analyses/ml/model", {
    method: "GET",
    cache: "no-store",
  });
}

export function getExecutiveReportUrl(analysisId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseUrl}/api/v1/analyses/${encodeURIComponent(analysisId)}/report/executive`;
}

export function getTechnicalReportUrl(analysisId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseUrl}/api/v1/analyses/${encodeURIComponent(analysisId)}/report/technical`;
}

export function getJsonReportUrl(analysisId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseUrl}/api/v1/analyses/${encodeURIComponent(analysisId)}/report/json`;
}

