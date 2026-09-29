/**
 * AbhedyaX Judge Demo Execution Engine.
 *
 * Deterministic, frontend-only state machine that orchestrates the 8-stage
 * guided demo for SIH judge evaluation. All data is sourced from canonical
 * demo fixtures — no backend, no network I/O, no strongSwan required.
 *
 * Stage Pipeline:
 *   1. INPUT & SCENARIO
 *   2. PACKET ANALYSIS
 *   3. PROTOCOL & FLOW EXTRACTION
 *   4. VPN SECURITY ANALYSIS
 *   5. AI TRAFFIC INTELLIGENCE
 *   6. SECURITY ASSESSMENT
 *   7. SECURITY TWIN & DRIFT
 *   8. METADATA, POSTURE & REPORT
 */

import {
  CANONICAL_SCENARIOS,
  CANONICAL_ANALYSES_MAP,
  CANONICAL_DEMO_COMPARISONS,
  getDemoSecurityTwin,
  getDemoDriftComparison,
  getDemoMetadataExposure,
  getDemoPostureTimeline,
  getDemoReasoning,
  DEMO_ML_MODEL_STATUS,
} from "@/demo";
import { AnalysisResult, ScenarioDefinition } from "@/types/analysis";

// Re-export so consumers can import from this single module
export { CANONICAL_SCENARIOS } from "@/demo";


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DemoStageKey =
  | "input"
  | "packet-analysis"
  | "normalization-flow"
  | "vpn-analysis"
  | "ai-intelligence"
  | "security-assessment"
  | "security-twin-drift"
  | "metadata-posture-report";

export type StageStatus = "locked" | "ready" | "running" | "validating" | "completed" | "failed";

export interface StageDefinition {
  number: number;
  key: DemoStageKey;
  title: string;
  shortTitle: string;
  purpose: string;
  judgeQuestion: string;
  primaryAction: string;
  secondaryAction?: string | string[];
  /** Route to open when judge clicks "Open View" */
  openViewRoute?: string;
}

export interface ExecutionLogEntry {
  id: string;
  text: string;
  done: boolean;
  type: "info" | "success" | "warn" | "pass";
}

export interface ValidationResult {
  label: string;
  passed: boolean;
}

/** Scenario mapping: canonical ID → analysis ID */
export const SCENARIO_TO_ANALYSIS: Record<string, string> = {
  "secure-enterprise": "AX-2026-00428",
  "legacy-critical": "AX-2026-00427",
  "moderate-security": "AX-2026-00426",
  "secure-ipv6": "AX-2026-00425",
  "traffic-anomaly": "AX-2026-00424",
  "baseline-compliant": "AX-2026-00423",
};

/** Analysis ID → scenario key */
export const ANALYSIS_TO_SCENARIO: Record<string, string> = Object.fromEntries(
  Object.entries(SCENARIO_TO_ANALYSIS).map(([k, v]) => [v, k])
);

// ---------------------------------------------------------------------------
// Stage Definitions
// ---------------------------------------------------------------------------

