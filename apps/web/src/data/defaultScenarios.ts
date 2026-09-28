import { ScenarioDefinition } from "@/types/analysis";

export const DEFAULT_SCENARIOS: ScenarioDefinition[] = [
  {
    id: "secure-enterprise",
    name: "Secure Enterprise VPN",
    description: "Modern enterprise IPsec configuration adhering to NIST SP 800-77 recommendations",
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
      score: 94,
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
    description: "Modern IKEv2 configuration with several security trade-offs (disabled PFS)",
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
      score: 72,
      grade: "C",
      risk_level: "Medium",
      replay_protection: true,
      sa_lifetime_seconds: 86400,
    },
    traffic: {
      predicted_class: "Web",
      confidence: 0.89,
    },
  },
  {
    id: "weak-configuration",
    name: "Legacy Weak Configuration",
    description: "Legacy configuration containing multiple security weaknesses (IKEv1, 3DES/AES-128, DH Group 2)",
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
      score: 43,
      grade: "F",
      risk_level: "High",
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
    description: "Modern IPv6 IPsec tunnel with strong cryptographic parameters and DH Group 20",
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
      score: 96,
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
    name: "Traffic Anomaly",
    description: "VPN session with unusual encrypted traffic behavior and anomalous burst profiles",
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
      score: 81,
      grade: "B",
      risk_level: "Medium",
      replay_protection: true,
      sa_lifetime_seconds: 28800,
    },
    traffic: {
      predicted_class: "Unknown",
      confidence: 0.61,
    },
  },
];
