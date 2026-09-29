/**
 * Canonical Configuration Drift Fixtures for AbhedyaX Demo Provider.
 * Deterministic comparison engine between baseline and active IPsec sessions.
 */

import {
  DriftComparisonResult,
  DriftChange,
  DemoComparisonPreset,
} from "@/types/securityTwin";
import { CANONICAL_ANALYSES_MAP } from "./analyses";

export const CANONICAL_DEMO_COMPARISONS: DemoComparisonPreset[] = [
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

export function getDemoDriftComparison(
  baselineId: string,
  currentId: string
): DriftComparisonResult {
  const base = CANONICAL_ANALYSES_MAP[baselineId] || CANONICAL_ANALYSES_MAP["AX-2026-00428"];
  const curr = CANONICAL_ANALYSES_MAP[currentId] || CANONICAL_ANALYSES_MAP["AX-2026-00427"];

  const changes: DriftChange[] = [
    {
      property: "IKE Version",
      before: base.vpn.ike_version,
      after: curr.vpn.ike_version,
      change_type: base.vpn.ike_version === curr.vpn.ike_version ? "unchanged" : "weakened",
      severity: base.vpn.ike_version === curr.vpn.ike_version ? "informational" : "critical",
      finding_id: curr.vpn.ike_version === "IKEv1" ? "F-304" : null,
      reason: curr.vpn.ike_version === "IKEv1"
        ? "Protocol downgraded from IKEv2 to deprecated IKEv1 (RFC 7296 superseded)"
        : "Unchanged",
      evidence: ["Observed IKE version header in packet trace"],
    },
    {
      property: "Encryption",
      before: base.cryptography.encryption,
      after: curr.cryptography.encryption,
      change_type: base.cryptography.encryption === curr.cryptography.encryption ? "unchanged" : "weakened",
      severity: base.cryptography.encryption === curr.cryptography.encryption ? "informational" : "high",
      finding_id: curr.cryptography.encryption.includes("128") || curr.cryptography.encryption.includes("CBC") ? "F-302" : null,
      reason: curr.cryptography.encryption.includes("128")
        ? "Downgraded from AEAD mode to CBC mode lacking authenticated encryption protection"
        : "Unchanged",
      evidence: ["Transform proposal in Security Association negotiation"],
    },
    {
      property: "DH Group",
      before: base.cryptography.dh_group,
      after: curr.cryptography.dh_group,
      change_type: base.cryptography.dh_group === curr.cryptography.dh_group ? "unchanged" : "weakened",
      severity: base.cryptography.dh_group === curr.cryptography.dh_group ? "informational" : "critical",
      finding_id: curr.cryptography.dh_group.includes("Group 2") ? "F-301" : null,
      reason: curr.cryptography.dh_group.includes("Group 2")
        ? "Diffie-Hellman group downgraded to 1024-bit MODP (<80 bits security), vulnerable to Logjam"
        : "Unchanged",
      evidence: ["Key exchange payload in IKE handshake"],
    },
    {
      property: "PFS",
      before: base.cryptography.pfs,
      after: curr.cryptography.pfs,
      change_type: base.cryptography.pfs === curr.cryptography.pfs ? "unchanged" : "weakened",
      severity: base.cryptography.pfs === curr.cryptography.pfs ? "informational" : "moderate",
      finding_id: !curr.cryptography.pfs ? "F-201" : null,
      reason: !curr.cryptography.pfs
        ? "Perfect Forward Secrecy disabled on Child SA rekeying"
        : "Unchanged",
      evidence: ["CREATE_CHILD_SA exchange flags"],
    },
    {
      property: "Replay Protection",
      before: base.security.replay_protection,
      after: curr.security.replay_protection,
      change_type: base.security.replay_protection === curr.security.replay_protection ? "unchanged" : "weakened",
      severity: base.security.replay_protection === curr.security.replay_protection ? "informational" : "high",
      finding_id: !curr.security.replay_protection ? "F-303" : null,
      reason: !curr.security.replay_protection
        ? "Anti-replay protection sequence window disabled"
        : "Unchanged",
      evidence: ["IPsec anti-replay verification"],
    },
    {
      property: "SA Lifetime",
      before: base.security.sa_lifetime_seconds,
      after: curr.security.sa_lifetime_seconds,
      change_type: base.security.sa_lifetime_seconds === curr.security.sa_lifetime_seconds ? "unchanged" : "weakened",
      severity: base.security.sa_lifetime_seconds === curr.security.sa_lifetime_seconds ? "informational" : "low",
      finding_id: curr.security.sa_lifetime_seconds > 28800 ? "F-202" : null,
      reason: curr.security.sa_lifetime_seconds > 28800
        ? "SA lifetime extended to 24h, increasing cryptoperiod exposure beyond NIST limits"
        : "Unchanged",
      evidence: ["SA lifetime attribute in IKE negotiation"],
    },
  ];

  const delta = curr.security.score - base.security.score;
  const weakenedCount = changes.filter((c) => c.change_type === "weakened").length;
  const strengthenedCount = changes.filter((c) => c.change_type === "strengthened").length;

  return {
    comparison_id: `CMP-${base.analysis_id}-vs-${curr.analysis_id}`,
    baseline_analysis_id: base.analysis_id,
    current_analysis_id: curr.analysis_id,
    baseline_name: base.source.file_name || base.source.name,
    current_name: curr.source.file_name || curr.source.name,
    compatibility: {
      compatible: true,
      reason: "Both sessions are standard IPsec tunnels.",
    },
    changes,
    summary: {
      total_changes: changes.filter((c) => c.change_type !== "unchanged").length,
      security_relevant_changes: weakenedCount + strengthenedCount,
      strengthened_changes: strengthenedCount,
      weakened_changes: weakenedCount,
    },
    security_impact: {
      baseline_score: base.security.score,
      current_score: curr.security.score,
      score_delta: delta,
      baseline_risk: base.security.risk_level,
      current_risk: curr.security.risk_level,
      baseline_grade: base.security.grade,
      current_grade: curr.security.grade,
    },
    provenance: "Demo Comparison",
  };
}