export const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    number: 1,
    key: "input",
    title: "INPUT & SCENARIO",
    shortTitle: "INPUT",
    purpose:
      "Establish the VPN scenario that will be analyzed. AbhedyaX loads the ground truth configuration and prepares the canonical demo capture.",
    judgeQuestion: "What is AbhedyaX analyzing?",
    primaryAction: "RUN INPUT STAGE",
    openViewRoute: "/analyses",
  },
  {
    number: 2,
    key: "packet-analysis",
    title: "PACKET ANALYSIS",
    shortTitle: "PACKET ANALYSIS",
    purpose:
      "Simulate TShark packet dissection of encrypted VPN traffic. Outer IP headers and IKE/ESP/AH protocol layers are extracted. Inner payload content is never decrypted.",
    judgeQuestion: "How does AbhedyaX understand the traffic?",
    primaryAction: "RUN PACKET ANALYSIS",
    secondaryAction: "OPEN ANALYSIS VIEW",
    openViewRoute: "/analyses",
  },
  {
    number: 3,
    key: "normalization-flow",
    title: "PROTOCOL & FLOW EXTRACTION",
    shortTitle: "EXTRACTION",
    purpose:
      "Transform raw packet observations into normalized protocol features and encrypted-flow metadata. Timing, packet-size, directionality, and burst characteristics are quantified without accessing payload content.",
    judgeQuestion: "What information can be extracted from encrypted traffic?",
    primaryAction: "EXTRACT FEATURES",
    openViewRoute: "/metadata-exposure",
  },
  {
    number: 4,
    key: "vpn-analysis",
    title: "VPN SECURITY ANALYSIS",
    shortTitle: "VPN ANALYSIS",
    purpose:
      "Identify the observed IPsec/IKE security posture: IKE version, cipher suite, DH group, PFS state, replay protection, and SA lifetime. This produces the observed security state consumed by the Security Engine.",
    judgeQuestion: "What security configuration does the VPN actually use?",
    primaryAction: "RUN VPN SECURITY ANALYSIS",
    secondaryAction: "OPEN VPN ANALYSIS",
    openViewRoute: "/analyses",
  },
  {
    number: 5,
    key: "ai-intelligence",
    title: "AI TRAFFIC INTELLIGENCE",
    shortTitle: "AI INTELLIGENCE",
    purpose:
      "Classify encrypted traffic using metadata-only machine learning — no payload decryption. The Random Forest classifier evaluates packet-size patterns, timing, directionality, and burst dynamics to infer the underlying traffic type.",
    judgeQuestion: "Can AbhedyaX infer traffic type without decrypting the payload?",
    primaryAction: "RUN AI CLASSIFICATION",
    secondaryAction: "OPEN AI INTELLIGENCE",
    openViewRoute: "/ai-intelligence",
  },
  {
    number: 6,
    key: "security-assessment",
    title: "SECURITY ASSESSMENT",
    shortTitle: "SECURITY ENGINE",
    purpose:
      "Convert observed security facts into deterministic findings, deductions, and a risk score using the canonical AbhedyaX scoring formula: Score = max(0, 100 − Σdeductions). Risk bands: Low 90–100, Moderate 75–89, High 50–74, Critical 0–49.",
    judgeQuestion: "How does AbhedyaX decide whether the VPN is secure?",
    primaryAction: "RUN SECURITY ASSESSMENT",
    secondaryAction: "OPEN FINDINGS",
    openViewRoute: "/analyses",
  },
  {
    number: 7,
    key: "security-twin-drift",
    title: "SECURITY TWIN & DRIFT",
    shortTitle: "SECURITY TWIN",
    purpose:
      "Build the Security Twin by comparing the intended (expected) security configuration against the observed state. Configuration Drift is computed as the score delta between baseline and current analysis, isolating exactly which parameters changed and what security impact they created.",
    judgeQuestion: "What changed, and what security impact did that change create?",
    primaryAction: "COMPARE SECURITY POSTURE",
    secondaryAction: "OPEN SECURITY TWIN",
    openViewRoute: "/security-twin",
  },
  {
    number: 8,
    key: "metadata-posture-report",
    title: "METADATA, POSTURE & REPORT",
    shortTitle: "FINAL INSIGHTS",
    purpose:
      "Complete the analysis pipeline: encrypted traffic metadata exposure, security posture timeline update, auditable reasoning chain construction, and executive + technical report generation. No payload content is ever used.",
    judgeQuestion: "What does AbhedyaX finally deliver to the analyst?",
    primaryAction: "COMPLETE ANALYSIS",
    secondaryAction: [
      "OPEN METADATA EXPOSURE",
      "OPEN POSTURE TIMELINE",
      "VIEW REPORT",
    ],
    openViewRoute: "/reports",
  },
];

// ---------------------------------------------------------------------------
// Per-stage execution log and validation specs
// ---------------------------------------------------------------------------

