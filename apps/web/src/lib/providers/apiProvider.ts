/**
 * API Data Provider for AbhedyaX Platform.
 * Communicates with the FastAPI backend service when available, with
 * resilient instant fallback to canonical demo datasets if unreachable.
 */

import { DataProvider } from "./types";
import { apiFetch } from "@/lib/api/client";
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

async function withApiFallback<T>(
  apiFn: () => Promise<T>,
  fallbackFn: () => Promise<T> | T,
  timeoutMs: number = 1500
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("API request timed out")), timeoutMs);
    });
    const result = await Promise.race([apiFn(), timeoutPromise]);
    if (timer) clearTimeout(timer);
    return result;
  } catch (err) {
    if (timer) clearTimeout(timer);
    // Silent recovery: Serve canonical demo data immediately with 0 waiting time
    return await fallbackFn();
  }
}

export class ApiDataProvider implements DataProvider {
  public readonly name = "ApiDataProvider";
  public readonly mode = "api" as const;

  public async checkHealth(): Promise<{
    status: string;
    engine_mode?: string;
    tshark_available?: boolean;
    uptime?: number;
  }> {
    return withApiFallback(
      () =>
        apiFetch<{
          status: string;
          engine_mode?: string;
          tshark_available?: boolean;
          uptime?: number;
        }>("/health", { method: "GET", cache: "no-store" }),
      () => ({
        status: "ok",
        engine_mode: "mock",
        tshark_available: false,
        uptime: 86400,
      })
    );
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
    return withApiFallback(
      () =>
        apiFetch("/api/v1/analyses/environment", {
          method: "GET",
          cache: "no-store",
        }),
      () => ({
        engine_mode: "demo",
        tshark_available: false,
        tshark_binary: "/usr/bin/tshark",
        max_pcap_size_mb: 50,
        timeout_seconds: 60,
        supported_formats: [".pcap", ".pcapng", ".cap"],
      })
    );
  }

  public async getDashboardData(): Promise<DashboardData> {
    return withApiFallback(
      async () => {
        const analyses = await this.getAnalyses();
        if (analyses && analyses.length > 0) {
          return {
            ...CANONICAL_DASHBOARD_DATA,
            recentAnalyses: analyses.map((a) => ({
              id: a.analysis_id,
              sourceName: a.source.file_name || a.source.name,
              sourceType: a.source.type,
              vpnProtocol: a.vpn.ike_version,
              vpnMode: (a.vpn.mode === "Transport" ? "Transport" : "Tunnel") as "Tunnel" | "Transport",
              ipVersion: (a.vpn.ip_version === "IPv6" ? "IPv6" : "IPv4") as "IPv4" | "IPv6",
              encryption: a.cryptography.encryption,
              authentication: a.cryptography.authentication,
              dhGroup: a.cryptography.dh_group,
              pfsEnabled: a.cryptography.pfs,
              securityScore: a.security.score,
              grade: a.security.grade,
              riskLevel: a.security.risk_level,
              status: a.security.score >= 90 ? "completed" : a.security.score >= 50 ? "warning" : "failed",
              createdAt: a.created_at,
            })),
          };
        }
        return CANONICAL_DASHBOARD_DATA;
      },
      () => CANONICAL_DASHBOARD_DATA
    );
  }

  public async getAnalyses(): Promise<AnalysisResult[]> {
    return withApiFallback(
      () =>
        apiFetch<AnalysisResult[]>("/api/v1/analyses", {
          method: "GET",
          cache: "no-store",
        }),
      () => CANONICAL_ANALYSES_LIST
    );
  }

