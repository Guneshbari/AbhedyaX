/**
 * TypeScript definitions for AbhedyaX Phase 6 USP Layer.
 */

export interface SecurityState {
  ipsec: boolean;
  ike_version: string | null;
  mode: string | null;
  ip_version: string | null;
  encryption: string | null;
  authentication: string | null;
  dh_group: string | number | null;
  pfs: boolean | null;
  replay_protection: boolean | null;
  sa_lifetime: number | null;
}

export interface AlignmentItem {
  property: string;
  expected: unknown;
  observed: unknown;
  status: "match" | "mismatch" | "unknown";
  evidence_ids: string[];
  impact_note?: string;
}

export interface TwinAlignment {
  overall: "aligned" | "partial" | "drifted" | "unknown";
  items: AlignmentItem[];
  matched_count: number;
  mismatched_count: number;
  unknown_count: number;
}

export interface TwinSecurityImpact {
  affected_properties: string[];
  finding_ids: string[];
  risk_score: number;
  risk: string;
  grade: string;
  remediation_advice: string[];
}

export interface TwinProvenance {
  expected_state: "GroundTruth" | "Simulated" | "Unknown";
  observed_state: "Observed" | "Inferred" | "Simulated";
}

export interface SecurityTwin {
  analysis_id: string;
  twin_id: string;
  mode: "simulation" | "observed" | "hybrid";
  expected_state: SecurityState;
  observed_state: SecurityState;
  alignment: TwinAlignment;
  security_impact: TwinSecurityImpact;
  provenance: TwinProvenance;
}

export type ChangeType = "strengthened" | "weakened" | "changed" | "added" | "removed" | "unchanged";
export type SeverityType = "informational" | "low" | "moderate" | "high" | "critical";

export interface DriftChange {
  property: string;
  before: unknown;
  after: unknown;
  change_type: ChangeType;
  severity: SeverityType;
  finding_id: string | null;
  reason?: string;
  evidence: string[];
}

export interface ComparisonCompatibility {
  compatible: boolean;
  reason: string;
}

export interface DriftSummary {
  total_changes: number;
  security_relevant_changes: number;
  strengthened_changes: number;
  weakened_changes: number;
}

export interface DriftSecurityImpact {
  baseline_score: number;
  current_score: number;
  score_delta: number;
  baseline_risk: string;
  current_risk: string;
  baseline_grade?: string;
  current_grade?: string;
}

export interface DriftComparisonResult {
  comparison_id: string;
  baseline_analysis_id: string;
  current_analysis_id: string;
  baseline_name?: string;
  current_name?: string;
  compatibility: ComparisonCompatibility;
  changes: DriftChange[];
  summary: DriftSummary;
  security_impact: DriftSecurityImpact;
  provenance: string;
}

export interface DemoComparisonPreset {
  id: string;
  name: string;
  description: string;
  baseline_id: string;
  current_id: string;
  expected_score_transition: string;
  key_takeaway: string;
}

export interface CompareAnalysesRequest {
  baseline_id: string;
  current_id: string;
}

export type ExposureLevel = "Low" | "Moderate" | "High" | "Unknown";

export interface MetadataExposureDimension {
  name: string;
  value: number;
  indicator: ExposureLevel;
  description: string;
  key_features: string[];
}

export interface MetadataExposureResult {
  analysis_id: string;
  indicator: ExposureLevel;
  score: number | null;
  dimensions: MetadataExposureDimension[];
  explanation: string;
  provenance: "Observed" | "Simulated" | "Inferred";
  features_summary: Record<string, unknown>;
  traffic_classification?: {
    predicted_class: string;
    confidence: number;
    classification_mode: string;
  };
  disclaimer: string;
}

export interface PostureTimelineEntry {
  analysis_id: string;
  timestamp: string;
  scenario: string;
  score: number;
  risk: string;
  grade: string;
  finding_count: number;
  configuration_summary: string;
  source: "PCAP" | "Simulation" | "Testbed";
  provenance: string;
  pfs: boolean;
  replay_protection: boolean;
  ike_version: string;
  encryption: string;
}

export interface PostureTransition {
  from_id: string;
  to_id: string;
  from_score: number;
  to_score: number;
  score_delta: number;
  risk_transition: string;
  grade_transition: string;
  key_changes: string[];
}

export interface PostureTimelineResult {
  timeline: PostureTimelineEntry[];
  transitions: PostureTransition[];
  total_sessions: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  risk_distribution: Record<string, number>;
  posture_summary: string;
  disclaimer: string;
}

export interface AuditableReasoningChain {
  id: string;
  finding_id: string;
  category: string;
  severity: string;
  evidence: string[];
  protocol_observation: string;
  finding_title: string;
  risk_rule_id: string;
  rule_description: string;
  deduction: number;
  score_before: number;
  score_after: number;
  risk_band_after: string;
  grade_after: string;
  recommendation: string;
  provenance: string;
}

export interface AuditableReasoningResult {
  analysis_id: string;
  base_score: number;
  final_score: number;
  final_risk: string;
  final_grade: string;
  total_deduction: number;
  chains: AuditableReasoningChain[];
  anti_double_counting_applied: boolean;
  methodology_version: string;
}
