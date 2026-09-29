/**
 * Client API functions for AbhedyaX Security Twin, Drift, Reasoning, and Posture.
 * Delegates seamlessly to the active DataProvider (Demo or API mode).
 */

import {
  SecurityTwin,
  DriftComparisonResult,
  MetadataExposureResult,
  AuditableReasoningResult,
  DemoComparisonPreset,
  PostureTimelineResult,
} from "@/types/securityTwin";
import { getActiveDataProvider } from "@/lib/providers";

export async function getSecurityTwin(analysisId: string): Promise<SecurityTwin> {
  return getActiveDataProvider().getSecurityTwin(analysisId);
}

export async function getAnalysisDrift(
  analysisId: string,
  baselineId: string = "AX-2026-00428"
): Promise<DriftComparisonResult> {
  return getActiveDataProvider().getDrift(baselineId, analysisId);
}

export async function compareAnalyses(
  baselineId: string,
  currentId: string
): Promise<DriftComparisonResult> {
  return getActiveDataProvider().getDrift(baselineId, currentId);
}

export async function getDemoComparisons(): Promise<DemoComparisonPreset[]> {
  return getActiveDataProvider().getDemoComparisons();
}

export async function getAnalysisMetadataExposure(
  analysisId: string
): Promise<MetadataExposureResult> {
  return getActiveDataProvider().getMetadataExposure(analysisId);
}

export async function getAnalysisReasoning(
  analysisId: string
): Promise<AuditableReasoningResult> {
  return getActiveDataProvider().getReasoning(analysisId);
}

export async function getPostureTimeline(): Promise<PostureTimelineResult> {
  return getActiveDataProvider().getPostureTimeline();
}
