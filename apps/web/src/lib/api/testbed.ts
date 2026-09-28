import { apiFetch } from "./client";
import {
  TestbedEnvironmentStatus,
  TestbedRun,
  TestbedRunCreatePayload,
  TestbedScenario,
} from "@/types/testbed";

export async function getTestbedStatus(): Promise<TestbedEnvironmentStatus> {
  return apiFetch<TestbedEnvironmentStatus>("/api/v1/testbed/status", {
    method: "GET",
    cache: "no-store",
  });
}

export async function getTestbedScenarios(): Promise<TestbedScenario[]> {
  return apiFetch<TestbedScenario[]>("/api/v1/testbed/scenarios", {
    method: "GET",
    cache: "no-store",
  });
}

export async function createTestbedRun(
  payload: TestbedRunCreatePayload
): Promise<TestbedRun> {
  return apiFetch<TestbedRun>("/api/v1/testbed/runs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTestbedRun(runId: string): Promise<TestbedRun> {
  return apiFetch<TestbedRun>(`/api/v1/testbed/runs/${encodeURIComponent(runId)}`, {
    method: "GET",
    cache: "no-store",
  });
}

export async function cancelTestbedRun(
  runId: string
): Promise<{ run_id: string; status: string; message: string }> {
  return apiFetch<{ run_id: string; status: string; message: string }>(
    `/api/v1/testbed/runs/${encodeURIComponent(runId)}/cancel`,
    {
      method: "POST",
    }
  );
}
