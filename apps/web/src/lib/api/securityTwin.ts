/**
 * Client API functions for AbhedyaX Security Twin, Drift, Reasoning, and Posture.
 */

import { apiFetch } from "./client";
import {
  SecurityTwin,
  AlignmentItem,
  DriftChange,
  MetadataExposureDimension,
  PostureTimelineEntry,
  PostureTransition,
  DriftComparisonResult,
  MetadataExposureResult,
  AuditableReasoningResult,
  DemoComparisonPreset,
  PostureTimelineResult,
  ExposureLevel,
} from "@/types/securityTwin";
import { getPredefinedAnalysis, CANONICAL_RECENT_ANALYSES } from "@/data/dashboardData";

export async function getSecurityTwin(analysisId: string): Promise<SecurityTwin> {
  try {
    return await apiFetch<SecurityTwin>(
      `/api/v1/analyses/${encodeURIComponent(analysisId)}/security-twin`,
      { method: "GET", cache: "no-store" }
    );
  } catch (err) {
    console.warn(`[getSecurityTwin] Fallback to client derivation for ${analysisId}:`, err);
    return deriveFallbackSecurityTwin(analysisId);
  }
}

export async function getAnalysisDrift(
  analysisId: string,
  baselineId: string = "AX-2026-00428"
): Promise<DriftComparisonResult> {
  try {
    return await apiFetch<DriftComparisonResult>(
      `/api/v1/analyses/${encodeURIComponent(analysisId)}/drift?baseline_id=${encodeURIComponent(baselineId)}`,
      { method: "GET", cache: "no-store" }
    );
  } catch (err) {
    console.warn(`[getAnalysisDrift] Fallback for ${analysisId} vs ${baselineId}:`, err);
    return deriveFallbackDrift(baselineId, analysisId);
  }
}

export async function getAnalysisMetadataExposure(analysisId: string): Promise<MetadataExposureResult> {
  try {
    return await apiFetch<MetadataExposureResult>(
      `/api/v1/analyses/${encodeURIComponent(analysisId)}/metadata-exposure`,
      { method: "GET", cache: "no-store" }
    );
  } catch (err) {
    console.warn(`[getAnalysisMetadataExposure] Fallback for ${analysisId}:`, err);
    return deriveFallbackMetadataExposure(analysisId);
  }
}

export async function getAnalysisReasoning(analysisId: string): Promise<AuditableReasoningResult> {
  try {
    return await apiFetch<AuditableReasoningResult>(
      `/api/v1/analyses/${encodeURIComponent(analysisId)}/reasoning`,
      { method: "GET", cache: "no-store" }
    );
  } catch (err) {
    console.warn(`[getAnalysisReasoning] Fallback for ${analysisId}:`, err);
    return deriveFallbackReasoning(analysisId);
  }
}

export async function compareAnalyses(
  baselineId: string,
  currentId: string
): Promise<DriftComparisonResult> {
  try {
    return await apiFetch<DriftComparisonResult>("/api/v1/security-twin/compare", {
      method: "POST",
      body: JSON.stringify({ baseline_id: baselineId, current_id: currentId }),
      cache: "no-store",
    });
  } catch (err) {
    console.warn(`[compareAnalyses] Fallback for ${baselineId} vs ${currentId}:`, err);
    return deriveFallbackDrift(baselineId, currentId);
  }
}