export const STAGE_EXECUTION_STEPS: Record<DemoStageKey, string[]> = {
  "input": [
    "Loading scenario configuration...",
    "Loading synthetic demo capture...",
    "Loading ground truth parameters...",
    "Validating expected configuration...",
    "Scenario validated ✓",
  ],
  "packet-analysis": [
    "Opening PCAP descriptor...",
    "TShark protocol dissection...",
    "Scanning IKE_SA_INIT exchanges...",
    "Scanning ESP/AH encapsulated frames...",
    "Extracting observable IP headers...",
    "Payload decryption: NOT PERFORMED",
    "Packet inventory complete ✓",
  ],
  "normalization-flow": [
    "Normalizing packet observations...",
    "Parsing IKE negotiation fields...",
    "Extracting SA parameters...",
    "Reconstructing encrypted flows...",
    "Computing timing statistics...",
    "Computing packet-size distribution...",
    "Computing directionality ratio...",
    "Feature vector ready ✓",
  ],
  "vpn-analysis": [
    "Analyzing IKE negotiation...",
    "Evaluating IKE version...",
    "Evaluating cryptographic parameters...",
    "Checking DH group strength...",
    "Checking PFS status...",
    "Checking anti-replay window...",
    "Checking SA lifetime...",
    "Observed security profile generated ✓",
  ],
  "ai-intelligence": [
    "Preparing 28-feature vector...",
    "Running RandomForestClassifier (150 estimators)...",
    "Evaluating class probabilities...",
    "Checking abstention threshold (0.55)...",
    "Selecting top traffic class...",
    "Generating feature importance explanation...",
    "Classification complete ✓",
  ],
  "security-assessment": [
    "Running security rules...",
    "Evaluating cryptographic posture...",
    "Evaluating key exchange strength...",
    "Evaluating protocol version...",
    "Evaluating replay protection...",
    "Generating findings...",
    "Calculating risk deductions...",
    "Calculating final score ✓",
  ],
  "security-twin-drift": [
    "Loading expected (intended) state...",
    "Loading observed (actual) state...",
    "Comparing IKE version...",
    "Comparing cipher suite...",
    "Comparing DH group...",
    "Comparing PFS...",
    "Comparing replay protection...",
    "Detecting configuration drift...",
    "Calculating security impact score delta ✓",
  ],
  "metadata-posture-report": [
    "Analyzing encrypted traffic metadata...",
    "Computing timing observability...",
    "Computing packet-size observability...",
    "Updating security posture timeline...",
    "Building auditable evidence chain...",
    "Generating executive report...",
    "Generating technical report...",
    "Demo analysis complete ✓",
  ],
};

export const STAGE_VALIDATIONS: Record<DemoStageKey, string[]> = {
  "input": [
    "Scenario exists",
    "Ground truth available",
    "Expected configuration available",
    "Demo capture available",
  ],
  "packet-analysis": [
    "PCAP loaded",
    "Packets identified",
    "Protocol headers identified",
    "Payload remains encrypted",
  ],
  "normalization-flow": [
    "Protocol features normalized",
    "Flow reconstructed",
    "Feature vector generated",
    "No payload content used",
  ],
  "vpn-analysis": [
    "IKE version identified",
    "Cryptographic posture evaluated",
    "SA parameters extracted",
    "Observed state generated",
  ],
  "ai-intelligence": [
    "Feature vector available",
    "Classifier executed",
    "Traffic class generated",
    "Confidence generated",
    "No payload decryption performed",
  ],
  "security-assessment": [
    "Security rules executed",
    "Findings generated",
    "Risk score calculated",
    "Evidence attached",
    "Risk band assigned",
  ],
  "security-twin-drift": [
    "Expected state available",
    "Observed state available",
    "Comparison completed",
    "Drift identified",
    "Score delta calculated",
  ],
  "metadata-posture-report": [
    "Metadata analysis complete",
    "Posture timeline updated",
    "Evidence chain generated",
    "Executive report generated",
    "Technical report generated",
  ],
};

