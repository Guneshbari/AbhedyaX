import {
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  AnalysisStatusResponse,
  AnalysisResult,
  ScenarioDefinition,
} from "@/types/analysis";
import { getActiveDataProvider, getEffectiveDataMode } from "@/lib/providers";

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

export async function createAnalysis(
  request: CreateAnalysisRequest
): Promise<CreateAnalysisResponse> {
  return getActiveDataProvider().createAnalysis(request);
}

export async function getAnalysisStatus(
  analysisId: string
): Promise<AnalysisStatusResponse> {
  return getActiveDataProvider().getAnalysisStatus(analysisId);
}

export async function getAnalysisResult(
  analysisId: string
): Promise<AnalysisResult> {
  return getActiveDataProvider().getAnalysis(analysisId);
}

export async function getAnalyses(): Promise<AnalysisResult[]> {
  return getActiveDataProvider().getAnalyses();
}

export async function getScenarios(): Promise<ScenarioDefinition[]> {
  return getActiveDataProvider().getScenarios();
}

export async function uploadAnalysisPcap(
  file: File,
  analysisName?: string
): Promise<CreateAnalysisResponse> {
  return getActiveDataProvider().uploadAnalysisPcap(file, analysisName);
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
  return getActiveDataProvider().getEnvironmentStatus();
}

export async function getActiveMLModel(): Promise<MLModelStatusResponse> {
  return getActiveDataProvider().getActiveMLModel();
}

export function getExecutiveReportUrl(analysisId: string): string {
  if (getEffectiveDataMode() === "demo") {
    return `/reports/standalone?analysisId=${encodeURIComponent(analysisId)}&type=executive`;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseUrl}/api/v1/analyses/${encodeURIComponent(analysisId)}/report/executive`;
}

export function getTechnicalReportUrl(analysisId: string): string {
  if (getEffectiveDataMode() === "demo") {
    return `/reports/standalone?analysisId=${encodeURIComponent(analysisId)}&type=technical`;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseUrl}/api/v1/analyses/${encodeURIComponent(analysisId)}/report/technical`;
}

export function getJsonReportUrl(analysisId: string): string {
  if (getEffectiveDataMode() === "demo") {
    return `/reports/standalone?analysisId=${encodeURIComponent(analysisId)}&type=executive`;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseUrl}/api/v1/analyses/${encodeURIComponent(analysisId)}/report/json`;
}