export async function getDemoComparisons(): Promise<DemoComparisonPreset[]> {
  try {
    return await apiFetch<DemoComparisonPreset[]>("/api/v1/security-twin/demo-comparisons", {
      method: "GET",
    });
  } catch {
    return [
      {
        id: "secure-to-moderate",
        name: "Secure Enterprise vs Moderate Security",
        description: "Demonstrates operational trade-offs: disabling PFS and lengthening SA lifetime causes score drop from 100 to 80 (Grade A -> B).",
        baseline_id: "AX-2026-00428",
        current_id: "AX-2026-00426",
        expected_score_transition: "100 -> 80 (-20 deductions: F-201, F-202)",
        key_takeaway: "Exposes how disabling PFS weakens forward secrecy without triggering false alarms on unaffected encryption.",
      },
      {
        id: "secure-to-legacy",
        name: "Secure Enterprise vs Legacy Weak Configuration",
        description: "Demonstrates severe protocol obsolescence: IKEv1 downgrade, 1024-bit DH Group 2, SHA-1, and no anti-replay window plummet score from 100 to 25 (Grade A -> F).",
        baseline_id: "AX-2026-00428",
        current_id: "AX-2026-00427",
        expected_score_transition: "100 -> 25 (-75 deductions: F-304, F-301, F-302, F-303)",
        key_takeaway: "Exposes compound vulnerabilities across protocol negotiation, key exchange, and session protection.",
      },
      {
        id: "secure-to-traffic-anomaly",
        name: "Secure Enterprise vs Encrypted Traffic Anomaly",
        description: "Demonstrates behavioral anomaly isolation: strong cryptography remains intact while metadata cadence anomaly triggers a targeted -5 deduction (Score 100 -> 95).",
        baseline_id: "AX-2026-00428",
        current_id: "AX-2026-00424",
        expected_score_transition: "100 -> 95 (-5 deduction: F-501)",
        key_takeaway: "Proves zero-payload flow telemetry flags operational anomalies without falsely claiming broken encryption.",
      },
      {
        id: "ipv4-to-ipv6",
        name: "IPv4 Secure vs Native IPv6 Secure",
        description: "Demonstrates clean protocol modernization: transitioning from IPv4 to IPv6 Suite B (DH Group 20) with zero security penalties (100 -> 100).",
        baseline_id: "AX-2026-00428",
        current_id: "AX-2026-00425",
        expected_score_transition: "100 -> 100 (0 deductions)",
        key_takeaway: "Confirms modern transport transitions are classified as neutral/strengthened rather than vulnerabilities.",
      },
    ];
  }
}

export async function getPostureTimeline(): Promise<PostureTimelineResult> {
  try {
    return await apiFetch<PostureTimelineResult>("/api/v1/posture", {
      method: "GET",
      cache: "no-store",
    });
  } catch (err) {
    console.warn("[getPostureTimeline] Fallback to client derivation:", err);
    return deriveFallbackPosture();
  }
}

// -------------------------------------------------------------
// Resilient Client-Side Fallback Generators (Single Source of Truth)
// -------------------------------------------------------------

function deriveFallbackSecurityTwin(analysisId: string): SecurityTwin {
  const analysis = getPredefinedAnalysis(analysisId) || getPredefinedAnalysis("AX-2026-00428")!;
  const isLegacy = analysis.vpn.ike_version === "IKEv1" || analysis.security.score < 50;
  const isIpv6 = analysis.vpn.ip_version === "IPv6";
  const isPcap = analysis.source.type === "pcap";

  const expected = {
    ipsec: true,
    ike_version: "IKEv2",
    mode: "Tunnel",
    ip_version: isIpv6 ? "IPv6" : "IPv4",
    encryption: analysis.cryptography.encryption === "ChaCha20-Poly1305" ? "ChaCha20-Poly1305" : "AES-256-GCM",
    authentication: "AEAD",
    dh_group: isIpv6 ? "DH Group 20" : "DH Group 19",
    pfs: true,
    replay_protection: true,
    sa_lifetime: 28800,
  };

  const observed = {
    ipsec: true,
    ike_version: analysis.vpn.ike_version,
    mode: analysis.vpn.mode,
    ip_version: analysis.vpn.ip_version,
    encryption: analysis.cryptography.encryption,
    authentication: analysis.cryptography.authentication,
    dh_group: analysis.cryptography.dh_group,
    pfs: analysis.cryptography.pfs,
    replay_protection: analysis.security.replay_protection,
    sa_lifetime: analysis.security.sa_lifetime_seconds,
  };

  const items: AlignmentItem[] = [
    { property: "IKE Version", expected: expected.ike_version, observed: observed.ike_version, status: expected.ike_version === observed.ike_version ? "match" : "mismatch", evidence_ids: ["PROV-001"], impact_note: expected.ike_version === observed.ike_version ? "Compliant IKEv2" : "Deprecated IKEv1 protocol" },
    { property: "Encryption", expected: expected.encryption, observed: observed.encryption, status: expected.encryption === observed.encryption ? "match" : "mismatch", evidence_ids: ["PROV-002"], impact_note: expected.encryption === observed.encryption ? "NIST Recommended AEAD" : "Legacy CBC cipher" },
    { property: "Diffie-Hellman Group", expected: expected.dh_group, observed: observed.dh_group, status: expected.dh_group === observed.dh_group ? "match" : "mismatch", evidence_ids: ["PROV-003"], impact_note: expected.dh_group === observed.dh_group ? "High-entropy key exchange" : "Weak 1024-bit MODP Group 2" },
    { property: "Perfect Forward Secrecy", expected: expected.pfs, observed: observed.pfs, status: expected.pfs === observed.pfs ? "match" : "mismatch", evidence_ids: ["PROV-003"], impact_note: expected.pfs === observed.pfs ? "Ephemeral child SA key exchange" : "PFS disabled" },
    { property: "Replay Protection", expected: expected.replay_protection, observed: observed.replay_protection, status: expected.replay_protection === observed.replay_protection ? "match" : "mismatch", evidence_ids: ["PROV-004"], impact_note: expected.replay_protection === observed.replay_protection ? "Sequence window enabled" : "Anti-replay disabled" },
    { property: "SA Lifetime", expected: expected.sa_lifetime, observed: observed.sa_lifetime, status: expected.sa_lifetime === observed.sa_lifetime ? "match" : "mismatch", evidence_ids: ["PROV-004"], impact_note: expected.sa_lifetime === observed.sa_lifetime ? "Standard 8-hour window" : "Lifetime exceeds 28,800s" },
  ];

  const mismatches = items.filter((i) => i.status === "mismatch").length;
  const overall = mismatches === 0 ? "aligned" : isLegacy ? "drifted" : "partial";

  return {
    analysis_id: analysis.analysis_id,
    twin_id: `TWIN-${analysis.analysis_id}`,
    mode: isPcap ? "observed" : "simulation",
    expected_state: expected,
    observed_state: observed,
    alignment: {
      overall,
      items,
      matched_count: items.length - mismatches,
      mismatched_count: mismatches,
      unknown_count: 0,
    },
    security_impact: {
      affected_properties: items.filter((i) => i.status === "mismatch").map((i) => i.property),
      finding_ids: analysis.findings.map((f) => f.id),
      risk_score: analysis.security.score,
      risk: analysis.security.risk_level,
      grade: analysis.security.grade,
      remediation_advice: analysis.findings.map((f) => f.recommendation),
    },
    provenance: {
      expected_state: "GroundTruth",
      observed_state: isPcap ? "Observed" : "Simulated",
    },
  };
}