  public async getAnalysis(analysisId: string): Promise<AnalysisResult> {
    return withApiFallback(
      () =>
        apiFetch<AnalysisResult>(
          `/api/v1/analyses/${encodeURIComponent(analysisId)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        ),
      () => CANONICAL_ANALYSES_MAP[analysisId] || CANONICAL_ANALYSES_MAP["AX-2026-00428"]
    );
  }

  public async getAnalysisStatus(analysisId: string): Promise<AnalysisStatusResponse> {
    return withApiFallback(
      () =>
        apiFetch<AnalysisStatusResponse>(
          `/api/v1/analyses/${encodeURIComponent(analysisId)}/status`,
          {
            method: "GET",
            cache: "no-store",
          }
        ),
      () => ({
        analysis_id: analysisId,
        status: "completed",
        progress: 100,
        current_step: "complete",
        message: "Analysis evaluation completed.",
      })
    );
  }

  public async getScenarios(): Promise<ScenarioDefinition[]> {
    return withApiFallback(
      () =>
        apiFetch<ScenarioDefinition[]>("/api/v1/analyses/scenarios", {
          method: "GET",
          cache: "no-store",
        }),
      () => CANONICAL_SCENARIOS
    );
  }

  public async createAnalysis(request: CreateAnalysisRequest): Promise<CreateAnalysisResponse> {
    return withApiFallback(
      () =>
        apiFetch<CreateAnalysisResponse>("/api/v1/analyses", {
          method: "POST",
          body: JSON.stringify(request),
        }),
      () => {
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
    );
  }

  public async uploadAnalysisPcap(
    file: File,
    name?: string
  ): Promise<CreateAnalysisResponse> {
    return withApiFallback(
      () => {
        const formData = new FormData();
        formData.append("file", file);
        if (name) {
          formData.append("analysis_name", name);
        }
        return apiFetch<CreateAnalysisResponse>("/api/v1/analyses/upload", {
          method: "POST",
          body: formData,
        });
      },
      () => ({
        analysis_id: "AX-2026-00423",
        status: "completed",
        source_type: "pcap",
      })
    );
  }

  public async getSecurityTwin(analysisId: string): Promise<SecurityTwin> {
    return withApiFallback(
      () =>
        apiFetch<SecurityTwin>(
          `/api/v1/analyses/${encodeURIComponent(analysisId)}/security-twin`,
          {
            method: "GET",
            cache: "no-store",
          }
        ),
      () => getDemoSecurityTwin(analysisId)
    );
  }

  public async getDrift(
    baselineId: string,
    currentId: string
  ): Promise<DriftComparisonResult> {
    return withApiFallback(
      () =>
        apiFetch<DriftComparisonResult>("/api/v1/security-twin/compare", {
          method: "POST",
          body: JSON.stringify({ baseline_id: baselineId, current_id: currentId }),
          cache: "no-store",
        }),
      () => getDemoDriftComparison(baselineId, currentId)
    );
  }

  public async getDemoComparisons(): Promise<DemoComparisonPreset[]> {
    return withApiFallback(
      () =>
        apiFetch<DemoComparisonPreset[]>("/api/v1/security-twin/demo-comparisons", {
          method: "GET",
          cache: "no-store",
        }),
      () => CANONICAL_DEMO_COMPARISONS
    );
  }

  public async getMetadataExposure(analysisId: string): Promise<MetadataExposureResult> {
    return withApiFallback(
      () =>
        apiFetch<MetadataExposureResult>(
          `/api/v1/analyses/${encodeURIComponent(analysisId)}/metadata-exposure`,
          {
            method: "GET",
            cache: "no-store",
          }
        ),
      () => getDemoMetadataExposure(analysisId)
    );
  }

  public async getReasoning(analysisId: string): Promise<AuditableReasoningResult> {
    return withApiFallback(
      () =>
        apiFetch<AuditableReasoningResult>(
          `/api/v1/analyses/${encodeURIComponent(analysisId)}/reasoning`,
          {
            method: "GET",
            cache: "no-store",
          }
        ),
      () => getDemoReasoning(analysisId)
    );
  }

  public async getPostureTimeline(): Promise<PostureTimelineResult> {
    return withApiFallback(
      () =>
        apiFetch<PostureTimelineResult>("/api/v1/security-twin/posture-timeline", {
          method: "GET",
          cache: "no-store",
        }),
      () => getDemoPostureTimeline()
    );
  }

  public async getActiveMLModel(): Promise<MLModelStatusResponse> {
    return withApiFallback(
      () =>
        apiFetch<MLModelStatusResponse>("/api/v1/analyses/ml/model", {
          method: "GET",
          cache: "no-store",
        }),
      () => DEMO_ML_MODEL_STATUS
    );
  }

  public async getTestbedStatus(): Promise<TestbedEnvironmentStatus> {
    return withApiFallback(
      () =>
        apiFetch<TestbedEnvironmentStatus>("/api/v1/testbed/status", {
          method: "GET",
          cache: "no-store",
        }),
      () => DEMO_TESTBED_STATUS
    );
  }

  public async getTestbedScenarios(): Promise<TestbedScenario[]> {
    return withApiFallback(
      () =>
        apiFetch<TestbedScenario[]>("/api/v1/testbed/scenarios", {
          method: "GET",
          cache: "no-store",
        }),
      () => DEMO_TESTBED_SCENARIOS
    );
  }

  public async createTestbedRun(payload: TestbedRunCreatePayload): Promise<TestbedRun> {
    return withApiFallback(
      () =>
        apiFetch<TestbedRun>("/api/v1/testbed/runs", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      () => createDemoTestbedRun(payload)
    );
  }

  public async getTestbedRun(runId: string): Promise<TestbedRun> {
    return withApiFallback(
      () =>
        apiFetch<TestbedRun>(
          `/api/v1/testbed/runs/${encodeURIComponent(runId)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        ),
      () =>
        createDemoTestbedRun({
          scenario_id: "demo-enterprise-ikev2",
        })
    );
  }

  public async cancelTestbedRun(
    runId: string
  ): Promise<{ run_id: string; status: string; message: string }> {
    return withApiFallback(
      () =>
        apiFetch<{ run_id: string; status: string; message: string }>(
          `/api/v1/testbed/runs/${encodeURIComponent(runId)}/cancel`,
          {
            method: "POST",
          }
        ),
      () => ({
        run_id: runId,
        status: "cancelled",
        message: "Testbed execution cancelled.",
      })
    );
  }

  public async getExecutiveReport(analysisId: string): Promise<string> {
    return withApiFallback(
      async () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/v1/analyses/${encodeURIComponent(analysisId)}/report/executive`);
        return res.text();
      },
      () => getDemoReportHtml(analysisId, "executive")
    );
  }

  public async getTechnicalReport(analysisId: string): Promise<string> {
    return withApiFallback(
      async () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/v1/analyses/${encodeURIComponent(analysisId)}/report/technical`);
        return res.text();
      },
      () => getDemoReportHtml(analysisId, "technical")
    );
  }

  public async getJsonReport(analysisId: string): Promise<AnalysisResult> {
    return withApiFallback(
      () =>
        apiFetch<AnalysisResult>(
          `/api/v1/analyses/${encodeURIComponent(analysisId)}/report/json`,
          {
            method: "GET",
            cache: "no-store",
          }
        ),
      () => CANONICAL_ANALYSES_MAP[analysisId] || CANONICAL_ANALYSES_MAP["AX-2026-00428"]
    );
  }
}
