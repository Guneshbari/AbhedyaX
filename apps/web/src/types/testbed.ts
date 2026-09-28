export type TrafficClass =
  | "ICMP"
  | "Web"
  | "Email"
  | "VoIP"
  | "Video"
  | "Messaging";

export type RunState =
  | "Idle"
  | "Preparing"
  | "Provisioning"
  | "Configuring VPN"
  | "Establishing Tunnel"
  | "Generating Traffic"
  | "Capturing Traffic"
  | "Validating"
  | "Completed"
  | "Failed"
  | "Cancelled";

export interface ScoreRange {
  min: number;
  max: number;
}

export interface ExpectedSecurity {
  score_range: ScoreRange;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  expected_findings: string[];
}

export interface TestbedScenario {
  scenario_id: string;
  name: string;
  description: string;
  ike_version: "IKEv1" | "IKEv2";
  mode: "Tunnel" | "Transport";
  ip_version: "IPv4" | "IPv6";
  encryption: string;
  authentication: string;
  dh_group: string;
  pfs: boolean;
  replay_protection: boolean;
  sa_lifetime_seconds: number;
  traffic_profiles: TrafficClass[];
  expected_security: ExpectedSecurity;
}

export interface TestbedEnvironmentStatus {
  is_linux: boolean;
  has_root: boolean;
  can_manage_netns: boolean;
  has_strongswan: boolean;
  has_tcpdump: boolean;
  has_tshark: boolean;
  strongswan_version?: string | null;
  tcpdump_version?: string | null;
  tshark_version?: string | null;
  default_mode: "real" | "simulation";
  active_runs: number;
  message: string;
}

export interface FieldCheck {
  field: string;
  expected: unknown;
  observed: unknown;
  match: boolean;
  details?: string | null;
}

export interface ValidationResult {
  scenario_id: string;
  run_id: string;
  passed: boolean;
  accuracy: number;
  total_checks: number;
  matched_checks: number;
  checks: FieldCheck[];
  analysis_id?: string | null;
}

export interface CaptureSessionMetadata {
  scenario_id: string;
  run_id: string;
  capture_file: string;
  file_format: string;
  file_size_bytes: number;
  packet_count: number;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  interface: string;
  traffic_profiles: string[];
}

export interface GroundTruthConfiguration {
  ike_version: string;
  mode: string;
  ip_version: string;
  encryption: string;
  authentication: string;
  dh_group: string;
  pfs: boolean;
  replay_protection: boolean;
  sa_lifetime_seconds: number;
}

export interface GroundTruthTraffic {
  class: TrafficClass;
  duration_seconds: number;
}

export interface GroundTruthRecord {
  scenario_id: string;
  generated_at: string;
  configuration: GroundTruthConfiguration;
  traffic: GroundTruthTraffic;
  capture: {
    file: string;
    format: string;
    packet_count: number;
  };
  expected_analysis: {
    protocol: string;
    ike_version: string;
    mode: string;
    ip_version: string;
    encryption: string;
    authentication: string;
    dh_group: string;
    pfs: boolean;
  };
}

export interface TestbedRun {
  run_id: string;
  scenario_id: string;
  scenario_name: string;
  execution_mode: "simulation" | "real";
  traffic_profile: TrafficClass;
  state: RunState;
  progress: number;
  step_description: string;
  started_at: string;
  completed_at?: string | null;
  error_message?: string | null;
  ground_truth?: GroundTruthRecord | null;
  capture_metadata?: CaptureSessionMetadata | null;
  validation_result?: ValidationResult | null;
  analysis_id?: string | null;
}

export interface TestbedRunCreatePayload {
  scenario_id: string;
  traffic_profile?: TrafficClass;
  execution_mode?: "simulation" | "real";
}
