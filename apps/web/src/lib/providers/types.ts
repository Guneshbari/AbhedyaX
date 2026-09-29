/**
 * Data Provider Types and Interface for AbhedyaX Frontend.
 * Unified abstraction supporting both DemoDataProvider and ApiDataProvider.
 */

import {
  AnalysisResult,
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  AnalysisStatusResponse,
  ScenarioDefinition,
} from "@/types/analysis";
import { DashboardData } from "@/types/dashboard";
import {
  SecurityTwin,
  DriftComparisonResult,
  MetadataExposureResult,
  AuditableReasoningResult,
  PostureTimelineResult,
  DemoComparisonPreset,
} from "@/types/securityTwin";
import {
  TestbedEnvironmentStatus,
  TestbedScenario,
  TestbedRun,
  TestbedRunCreatePayload,
} from "@/types/testbed";
import { MLModelStatusResponse } from "@/lib/api/analyses";

export type DataMode = "demo" | "api" | "auto";
export type EffectiveMode = "demo" | "api";

export interface DataProvider {
  name: string;
  mode: DataMode;

  // Health & Environment Diagnostics
  checkHealth(): Promise<{
    status: string;
    engine_mode?: string;
    tshark_available?: boolean;
    uptime?: number;
  }>;
  getEnvironmentStatus(): Promise<{
    engine_mode: string;
    tshark_available: boolean;
    tshark_version?: string;
    tshark_binary: string;
    max_pcap_size_mb: number;
    timeout_seconds: number;
    supported_formats: string[];
  }>;

  // Dashboard & Analyses
  getDashboardData(): Promise<DashboardData>;
  getAnalyses(): Promise<AnalysisResult[]>;
  getAnalysis(analysisId: string): Promise<AnalysisResult>;
  getAnalysisStatus(analysisId: string): Promise<AnalysisStatusResponse>;
  getScenarios(): Promise<ScenarioDefinition[]>;
  createAnalysis(request: CreateAnalysisRequest): Promise<CreateAnalysisResponse>;
  uploadAnalysisPcap(file: File, name?: string): Promise<CreateAnalysisResponse>;

  // USP Features
  getSecurityTwin(analysisId: string): Promise<SecurityTwin>;
  getDrift(baselineId: string, currentId: string): Promise<DriftComparisonResult>;
  getDemoComparisons(): Promise<DemoComparisonPreset[]>;
  getMetadataExposure(analysisId: string): Promise<MetadataExposureResult>;
  getReasoning(analysisId: string): Promise<AuditableReasoningResult>;
  getPostureTimeline(): Promise<PostureTimelineResult>;

  // AI Encrypted Traffic Intelligence
  getActiveMLModel(): Promise<MLModelStatusResponse>;

  // strongSwan Testbed Subsystem
  getTestbedStatus(): Promise<TestbedEnvironmentStatus>;
  getTestbedScenarios(): Promise<TestbedScenario[]>;
  createTestbedRun(payload: TestbedRunCreatePayload): Promise<TestbedRun>;
  getTestbedRun(runId: string): Promise<TestbedRun>;
  cancelTestbedRun(runId: string): Promise<{ run_id: string; status: string; message: string }>;

  // Reports
  getExecutiveReport(analysisId: string): Promise<string>;
  getTechnicalReport(analysisId: string): Promise<string>;
  getJsonReport(analysisId: string): Promise<AnalysisResult>;
}

export interface DataProviderContextValue {
  provider: DataProvider;
  mode: DataMode;
  effectiveMode: EffectiveMode;
  isApiAvailable: boolean;
  statusMessage: string;
  setMode: (mode: DataMode) => void;
  recheckConnectivity: () => Promise<void>;
}