// ---------------------------------------------------------------------------
// Output builder — derives per-stage outputs from canonical analysis
// ---------------------------------------------------------------------------

export interface DemoStageOutputs {
  scenarioId?: string;
  analysisId?: string;
  scenario?: ScenarioDefinition;
  analysis?: AnalysisResult;

  packetSummary?: {
    total_packets: number;
    ike_packets: number;
    esp_packets: number;
    ah_packets: number;
    capture_duration_seconds: number;
    pcap_name: string;
    payload_decrypted: false;
  };

  protocolFeatures?: {
    ike_version: string;
    vpn_mode: string;
    encryption: string;
    auth: string;
    dh_group: string;
    pfs: boolean;
    replay_protection: boolean;
    sa_lifetime_seconds: number;
  };

  flowFeatures?: {
    mean_packet_size: number;
    packet_rate: number;
    flow_duration: number;
    direction_ratio: number;
    burst_count: number;
    packet_size_pattern: string;
    directionality: string;
  };

  vpnProfile?: {
    ike_version: string;
    mode: string;
    ip_version: string;
    encryption: string;
    auth: string;
    dh_group: string;
    pfs: boolean;
    replay_protection: boolean;
    sa_lifetime_seconds: number;
    nat_traversal: boolean;
  };

  aiResult?: {
    traffic_class: string;
    confidence: number;
    class_distribution: { class: string; confidence: number }[];
    explanation: { feature: string; value: number; importance: number }[];
    model: { name: string; version: string };
    payload_decrypted: false;
  };

  securityAssessment?: {
    findings: AnalysisResult["findings"];
    risk_score: number;
    risk_band: string;
    grade: string;
    total_deduction: number;
    deductions: { finding_id: string; category: string; deduction: number; reason: string }[];
  };

  securityTwinDrift?: {
    twin: ReturnType<typeof getDemoSecurityTwin>;
    drift: ReturnType<typeof getDemoDriftComparison>;
    score_delta: number;
    baseline_id: string;
    current_id: string;
  };

  finalInsights?: {
    metadata: ReturnType<typeof getDemoMetadataExposure>;
    posture: ReturnType<typeof getDemoPostureTimeline>;
    reasoning: ReturnType<typeof getDemoReasoning>;
    exec_report_url: string;
    tech_report_url: string;
  };
}

/**
 * Build all stage outputs for a given analysis ID and drift baseline.
 * All values are derived from canonical demo fixtures — deterministic.
 */
