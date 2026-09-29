/**
 * Canonical Scenario Definitions for AbhedyaX Prototype.
 * Deterministic fixtures representing the six canonical evaluation scenarios.
 */

import { ScenarioDefinition } from "@/types/analysis";

export const CANONICAL_SCENARIOS: ScenarioDefinition[] = [
  {
    id: "secure-enterprise",
    name: "Secure Enterprise VPN",
    description: "Modern enterprise IPsec configuration adhering to NIST SP 800-77 Rev. 1 & RFC 8221 guidelines (AES-256-GCM, DH Group 19, PFS)",
    vpn: {
      protocol: "IPsec",
      ike_version: "IKEv2",
      mode: "Tunnel",
      ip_version: "IPv4",
      nat_traversal: true,
    },
    cryptography: {
      encryption: "AES-256-GCM",
      authentication: "AEAD",
      dh_group: "DH Group 19",
      pfs: true,
    },
    security: {
      score: 100,
      grade: "A",
      risk_level: "Low",
      replay_protection: true,
      sa_lifetime_seconds: 28800,
    },
    traffic: {
      predicted_class: "Video",
      confidence: 0.93,
    },
  },
  {
    id: "moderate-security",
    name: "Moderate Security VPN",
    description: "Enterprise IPsec configuration with operational trade-offs (disabled PFS, CBC mode, extended 24h lifetime)",
    vpn: {
      protocol: "IPsec",
      ike_version: "IKEv2",
      mode: "Tunnel",
      ip_version: "IPv4",
      nat_traversal: true,
    },
    cryptography: {
      encryption: "AES-256-CBC",
      authentication: "HMAC-SHA256",
      dh_group: "DH Group 14",
      pfs: false,
    },
    security: {
      score: 80,
      grade: "B",
      risk_level: "Moderate",
      replay_protection: true,
      sa_lifetime_seconds: 86400,
    },
    traffic: {
      predicted_class: "Web",
      confidence: 0.89,
    },
  },
  {
    id: "legacy-critical",
    name: "Legacy Weak Configuration",
    description: "Deprecated IPsec deployment containing severe protocol and cryptographic vulnerabilities (IKEv1, 1024-bit DH Group 2, SHA-1, Anti-Replay disabled)",
    vpn: {
      protocol: "IPsec",
      ike_version: "IKEv1",
      mode: "Tunnel",
      ip_version: "IPv4",
      nat_traversal: true,
    },
    cryptography: {
      encryption: "AES-128-CBC",
      authentication: "HMAC-SHA1",
      dh_group: "DH Group 2",
      pfs: false,
    },
    security: {
      score: 25,
      grade: "F",
      risk_level: "Critical",
      replay_protection: false,
      sa_lifetime_seconds: 86400,
    },
    traffic: {
      predicted_class: "Messaging",
      confidence: 0.84,
    },
  },
  {
    id: "secure-ipv6",
    name: "Secure IPv6 VPN",
    description: "High-assurance native IPv6 IPsec tunnel with CNSA / Suite B cryptographic parameters (DH Group 20, AES-256-GCM)",
    vpn: {
      protocol: "IPsec",
      ike_version: "IKEv2",
      mode: "Tunnel",
      ip_version: "IPv6",
      nat_traversal: false,
    },
    cryptography: {
      encryption: "AES-256-GCM",
      authentication: "AEAD",
      dh_group: "DH Group 20",
      pfs: true,
    },
    security: {
      score: 100,
      grade: "A",
      risk_level: "Low",
      replay_protection: true,
      sa_lifetime_seconds: 28800,
    },
    traffic: {
      predicted_class: "VoIP",
      confidence: 0.91,
    },
  },
  {
    id: "traffic-anomaly",
    name: "Traffic Anomaly VPN",
    description: "Modern IKEv2 configuration with low-entropy burst dynamics triggering statistical traffic variance deduction (-5 pts)",
    vpn: {
      protocol: "IPsec",
      ike_version: "IKEv2",
      mode: "Tunnel",
      ip_version: "IPv4",
      nat_traversal: true,
    },
    cryptography: {
      encryption: "AES-256-GCM",
      authentication: "AEAD",
      dh_group: "DH Group 19",
      pfs: true,
    },
    security: {
      score: 95,
      grade: "A",
      risk_level: "Low",
      replay_protection: true,
      sa_lifetime_seconds: 28800,
    },
    traffic: {
      predicted_class: "Unknown",
      confidence: 0.61,
    },
  },
  {
    id: "observed-pcap",
    name: "Observed PCAP Baseline",
    description: "Live capture baseline with modern ChaCha20-Poly1305 AEAD cipher and verified packet framing",
    vpn: {
      protocol: "IPsec",
      ike_version: "IKEv2",
      mode: "Tunnel",
      ip_version: "IPv4",
      nat_traversal: true,
    },
    cryptography: {
      encryption: "ChaCha20-Poly1305",
      authentication: "AEAD",
      dh_group: "DH Group 19",
      pfs: true,
    },
    security: {
      score: 100,
      grade: "A",
      risk_level: "Low",
      replay_protection: true,
      sa_lifetime_seconds: 28800,
    },
    traffic: {
      predicted_class: "Web",
      confidence: 0.91,
    },
  },
];

export const CANONICAL_SCENARIOS_MAP: Record<string, ScenarioDefinition> =
  CANONICAL_SCENARIOS.reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {} as Record<string, ScenarioDefinition>);
