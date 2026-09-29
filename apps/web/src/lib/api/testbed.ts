/**
 * Client API functions for strongSwan Testbed Subsystem.
 * Delegates seamlessly to the active DataProvider (Demo or API mode).
 */

import {
  TestbedEnvironmentStatus,
  TestbedRun,
  TestbedRunCreatePayload,
  TestbedScenario,
} from "@/types/testbed";
import { getActiveDataProvider } from "@/lib/providers";

export async function getTestbedStatus(): Promise<TestbedEnvironmentStatus> {
  return getActiveDataProvider().getTestbedStatus();
}

export async function getTestbedScenarios(): Promise<TestbedScenario[]> {
  return getActiveDataProvider().getTestbedScenarios();
}

export async function createTestbedRun(
  payload: TestbedRunCreatePayload
): Promise<TestbedRun> {
  return getActiveDataProvider().createTestbedRun(payload);
}

export async function getTestbedRun(runId: string): Promise<TestbedRun> {
  return getActiveDataProvider().getTestbedRun(runId);
}

export async function cancelTestbedRun(
  runId: string
): Promise<{ run_id: string; status: string; message: string }> {
  return getActiveDataProvider().cancelTestbedRun(runId);
}
