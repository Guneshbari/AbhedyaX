/**
 * Demo Data Provider for AbhedyaX Prototype.
 * Provides deterministic, instant, local canonical scenario and USP data.
 * Requires zero network connectivity and zero external dependencies.
 */

import { DataProvider } from "./types";
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
import {
  CANONICAL_SCENARIOS,
  CANONICAL_ANALYSES_MAP,
  CANONICAL_ANALYSES_LIST,
  CANONICAL_DASHBOARD_DATA,
  getDemoSecurityTwin,
  CANONICAL_DEMO_COMPARISONS,
  getDemoDriftComparison,
  getDemoMetadataExposure,
  getDemoReasoning,
  getDemoPostureTimeline,
  DEMO_ML_MODEL_STATUS,
  DEMO_TESTBED_STATUS,
  DEMO_TESTBED_SCENARIOS,
  createDemoTestbedRun,
  getDemoReportHtml,
} from "@/demo";

export class DemoDataProvider implements DataProvider {
  public readonly name = "DemoDataProvider";
  public readonly mode = "demo" as const;

  public async checkHealth(): Promise<{
    status: string;
    engine_mode: string;
    tshark_available: boolean;
    uptime: number;
  }> {
    return {
      status: "ok",
      engine_mode: "demo",
      tshark_available: false,
      uptime: 86400,
    };
  }

  public async getEnvironmentStatus(): Promise<{
    engine_mode: string;
    tshark_available: boolean;
    tshark_version?: string;
    tshark_binary: string;
    max_pcap_size_mb: number;
    timeout_seconds: number;
    supported_formats: string[];
  }> {
    return {
      engine_mode: "demo",
      tshark_available: false,
      tshark_binary: "/usr/bin/tshark",
      max_pcap_size_mb: 50,
      timeout_seconds: 60,
      supported_formats: [".pcap", ".pcapng", ".cap"],
    };
  }

  public async getDashboardData(): Promise<DashboardData> {
    return CANONICAL_DASHBOARD_DATA;
  }

  public async getAnalyses(): Promise<AnalysisResult[]> {
    return CANONICAL_ANALYSES_LIST;
  }

  public async getAnalysis(analysisId: string): Promise<AnalysisResult> {
    const analysis = CANONICAL_ANALYSES_MAP[analysisId];
    if (analysis) {
      return analysis;
    }
    // Return baseline if requested ID not found in predefined map
    return CANONICAL_ANALYSES_MAP["AX-2026-00428"];
  }

  public async getAnalysisStatus(analysisId: string): Promise<AnalysisStatusResponse> {
    return {
      analysis_id: analysisId,
      status: "completed",
      progress: 100,
      current_step: "complete",
      message: "Analysis evaluation completed from deterministic demo dataset.",
    };
  }

  public async getScenarios(): Promise<ScenarioDefinition[]> {
    return CANONICAL_SCENARIOS;
  }

  public async createAnalysis(request: CreateAnalysisRequest): Promise<CreateAnalysisResponse> {
    let targetAnalysisId = "AX-2026-00428";
    if (request.scenario_id === "legacy-critical") {
      targetAnalysisId = "AX-2026-00427";
    } else if (request.scenario_id === "moderate-security") {
      targetAnalysisId = "AX-2026-00426";
    } else if (request.scenario_id === "secure-ipv6") {
      targetAnalysisId = "AX-2026-00425";
    } else if (request.scenario_id === "traffic-anomaly") {
      targetAnalysisId = "AX-2026-00424";
    } else if (request.scenario_id === "observed-pcap" || request.source_type === "pcap") {
      targetAnalysisId = "AX-2026-00423";
    }

    return {
      analysis_id: targetAnalysisId,
      status: "completed",
      source_type: request.source_type,
    };
  }

  public async uploadAnalysisPcap(
    file: File,
    name?: string
  ): Promise<CreateAnalysisResponse> {
    // In Demo Mode, map uploaded PCAP safely to the observed PCAP baseline
    return {
      analysis_id: "AX-2026-00423",
      status: "completed",
      source_type: "pcap",
    };
  }

  public async getSecurityTwin(analysisId: string): Promise<SecurityTwin> {
    return getDemoSecurityTwin(analysisId);
  }

  public async getDrift(
    baselineId: string,
    currentId: string
  ): Promise<DriftComparisonResult> {
    return getDemoDriftComparison(baselineId, currentId);
  }

  public async getDemoComparisons(): Promise<DemoComparisonPreset[]> {
    return CANONICAL_DEMO_COMPARISONS;
  }

  public async getMetadataExposure(analysisId: string): Promise<MetadataExposureResult> {
    return getDemoMetadataExposure(analysisId);
  }

  public async getReasoning(analysisId: string): Promise<AuditableReasoningResult> {
    return getDemoReasoning(analysisId);
  }

  public async getPostureTimeline(): Promise<PostureTimelineResult> {
    return getDemoPostureTimeline();
  }

  public async getActiveMLModel(): Promise<MLModelStatusResponse> {
    return DEMO_ML_MODEL_STATUS;
  }

  public async getTestbedStatus(): Promise<TestbedEnvironmentStatus> {
    return DEMO_TESTBED_STATUS;
  }

  public async getTestbedScenarios(): Promise<TestbedScenario[]> {
    return DEMO_TESTBED_SCENARIOS;
  }

  public async createTestbedRun(payload: TestbedRunCreatePayload): Promise<TestbedRun> {
    return createDemoTestbedRun(payload);
  }

  public async getTestbedRun(runId: string): Promise<TestbedRun> {
    return createDemoTestbedRun({
      scenario_id: "demo-enterprise-ikev2",
    });
  }

  public async cancelTestbedRun(
    runId: string
  ): Promise<{ run_id: string; status: string; message: string }> {
    return {
      run_id: runId,
      status: "cancelled",
      message: "Testbed execution cancelled successfully in Demo Mode.",
    };
  }

  public async getExecutiveReport(analysisId: string): Promise<string> {
    return getDemoReportHtml(analysisId, "executive");
  }

  public async getTechnicalReport(analysisId: string): Promise<string> {
    return getDemoReportHtml(analysisId, "technical");
  }

  public async getJsonReport(analysisId: string): Promise<AnalysisResult> {
    return this.getAnalysis(analysisId);
  }
}
