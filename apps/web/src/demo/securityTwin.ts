/**
 * Canonical Security Twin Fixtures for AbhedyaX Demo Provider.
 * Evaluates Expected Security Baseline vs Observed Wire Session.
 */

import { SecurityTwin, AlignmentItem, SecurityState } from "@/types/securityTwin";
import { CANONICAL_ANALYSES_MAP } from "./analyses";

export function getDemoSecurityTwin(analysisId: string): SecurityTwin {
  const analysis = CANONICAL_ANALYSES_MAP[analysisId] || CANONICAL_ANALYSES_MAP["AX-2026-00428"];

  const isLegacy = analysis.analysis_id === "AX-2026-00427";
  const isModerate = analysis.analysis_id === "AX-2026-00426";
  const isIpv6 = analysis.vpn.ip_version === "IPv6";
  const isPcap = analysis.source.type === "pcap";

  const expectedState: SecurityState = {
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

  const observedState: SecurityState = {
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
    {
      property: "IKE Version",
      expected: expectedState.ike_version,
      observed: observedState.ike_version,
      status: expectedState.ike_version === observedState.ike_version ? "match" : "mismatch",
      evidence_ids: ["PROV-001"],
      impact_note: isLegacy
        ? "Deprecated IKEv1 protocol; lacks anti-DoS cookies and asymmetric auth safeguards"
        : "Compliant IKEv2 negotiation verified per RFC 7296",
    },
    {
      property: "Encryption",
      expected: expectedState.encryption,
      observed: observedState.encryption,
      status: expectedState.encryption === observedState.encryption ? "match" : "mismatch",
      evidence_ids: ["PROV-002"],
      impact_note: isLegacy
        ? "AES-128-CBC with HMAC-SHA1 lacks AEAD protection against padding oracle attacks"
        : isModerate
        ? "AES-256-CBC is non-AEAD; authenticated encryption recommended"
        : "NIST-recommended AEAD authenticated encryption enforced",
    },
    {
      property: "Diffie-Hellman Group",
      expected: expectedState.dh_group,
      observed: observedState.dh_group,
      status: expectedState.dh_group === observedState.dh_group ? "match" : "mismatch",
      evidence_ids: ["PROV-003"],
      impact_note: isLegacy
        ? "DH Group 2 (1024-bit MODP) provides <80-bit security, vulnerable to Logjam precomputation"
        : isModerate
        ? "DH Group 14 (2048-bit MODP) meets minimum bar; modern ECP groups preferred"
        : "High-entropy elliptic curve key exchange verified",
    },
    {
      property: "Perfect Forward Secrecy",
      expected: expectedState.pfs,
      observed: observedState.pfs,
      status: expectedState.pfs === observedState.pfs ? "match" : "mismatch",
      evidence_ids: ["PROV-003"],
      impact_note: !analysis.cryptography.pfs
        ? "Child SA rekeying omits KE payload; allows retrospective decryption if IKE SA key is compromised"
        : "Ephemeral Child SA key exchange verified",
    },
    {
      property: "Replay Protection",
      expected: expectedState.replay_protection,
      observed: observedState.replay_protection,
      status: expectedState.replay_protection === observedState.replay_protection ? "match" : "mismatch",
      evidence_ids: ["PROV-004"],
      impact_note: !analysis.security.replay_protection
        ? "ESP sequence verification window disabled (size 0); exposes session to duplicate packet injection"
        : "ESP anti-replay sequence number window active",
    },
    {
      property: "SA Lifetime",
      expected: expectedState.sa_lifetime,
      observed: observedState.sa_lifetime,
      status: expectedState.sa_lifetime === observedState.sa_lifetime ? "match" : "mismatch",
      evidence_ids: ["PROV-004"],
      impact_note: analysis.security.sa_lifetime_seconds > 28800
        ? "Extended 24-hour SA lifetime increases cryptanalytic exposure window beyond 8-hour limit"
        : "Standard 8-hour SA lifetime adhered to",
    },
  ];

  const mismatches = items.filter((i) => i.status === "mismatch").length;
  const overall = mismatches === 0 ? "aligned" : isLegacy ? "drifted" : "partial";

  return {
    analysis_id: analysis.analysis_id,
    twin_id: `TWIN-${analysis.analysis_id}`,
    mode: isPcap ? "observed" : "simulation",
    expected_state: expectedState,
    observed_state: observedState,
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