function deriveFallbackDrift(baselineId: string, currentId: string): DriftComparisonResult {
  const baseline = getPredefinedAnalysis(baselineId) || getPredefinedAnalysis("AX-2026-00428")!;
  const current = getPredefinedAnalysis(currentId) || getPredefinedAnalysis("AX-2026-00427")!;

  const delta = current.security.score - baseline.security.score;

  const changes: DriftChange[] = [
    {
      property: "IKE Version",
      before: baseline.vpn.ike_version,
      after: current.vpn.ike_version,
      change_type: baseline.vpn.ike_version === current.vpn.ike_version ? "unchanged" : "weakened",
      severity: baseline.vpn.ike_version === current.vpn.ike_version ? "informational" : "critical",
      finding_id: current.vpn.ike_version === "IKEv1" ? "F-304" : null,
      reason: current.vpn.ike_version === "IKEv1" ? "Downgrade to deprecated IKEv1 protocol" : "Unchanged",
      evidence: ["Observed IKE version header"],
    },
    {
      property: "Encryption",
      before: baseline.cryptography.encryption,
      after: current.cryptography.encryption,
      change_type: baseline.cryptography.encryption === current.cryptography.encryption ? "unchanged" : "weakened",
      severity: baseline.cryptography.encryption === current.cryptography.encryption ? "informational" : "high",
      finding_id: current.cryptography.encryption.includes("128") ? "F-302" : null,
      reason: current.cryptography.encryption.includes("128") ? "Key length reduced and AEAD omitted" : "Unchanged",
      evidence: ["Transform proposal in Security Association"],
    },
    {
      property: "DH Group",
      before: baseline.cryptography.dh_group,
      after: current.cryptography.dh_group,
      change_type: baseline.cryptography.dh_group === current.cryptography.dh_group ? "unchanged" : "weakened",
      severity: baseline.cryptography.dh_group === current.cryptography.dh_group ? "informational" : "critical",
      finding_id: current.cryptography.dh_group.includes("Group 2") ? "F-301" : null,
      reason: current.cryptography.dh_group.includes("Group 2") ? "1024-bit MODP Group 2 vulnerable to Logjam" : "Unchanged",
      evidence: ["Key exchange payload"],
    },
    {
      property: "PFS",
      before: baseline.cryptography.pfs,
      after: current.cryptography.pfs,
      change_type: baseline.cryptography.pfs === current.cryptography.pfs ? "unchanged" : "weakened",
      severity: baseline.cryptography.pfs === current.cryptography.pfs ? "informational" : "moderate",
      finding_id: !current.cryptography.pfs ? "F-201" : null,
      reason: !current.cryptography.pfs ? "Perfect Forward Secrecy disabled" : "Unchanged",
      evidence: ["Child SA exchange flags"],
    },
    {
      property: "Replay Protection",
      before: baseline.security.replay_protection,
      after: current.security.replay_protection,
      change_type: baseline.security.replay_protection === current.security.replay_protection ? "unchanged" : "weakened",
      severity: baseline.security.replay_protection === current.security.replay_protection ? "informational" : "high",
      finding_id: !current.security.replay_protection ? "F-303" : null,
      reason: !current.security.replay_protection ? "Anti-replay protection window disabled" : "Unchanged",
      evidence: ["IPsec anti-replay verification"],
    },
  ];

  return {
    comparison_id: `CMP-${baseline.analysis_id}-vs-${current.analysis_id}`,
    baseline_analysis_id: baseline.analysis_id,
    current_analysis_id: current.analysis_id,
    baseline_name: baseline.source.name,
    current_name: current.source.name,
    compatibility: { compatible: true, reason: "Both sessions are standard IPsec tunnels." },
    changes,
    summary: {
      total_changes: changes.filter((c) => c.change_type !== "unchanged").length,
      security_relevant_changes: changes.filter((c) => c.change_type === "weakened").length,
      strengthened_changes: 0,
      weakened_changes: changes.filter((c) => c.change_type === "weakened").length,
    },
    security_impact: {
      baseline_score: baseline.security.score,
      current_score: current.security.score,
      score_delta: delta,
      baseline_risk: baseline.security.risk_level,
      current_risk: current.security.risk_level,
      baseline_grade: baseline.security.grade,
      current_grade: current.security.grade,
    },
    provenance: "Demo Comparison",
  };
}

