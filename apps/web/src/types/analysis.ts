export type SourceType = "simulation" | "pcap" | "live";
export type AnalysisStatusType = "queued" | "processing" | "completed" | "failed";
export type RiskLevelType = "Low" | "Moderate" | "Medium" | "High" | "Critical";
export type GradeType = "A" | "B" | "C" | "D" | "F";
export type FindingSeverityType = "Critical" | "High" | "Medium" | "Low" | "Informational";
export type FindingCategoryType =
  | "Cryptography"
  | "Key Exchange"
  | "Authentication"
  | "PFS"
  | "Replay Protection"
  | "Configuration"
  | "Metadata Exposure"
  | "Traffic Intelligence"
  | "Protocol";

export type EvidenceProvenanceSource =
  | "Observed"
  | "Inferred"
  | "Simulated"
  | "GroundTruth"
  | "MLPrediction";

export interface EvidenceProvenanceItem {
  id: string;
  source_type: EvidenceProvenanceSource;
  field: string;
  value: string;
  packet_ref?: string | null;
  description: string;
  confidence: number;
}

export interface ScoringDeduction {
  finding_id: string;
  category: string;
  severity: string;
  deduction: number;
  reason: string;
  evidence_ref?: string | null;
}

export interface RiskScoringResult {
  security_score: number;
  risk_level: RiskLevelType;
  base_score: number;
  total_deduction: number;
  scoring_breakdown: ScoringDeduction[];
  methodology_version: string;
  formula: string;
}

export interface ValidationMismatch {
  field: string;
  observed: string;
  expected: string;
  notes?: string;
}

export interface GroundTruthValidationResult {
  status: "passed" | "failed" | "unverified";
  ground_truth_available: boolean;
  scenario_matched?: string | null;
  matched_fields: number;
  total_fields: number;
  mismatches: ValidationMismatch[];
}

export interface CreateAnalysisRequest {
  source_type: "simulation" | "pcap";
  scenario_id?: string | null;
  file_name?: string | null;
}

export interface CreateAnalysisResponse {
  analysis_id: string;
  status: AnalysisStatusType;
  source_type: "simulation" | "pcap";
}

export interface AnalysisStatusResponse {
  analysis_id: string;
  status: AnalysisStatusType;
  progress: number;
  current_step: string;
  message: string;
}

export interface AnalysisSource {
  type: SourceType;
  name: string;
  file_name?: string | null;
}

export interface VPNConfiguration {
  protocol: string;
  ike_version: "IKEv1" | "IKEv2" | "Unknown" | string;
  mode: "Tunnel" | "Transport" | "Unknown" | string;
  ip_version: "IPv4" | "IPv6" | "Dual-Stack" | "Unknown" | string;
  nat_traversal: boolean;
  protocols_detected: string[];
}

export interface CryptographyConfiguration {
  encryption: string;
  authentication: string;
  dh_group: string;
  pfs: boolean;
}

export interface SecurityAssessment {
  score: number;
  grade: GradeType;
  risk_level: RiskLevelType;
  replay_protection: boolean;
  sa_lifetime_seconds: number;
}

export interface TrafficCandidateClass {
  class: string;
  confidence: number;
}

export interface TrafficFeatures {
  packet_size_pattern?: string;
  directionality?: string;
  inter_arrival_pattern?: string;
  session_duration_seconds?: number;
  [key: string]: unknown;
}

export interface SupportingFeature {
  feature: string;
  value: number;
  importance: number;
}

export interface TrafficIntelligence {
  predicted_class: string;
  traffic_class?: string;
  confidence: number;
  candidate_classes: TrafficCandidateClass[];
  features?: TrafficFeatures;
  model?: {
    name: string;
    version: string;
  };
  explanation?: SupportingFeature[];
  classification_mode?: "ml" | "simulated" | "unknown";
  reasoning?: string[];
}

export interface SecurityFinding {
  id: string;
  severity: FindingSeverityType;
  category: FindingCategoryType;
  title: string;
  description: string;
  evidence: string[];
  recommendation: string;
  confidence: number;
  provenance?: EvidenceProvenanceSource;
}

export interface FindingsSummary {
  total_findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}

export interface CaptureMetadata {
  file_name: string;
  file_size_bytes: number;
  packet_count: number;
  duration_seconds: number;
  first_packet_time?: string | null;
  last_packet_time?: string | null;
}

export interface ProtocolObservations {
  ike_sessions: number;
  esp_sessions: number;
  ah_sessions: number;
  nat_traversal_detected: boolean;
  observed_spis: string[];
}

export interface ProtocolEvidence {
  source: string;
  field: string;
  value: string;
  packet_numbers: number[];
}

export interface ScoreFactor {
  category: string;
  weight: number;
  score: number;
  description: string;
}

export interface AnalysisResult {
  analysis_id: string;
  status: AnalysisStatusType;
  created_at: string;
  completed_at?: string | null;
  source: AnalysisSource;
  vpn: VPNConfiguration;
  cryptography: CryptographyConfiguration;
  security: SecurityAssessment;
  traffic: TrafficIntelligence;
  findings: SecurityFinding[];
  summary: FindingsSummary;
  engine_type?: string;
  capture_metadata?: CaptureMetadata;
  protocol_observations?: ProtocolObservations;
  evidence?: ProtocolEvidence[];
  score_factors?: ScoreFactor[];
  risk_scoring?: RiskScoringResult;
  evidence_provenance?: EvidenceProvenanceItem[];
  validation?: GroundTruthValidationResult;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  vpn: {
    protocol: string;
    ike_version: "IKEv1" | "IKEv2";
    mode: "Tunnel" | "Transport";
    ip_version: "IPv4" | "IPv6";
    nat_traversal: boolean;
  };
  cryptography: {
    encryption: string;
    authentication: string;
    dh_group: string;
    pfs: boolean;
  };
  security: {
    score: number;
    grade: GradeType;
    risk_level: RiskLevelType;
    replay_protection: boolean;
    sa_lifetime_seconds: number;
  };
  traffic: {
    predicted_class: string;
    confidence: number;
  };
}
