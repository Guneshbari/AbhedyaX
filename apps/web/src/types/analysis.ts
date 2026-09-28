export type SourceType = "simulation" | "pcap" | "live";
export type AnalysisStatusType = "queued" | "processing" | "completed" | "failed";
export type RiskLevelType = "Low" | "Medium" | "High" | "Critical";
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
  | "Protocol";

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
  ike_version: "IKEv1" | "IKEv2";
  mode: "Tunnel" | "Transport";
  ip_version: "IPv4" | "IPv6";
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
  packet_size_pattern: string;
  directionality: string;
  inter_arrival_pattern: string;
  session_duration_seconds: number;
}

export interface TrafficIntelligence {
  predicted_class: string;
  confidence: number;
  candidate_classes: TrafficCandidateClass[];
  features?: TrafficFeatures;
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
}

export interface FindingsSummary {
  total_findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
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
