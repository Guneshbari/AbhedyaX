/**
 * Canonical Testbed Fixtures for AbhedyaX Demo Provider.
 * Deterministic strongSwan network namespace environment & run fixtures.
 */

import {
  TestbedEnvironmentStatus,
  TestbedScenario,
  TestbedRun,
  TestbedRunCreatePayload,
} from "@/types/testbed";

export const DEMO_TESTBED_STATUS: TestbedEnvironmentStatus = {
  is_linux: true,
  has_root: false,
  can_manage_netns: true,
  has_strongswan: true,
  has_tcpdump: true,
  has_tshark: true,
  strongswan_version: "strongSwan 5.9.13 (Linux 6.8.0, x86_64)",
  tcpdump_version: "tcpdump version 4.99.4",
  tshark_version: "TShark (Wireshark) 4.2.2",
  default_mode: "simulation",
  active_runs: 0,
  message: "Testbed simulation engine active. Ready for namespace orchestration and ground-truth validation.",
};

export const DEMO_TESTBED_SCENARIOS: TestbedScenario[] = [
  {
    scenario_id: "demo-enterprise-ikev2",
    name: "Enterprise IKEv2 AES-GCM Baseline",
    description: "NIST SP 800-77 Rev. 1 reference tunnel connecting ns-alice (initiator) and ns-bob (responder) via veth-ipsec.",
    ike_version: "IKEv2",
    mode: "Tunnel",
    ip_version: "IPv4",
    encryption: "AES-256-GCM",
    authentication: "AEAD",
    dh_group: "DH Group 19",
    pfs: true,
    replay_protection: true,
    sa_lifetime_seconds: 28800,
    traffic_profiles: ["Video", "Web", "VoIP"],
    expected_security: {
      score_range: { min: 95, max: 100 },
      risk_level: "Low",
      expected_findings: [],
    },
  },
  {
    scenario_id: "demo-legacy-ikev1",
    name: "Legacy IKEv1 3DES / SHA-1 Deployment",
    description: "Emulated vulnerable legacy branch tunnel demonstrating deprecated Main Mode handshake and 1024-bit DH Group 2.",
    ike_version: "IKEv1",
    mode: "Tunnel",
    ip_version: "IPv4",
    encryption: "AES-128-CBC",
    authentication: "HMAC-SHA1",
    dh_group: "DH Group 2",
    pfs: false,
    replay_protection: false,
    sa_lifetime_seconds: 86400,
    traffic_profiles: ["Messaging", "Web"],
    expected_security: {
      score_range: { min: 20, max: 35 },
      risk_level: "Critical",
      expected_findings: ["F-301", "F-302", "F-303", "F-304"],
    },
  },
  {
    scenario_id: "demo-moderate-ikev2",
    name: "Moderate IKEv2 CBC No-PFS",
    description: "Standard corporate configuration with trade-offs: CBC mode cipher, Group 14 DH, and disabled Child SA PFS.",
    ike_version: "IKEv2",
    mode: "Tunnel",
    ip_version: "IPv4",
    encryption: "AES-256-CBC",
    authentication: "HMAC-SHA256",
    dh_group: "DH Group 14",
    pfs: false,
    replay_protection: true,
    sa_lifetime_seconds: 86400,
    traffic_profiles: ["Web", "Email"],
    expected_security: {
      score_range: { min: 75, max: 85 },
      risk_level: "Medium",
      expected_findings: ["F-201", "F-202"],
    },
  },
  {
    scenario_id: "demo-anomaly-injection",
    name: "Automated Traffic Anomaly Injection",
    description: "Controlled testbed run injecting programmatic burst intervals across established AES-GCM tunnel to verify ML side-channel detection.",
    ike_version: "IKEv2",
    mode: "Tunnel",
    ip_version: "IPv4",
    encryption: "AES-256-GCM",
    authentication: "AEAD",
    dh_group: "DH Group 19",
    pfs: true,
    replay_protection: true,
    sa_lifetime_seconds: 28800,
    traffic_profiles: ["ICMP", "Video"],
    expected_security: {
      score_range: { min: 90, max: 95 },
      risk_level: "Low",
      expected_findings: ["F-401"],
    },
  },
];

export function createDemoTestbedRun(payload: TestbedRunCreatePayload): TestbedRun {
  const scenario =
    DEMO_TESTBED_SCENARIOS.find((s) => s.scenario_id === payload.scenario_id) ||
    DEMO_TESTBED_SCENARIOS[0];

  const now = new Date().toISOString();
  const runId = `RUN-DEMO-${Date.now().toString().slice(-4)}`;

  return {
    run_id: runId,
    scenario_id: scenario.scenario_id,
    scenario_name: scenario.name,
    execution_mode: payload.execution_mode || "simulation",
    traffic_profile: payload.traffic_profile || scenario.traffic_profiles[0],
    state: "Completed",
    progress: 100,
    step_description: "Validation complete: ground truth matched 6/6 parameters with 100% accuracy.",
    started_at: now,
    completed_at: now,
    analysis_id: "AX-2026-00428",
    ground_truth: {
      scenario_id: scenario.scenario_id,
      generated_at: now,
      configuration: {
        ike_version: scenario.ike_version,
        mode: scenario.mode,
        ip_version: scenario.ip_version,
        encryption: scenario.encryption,
        authentication: scenario.authentication,
        dh_group: scenario.dh_group,
        pfs: scenario.pfs,
        replay_protection: scenario.replay_protection,
        sa_lifetime_seconds: scenario.sa_lifetime_seconds,
      },
      traffic: {
        class: payload.traffic_profile || scenario.traffic_profiles[0],
        duration_seconds: 30,
      },
      capture: {
        file: `${scenario.scenario_id}.pcap`,
        format: "PCAP (Wireshark/libpcap)",
        packet_count: 1420,
      },
      expected_analysis: {
        protocol: "IPsec",
        ike_version: scenario.ike_version,
        mode: scenario.mode,
        ip_version: scenario.ip_version,
        encryption: scenario.encryption,
        authentication: scenario.authentication,
        dh_group: scenario.dh_group,
        pfs: scenario.pfs,
      },
    },
    capture_metadata: {
      scenario_id: scenario.scenario_id,
      run_id: runId,
      capture_file: `${scenario.scenario_id}.pcap`,
      file_format: "PCAP",
      file_size_bytes: 428000,
      packet_count: 1420,
      start_time: now,
      end_time: now,
      duration_seconds: 30,
      interface: "veth-ipsec0",
      traffic_profiles: [payload.traffic_profile || scenario.traffic_profiles[0]],
    },
    validation_result: {
      scenario_id: scenario.scenario_id,
      run_id: runId,
      passed: true,
      accuracy: 1.0,
      total_checks: 6,
      matched_checks: 6,
      checks: [
        { field: "ike_version", expected: scenario.ike_version, observed: scenario.ike_version, match: true },
        { field: "encryption", expected: scenario.encryption, observed: scenario.encryption, match: true },
        { field: "authentication", expected: scenario.authentication, observed: scenario.authentication, match: true },
        { field: "dh_group", expected: scenario.dh_group, observed: scenario.dh_group, match: true },
        { field: "pfs", expected: scenario.pfs, observed: scenario.pfs, match: true },
        { field: "replay_protection", expected: scenario.replay_protection, observed: scenario.replay_protection, match: true },
      ],
      analysis_id: "AX-2026-00428",
    },
  };
}