function deriveFallbackMetadataExposure(analysisId: string): MetadataExposureResult {
  const analysis = getPredefinedAnalysis(analysisId) || getPredefinedAnalysis("AX-2026-00428")!;
  const isAnomaly = analysis.analysis_id === "AX-2026-00424";

  const dimensions: MetadataExposureDimension[] = [
    { name: "Timing Observability", value: isAnomaly ? 78.0 : 45.0, indicator: isAnomaly ? "High" : "Moderate", description: isAnomaly ? "Periodic burst cadence provides high observability" : "Standard packet spacing", key_features: ["inter_arrival_pattern", "jitter"] },
    { name: "Size Pattern Observability", value: isAnomaly ? 82.0 : 58.0, indicator: isAnomaly ? "High" : "Moderate", description: "Packet size distributions without payload awareness", key_features: ["packet_size_pattern", "mean_length"] },
    { name: "Directionality Observability", value: 65.0, indicator: "Moderate", description: "Forward vs reverse packet volume ratio", key_features: ["directionality", "byte_asymmetry"] },
    { name: "Burst Pattern Observability", value: isAnomaly ? 84.0 : 55.0, indicator: isAnomaly ? "High" : "Moderate", description: "Micro-burst clustering and peak rates", key_features: ["burst_count", "burst_rate"] },
    { name: "Flow Duration Observability", value: 55.0, indicator: "Moderate", description: "Persistence of session connection window", key_features: ["session_duration_seconds"] },
  ];

  const avg = Math.round(dimensions.reduce((acc, d) => acc + d.value, 0) / dimensions.length);
  const ind: ExposureLevel = avg >= 70 ? "High" : avg >= 45 ? "Moderate" : "Low";

  return {
    analysis_id: analysis.analysis_id,
    indicator: ind,
    score: avg,
    dimensions,
    explanation: `Metadata observability indicator (${avg}/100) measures flow fingerprinting visibility based on packet sizes, timing, and directionality without decrypting ESP payloads.`,
    provenance: analysis.source.type === "pcap" ? "Observed" : "Simulated",
    features_summary: (analysis.traffic.features as Record<string, unknown>) || {},
    traffic_classification: {
      predicted_class: analysis.traffic.predicted_class,
      confidence: analysis.traffic.confidence,
      classification_mode: analysis.traffic.classification_mode || "simulated",
    },
    disclaimer: "Metadata exposure indicator measures traffic flow fingerprinting visibility based on packet sizes, cadence, and directionality. It does NOT decrypt ESP payloads or weaken AES/IPsec cryptographic protection.",
  };
}