export function buildDemoStageOutputs(
  analysisId: string,
  driftBaselineId: string = "AX-2026-00428"
): DemoStageOutputs {
  const analysis = CANONICAL_ANALYSES_MAP[analysisId] ?? CANONICAL_ANALYSES_MAP["AX-2026-00428"];
  const scenarioKey = ANALYSIS_TO_SCENARIO[analysisId] ?? "secure-enterprise";
  const scenario = CANONICAL_SCENARIOS.find((s) => s.id === scenarioKey) ?? CANONICAL_SCENARIOS[0];

  const traffic = analysis.traffic;
  const feats = (traffic.features as Record<string, number | string>) ?? {};

  return {
    scenarioId: scenarioKey,
    analysisId,
    scenario,
    analysis,

    packetSummary: {
      total_packets:
        analysisId === "AX-2026-00427"
          ? 284
          : analysisId === "AX-2026-00424"
          ? 1820
          : analysisId === "AX-2026-00423"
          ? 412
          : analysisId === "AX-2026-00426"
          ? 621
          : analysisId === "AX-2026-00425"
          ? 534
          : 1247,
      ike_packets:
        analysisId === "AX-2026-00427" ? 18 : analysisId === "AX-2026-00424" ? 12 : 24,
      esp_packets:
        analysisId === "AX-2026-00427"
          ? 262
          : analysisId === "AX-2026-00424"
          ? 1806
          : 1218,
      ah_packets: 0,
      capture_duration_seconds:
        typeof feats.session_duration_seconds === "number"
          ? feats.session_duration_seconds
          : 842,
      pcap_name: analysis.source.file_name ?? "demo.pcap",
      payload_decrypted: false,
    },

    protocolFeatures: {
      ike_version: analysis.vpn.ike_version,
      vpn_mode: analysis.vpn.mode,
      encryption: analysis.cryptography.encryption,
      auth: analysis.cryptography.authentication,
      dh_group: analysis.cryptography.dh_group,
      pfs: analysis.cryptography.pfs,
      replay_protection: analysis.security.replay_protection,
      sa_lifetime_seconds: analysis.security.sa_lifetime_seconds,
    },

    flowFeatures: {
      mean_packet_size: typeof feats.mean_packet_size === "number" ? feats.mean_packet_size : 1142,
      packet_rate: typeof feats.packet_rate === "number" ? feats.packet_rate : 312,
      flow_duration: typeof feats.flow_duration === "number" ? feats.flow_duration : 18.4,
      direction_ratio: typeof feats.direction_ratio === "number" ? feats.direction_ratio : 0.84,
      burst_count: typeof feats.burst_count === "number" ? feats.burst_count : 14,
      packet_size_pattern:
        typeof feats.packet_size_pattern === "string"
          ? feats.packet_size_pattern
          : "large_bursty",
      directionality:
        typeof feats.directionality === "string" ? feats.directionality : "bidirectional",
    },

    vpnProfile: {
      ike_version: analysis.vpn.ike_version,
      mode: analysis.vpn.mode,
      ip_version: analysis.vpn.ip_version,
      encryption: analysis.cryptography.encryption,
      auth: analysis.cryptography.authentication,
      dh_group: analysis.cryptography.dh_group,
      pfs: analysis.cryptography.pfs,
      replay_protection: analysis.security.replay_protection,
      sa_lifetime_seconds: analysis.security.sa_lifetime_seconds,
      nat_traversal: analysis.vpn.nat_traversal ?? false,
    },

    aiResult: {
      traffic_class: traffic.predicted_class,
      confidence: traffic.confidence,
      class_distribution: traffic.candidate_classes ?? [],
      explanation: (traffic.explanation as { feature: string; value: number; importance: number }[]) ?? [],
      model: traffic.model ?? { name: "RandomForestClassifier", version: "v1.2.0" },
      payload_decrypted: false,
    },

    securityAssessment: {
      findings: analysis.findings,
      risk_score: analysis.security.score,
      risk_band: analysis.security.risk_level,
      grade: analysis.security.grade,
      total_deduction: analysis.risk_scoring?.total_deduction ?? 0,
      deductions: analysis.risk_scoring?.scoring_breakdown ?? [],
    },

    securityTwinDrift: {
      twin: getDemoSecurityTwin(analysisId),
      drift: getDemoDriftComparison(driftBaselineId, analysisId),
      score_delta:
        (CANONICAL_ANALYSES_MAP[analysisId]?.security?.score ?? 0) -
        (CANONICAL_ANALYSES_MAP[driftBaselineId]?.security?.score ?? 100),
      baseline_id: driftBaselineId,
      current_id: analysisId,
    },

    finalInsights: {
      metadata: getDemoMetadataExposure(analysisId),
      posture: getDemoPostureTimeline(),
      reasoning: getDemoReasoning(analysisId),
      exec_report_url: `/analyses/${analysisId}/reports?type=executive`,
      tech_report_url: `/analyses/${analysisId}/reports?type=technical`,
    },
  };
}

/** Demo comparison presets for Stage 7 selector */
export const JUDGE_DEMO_COMPARISONS = CANONICAL_DEMO_COMPARISONS;

/** PCAP simulation metadata used for display */
export const PCAP_SIMULATION_NOTE =
  "Running in Demo Mode: synthetic packet capture derived from canonical scenario ground truth. " +
  "No real network interfaces accessed. TShark dissection is simulated deterministically.";
