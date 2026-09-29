/**
 * Canonical Posture Timeline Fixtures for AbhedyaX Demo Provider.
 * Chronological evolution of security posture across enterprise IPsec sessions.
 */

import {
  PostureTimelineResult,
  PostureTimelineEntry,
  PostureTransition,
} from "@/types/securityTwin";
import { CANONICAL_ANALYSES_LIST } from "./analyses";

export function getDemoPostureTimeline(): PostureTimelineResult {
  // Sort analyses chronologically (earliest to latest)
  const sorted = [...CANONICAL_ANALYSES_LIST].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const entries: PostureTimelineEntry[] = sorted.map((a) => ({
    analysis_id: a.analysis_id,
    timestamp: a.created_at,
    scenario: a.source.name || a.source.file_name || "Enterprise Tunnel",
    score: a.security.score,
    risk: a.security.risk_level,
    grade: a.security.grade,
    finding_count: a.findings.length,
    configuration_summary: `${a.vpn.ike_version} | ${a.cryptography.encryption} | ${a.cryptography.dh_group} | PFS:${a.cryptography.pfs ? "On" : "Off"}`,
    source: (a.source.type === "pcap" ? "PCAP" : "Simulation") as "PCAP" | "Simulation",
    provenance: a.source.type === "pcap" ? "Observed Wire" : "GroundTruth Baseline",
    pfs: a.cryptography.pfs,
    replay_protection: a.security.replay_protection,
    ike_version: a.vpn.ike_version,
    encryption: a.cryptography.encryption,
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
  const avg = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);

  return {
    timeline: entries,
    transitions,
    total_sessions: entries.length,
    average_score: avg,
    highest_score: Math.max(...scores),
    lowest_score: Math.min(...scores),
    risk_distribution: { Low: 4, Moderate: 1, High: 0, Critical: 1 },
    posture_summary: "Canonical multi-session security posture timeline across 6 benchmark sessions.",
    disclaimer: "Historical timeline reflects completed canonical scenario sessions. Prototype mode: does not imply continuous background fleet monitoring.",
  };
}