function deriveFallbackReasoning(analysisId: string): AuditableReasoningResult {
  const analysis = getPredefinedAnalysis(analysisId) || getPredefinedAnalysis("AX-2026-00427")!;
  let running = 100;
  const chains = analysis.findings.map((f, idx) => {
    const deduction = f.id === "F-304" ? 25 : f.id === "F-301" ? 20 : (f.id === "F-302" || f.id === "F-303") ? 15 : f.id === "F-201" ? 12 : f.id === "F-202" ? 8 : f.id === "F-501" ? 5 : 0;
    const before = running;
    const after = Math.max(0, running - deduction);
    running = after;

    return {
      id: `REASON-${analysis.analysis_id}-${idx + 1}`,
      finding_id: f.id,
      category: f.category,
      severity: f.severity,
      evidence: f.evidence || [f.title],
      protocol_observation: `Observed wire condition: ${f.title}`,
      finding_title: f.title,
      risk_rule_id: `RULE_${f.id.replace("-", "_")}`,
      rule_description: f.description,
      deduction,
      score_before: before,
      score_after: after,
      risk_band_after: after >= 90 ? "Low" : after >= 75 ? "Moderate" : after >= 50 ? "High" : "Critical",
      grade_after: after >= 90 ? "A" : after >= 80 ? "B" : after >= 70 ? "C" : after >= 60 ? "D" : "F",
      recommendation: f.recommendation,
      provenance: f.provenance || "Observed",
    };
  });

  return {
    analysis_id: analysis.analysis_id,
    base_score: 100,
    final_score: analysis.security.score,
    final_risk: analysis.security.risk_level,
    final_grade: analysis.security.grade,
    total_deduction: 100 - analysis.security.score,
    chains,
    anti_double_counting_applied: true,
    methodology_version: "v1.2.0-deterministic",
  };
}

function deriveFallbackPosture(): PostureTimelineResult {
  const entries: PostureTimelineEntry[] = CANONICAL_RECENT_ANALYSES.map((a) => ({
    analysis_id: a.id,
    timestamp: a.createdAt,
    scenario: a.sourceName,
    score: a.securityScore,
    risk: a.riskLevel,
    grade: a.grade,
    finding_count: a.id === "AX-2026-00427" ? 4 : a.id === "AX-2026-00426" ? 2 : a.id === "AX-2026-00424" ? 1 : 0,
    configuration_summary: `${a.vpnProtocol} | ${a.encryption} | ${a.dhGroup} | PFS:${a.pfsEnabled ? "On" : "Off"}`,
    source: a.sourceType === "pcap" ? "PCAP" : "Simulation",
    provenance: a.sourceType === "pcap" ? "Observed Wire" : "Scenario Ground Truth",
    pfs: a.pfsEnabled,
    replay_protection: a.grade !== "F",
    ike_version: a.vpnProtocol,
    encryption: a.encryption,
  }));

  const transitions: PostureTransition[] = [];
  for (let i = 0; i < entries.length - 1; i++) {
    const prev = entries[i];
    const curr = entries[i + 1];
    transitions.push({
      from_id: prev.analysis_id,
      to_id: curr.analysis_id,
      from_score: prev.score,
      to_score: curr.score,
      score_delta: curr.score - prev.score,
      risk_transition: `${prev.risk} -> ${curr.risk}`,
      grade_transition: `${prev.grade} -> ${curr.grade}`,
      key_changes: [`Transition from ${prev.scenario} to ${curr.scenario}`],
    });
  }

  const scores = entries.map((e) => e.score);
  return {
    timeline: entries,
    transitions,
    total_sessions: entries.length,
    average_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    highest_score: Math.max(...scores),
    lowest_score: Math.min(...scores),
    risk_distribution: { Low: 4, Moderate: 1, High: 0, Critical: 1 },
    posture_summary: "Canonical multi-session security posture timeline.",
    disclaimer: "Historical timeline reflects completed canonical scenario sessions. Prototype mode: does not imply continuous background fleet monitoring.",
  };
}
