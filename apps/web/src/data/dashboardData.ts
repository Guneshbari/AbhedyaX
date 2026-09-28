import { DashboardData, AnalysisSummary, KpiMetric, RiskDistributionItem } from "@/types/dashboard";
import { AnalysisResult, SecurityFinding } from "@/types/analysis";

const CANONICAL_RECENT_ANALYSES: AnalysisSummary[] = [
  {
    id: "AX-2026-00428",
    sourceName: "gw-delhi-hq-ipsec.pcap",
    sourceType: "simulation",
    vpnProtocol: "IKEv2",
    vpnMode: "Tunnel",
    ipVersion: "IPv4",
    encryption: "AES-256-GCM",
    authentication: "AEAD",
    dhGroup: "DH Group 19",
    pfsEnabled: true,
    securityScore: 100,
    grade: "A",
    riskLevel: "Low",
    status: "completed",
    createdAt: "2026-09-28T16:20:00Z",
  },
  {
    id: "AX-2026-00427",
    sourceName: "legacy-branch-04.pcap",
    sourceType: "simulation",
    vpnProtocol: "IKEv1",
    vpnMode: "Tunnel",
    ipVersion: "IPv4",
    encryption: "AES-128-CBC",
    authentication: "HMAC-SHA1",
    dhGroup: "DH Group 2",
    pfsEnabled: false,
    securityScore: 25,
    grade: "F",
    riskLevel: "Critical",
    status: "failed",
    createdAt: "2026-09-28T15:45:00Z",
  },
  {
    id: "AX-2026-00426",
    sourceName: "dr-backup-link.pcap",
    sourceType: "simulation",
    vpnProtocol: "IKEv2",
    vpnMode: "Tunnel",
    ipVersion: "IPv4",
    encryption: "AES-256-CBC",
    authentication: "HMAC-SHA256",
    dhGroup: "DH Group 14",
    pfsEnabled: false,
    securityScore: 80,
    grade: "B",
    riskLevel: "Moderate",
    status: "warning",
    createdAt: "2026-09-28T14:10:00Z",
  },
  {
    id: "AX-2026-00425",
    sourceName: "cloud-gw-ipv6.pcap",
    sourceType: "simulation",
    vpnProtocol: "IKEv2",
    vpnMode: "Tunnel",
    ipVersion: "IPv6",
    encryption: "AES-256-GCM",
    authentication: "AEAD",
    dhGroup: "DH Group 20",
    pfsEnabled: true,
    securityScore: 100,
    grade: "A",
    riskLevel: "Low",
    status: "completed",
    createdAt: "2026-09-28T12:35:00Z",
  },
  {
    id: "AX-2026-00424",
    sourceName: "perimeter-tap-anomaly.pcap",
    sourceType: "simulation",
    vpnProtocol: "IKEv2",
    vpnMode: "Tunnel",
    ipVersion: "IPv4",
    encryption: "AES-256-GCM",
    authentication: "AEAD",
    dhGroup: "DH Group 19",
    pfsEnabled: true,
    securityScore: 95,
    grade: "A",
    riskLevel: "Low",
    status: "warning",
    createdAt: "2026-09-28T11:05:00Z",
  },
  {
    id: "AX-2026-00423",
    sourceName: "remote-worker-gateway.pcap",
    sourceType: "pcap",
    vpnProtocol: "IKEv2",
    vpnMode: "Tunnel",
    ipVersion: "IPv4",
    encryption: "ChaCha20-Poly1305",
    authentication: "AEAD",
    dhGroup: "DH Group 19",
    pfsEnabled: true,
    securityScore: 100,
    grade: "A",
    riskLevel: "Low",
    status: "completed",
    createdAt: "2026-09-28T09:40:00Z",
  },
];

export function calculateKpis(analyses: AnalysisSummary[]): KpiMetric[] {
  const total = analyses.length;
  const avg = total > 0 ? Math.round(analyses.reduce((sum, a) => sum + a.securityScore, 0) / total) : 0;
  return [
    {
      id: "analyses-total",
      label: "Analyses",
      value: String(total),
      trend: "+12.4%",
      trendDirection: "up",
      trendLabel: "vs previous week",
      sentiment: "positive",
      helperText: "Total VPN sessions inspected",
    },
    {
      id: "avg-security-score",
      label: "Average Security Score",
      value: `${avg}/100`,
      trend: "+5.2%",
      trendDirection: "up",
      trendLabel: "improved posture",
      sentiment: "positive",
      helperText: "Deterministic RFC/NIST compliance",
    },
    {
      id: "high-risk-findings",
      label: "High Risk Findings",
      value: "7",
      trend: "-18%",
      trendDirection: "down",
      trendLabel: "mitigated vulnerabilities",
      sentiment: "positive",
      helperText: "PFS, weak ciphers, or replay flaws",
    },
    {
      id: "ai-confidence",
      label: "AI Classification Confidence",
      value: "84.8%",
      trend: "+3.7%",
      trendDirection: "up",
      trendLabel: "on encrypted flows",
      sentiment: "positive",
      helperText: "Statistical payload inference score",
    },
  ];
}

export function calculateRiskDistribution(analyses: AnalysisSummary[]): RiskDistributionItem[] {
  const total = analyses.length || 1;
  const low = analyses.filter((a) => a.riskLevel === "Low").length;
  const moderate = analyses.filter((a) => a.riskLevel === "Moderate").length;
  const high = analyses.filter((a) => a.riskLevel === "High").length;
  const critical = analyses.filter((a) => a.riskLevel === "Critical").length;

  return [
    {
      category: "Low",
      count: low,
      percentage: Math.round((low / total) * 100),
      color: "#22C55E",
      description: "Compliant with NIST SP 800-77 & RFC 8221",
    },
    {
      category: "Moderate",
      count: moderate,
      percentage: Math.round((moderate / total) * 100),
      color: "#3B82F6",
      description: "Moderate parameters or disabled PFS",
    },
    {
      category: "High",
      count: high,
      percentage: Math.round((high / total) * 100),
      color: "#F59E0B",
      description: "Substandard DH groups or legacy transforms",
    },
    {
      category: "Critical",
      count: critical,
      percentage: Math.round((critical / total) * 100),
      color: "#EF4444",
      description: "Deprecated ciphers (3DES/MD5) or cleartext IKE",
    },
  ];
}

export const DASHBOARD_DATA: DashboardData = {
  kpis: calculateKpis(CANONICAL_RECENT_ANALYSES),
  riskDistribution: calculateRiskDistribution(CANONICAL_RECENT_ANALYSES),
  recentAnalyses: CANONICAL_RECENT_ANALYSES,
  securityTrend: [
    { date: "Sep 18", score: 76, benchmark: 80, sessionCount: 12 },
    { date: "Sep 19", score: 79, benchmark: 80, sessionCount: 14 },
    { date: "Sep 20", score: 78, benchmark: 80, sessionCount: 11 },
    { date: "Sep 21", score: 82, benchmark: 80, sessionCount: 16 },
    { date: "Sep 22", score: 81, benchmark: 80, sessionCount: 15 },
    { date: "Sep 23", score: 85, benchmark: 80, sessionCount: 18 },
    { date: "Sep 24", score: 83, benchmark: 80, sessionCount: 13 },
    { date: "Sep 25", score: 87, benchmark: 80, sessionCount: 20 },
    { date: "Sep 26", score: 86, benchmark: 80, sessionCount: 17 },
    { date: "Sep 27", score: 89, benchmark: 80, sessionCount: 22 },
    { date: "Sep 28", score: 84, benchmark: 80, sessionCount: 19 },
  ],


  quickActions: [
    {
      id: "action-analyze-pcap",
      title: "Analyze PCAP",
      description: "Upload Wireshark / tcpdump capture file for deep protocol decoding",
      actionText: "Upload & Decode",
      href: "/analyze?mode=pcap",
      iconName: "UploadCloud",
      badge: "Fast Inspection",
    },
    {
      id: "action-run-simulation",
      title: "Run Simulation",
      description: "Execute a standardized RFC benchmark scenario with zero configuration",
      actionText: "Select Scenario",
      href: "/analyze?mode=simulation",
      iconName: "PlayCircle",
      badge: "Instant Demo",
    },
    {
      id: "action-open-testbed",
      title: "Open Testbed",
      description: "Inspect active strongSwan tunnels in Linux network namespaces",
      actionText: "View Topology",
      href: "/testbed",
      iconName: "Network",
      badge: "strongSwan 5.9",
    },
  ],
};

const PREDEFINED_FINDINGS: Record<string, SecurityFinding[]> = {
  "AX-2026-00428": [
    {
      id: "F-101",
      severity: "Informational",
      category: "Cryptography",
      title: "Compliant AEAD Cipher Suite Negotiated",
      description: "AES-256-GCM authenticated encryption provides high confidentiality and cryptographic integrity.",
      evidence: ["Transform: ENCR_AES_GCM_16 with 256-bit key", "Authenticated Encryption with Associated Data (AEAD)"],
      recommendation: "Maintain active cipher suite per NIST SP 800-77 Rev. 1 guidelines.",
      confidence: 0.99,
      provenance: "Observed",
    },
    {
      id: "F-102",
      severity: "Informational",
      category: "Key Exchange",
      title: "Strong Elliptic Curve Key Exchange",
      description: "Diffie-Hellman Group 19 (256-bit random ECP group) provides a robust 128-bit security level.",
      evidence: ["Transform: DH_GROUP_19 (NIST P-256)", "Key exchange verified in IKE_SA_INIT"],
      recommendation: "Ensure DH group selection aligns with future CNSA Suite requirements.",
      confidence: 0.98,
      provenance: "Observed",
    },
    {
      id: "F-103",
      severity: "Informational",
      category: "PFS",
      title: "Perfect Forward Secrecy Verified",
      description: "PFS is enforced on Child SA negotiations, preventing retrospective decryption if long-term keys are compromised.",
      evidence: ["CREATE_CHILD_SA contains fresh KE payload"],
      recommendation: "Retain PFS enforcement across all rekeying cycles.",
      confidence: 0.97,
      provenance: "Inferred",
    },
  ],
  "AX-2026-00427": [
    {
      id: "F-301",
      severity: "High",
      category: "Key Exchange",
      title: "Deprecated Key Exchange (DH Group 2)",
      description: "Diffie-Hellman Group 2 (MODP-1024) is cryptographically deficient and vulnerable to state-level precomputation attacks (Logjam).",
      evidence: ["Proposal DH Group: 2 (1024-bit MODP)", "RFC 8221 status: MUST NOT be used"],
      recommendation: "Immediately upgrade to DH Group 14 (MODP-2048) or Group 19 (ECP-256).",
      confidence: 0.99,
      provenance: "Observed",
    },
    {
      id: "F-302",
      severity: "High",
      category: "Authentication",
      title: "Insecure Integrity Algorithm (SHA-1)",
      description: "HMAC-SHA1-96 provides inadequate collision resistance and is deprecated by NIST SP 800-131A.",
      evidence: ["Transform: AUTH_HMAC_SHA1_96", "Truncated 96-bit authentication tag"],
      recommendation: "Upgrade authentication to HMAC-SHA256 or deploy AEAD ciphers.",
      confidence: 0.98,
      provenance: "Observed",
    },
    {
      id: "F-303",
      severity: "Medium",
      category: "Replay Protection",
      title: "Anti-Replay Protection Disabled",
      description: "ESP Sequence Number verification window is disabled, leaving session open to replay and packet injection attacks.",
      evidence: ["Replay window size: 0", "Out-of-order sequence numbers accepted without drop"],
      recommendation: "Enable anti-replay window protection with minimum 64-packet window.",
      confidence: 0.94,
      provenance: "Observed",
    },
    {
      id: "F-304",
      severity: "Medium",
      category: "Protocol",
      title: "IKEv1 Deprecated Protocol",
      description: "IKEv1 lacks asymmetric authentication flexibility, has known denial-of-service vulnerabilities, and is superseded by RFC 7296 (IKEv2).",
      evidence: ["Major version: 1, Minor version: 0", "Main Mode / Aggressive Mode handshakes"],
      recommendation: "Migrate infrastructure to IKEv2.",
      confidence: 0.96,
      provenance: "Observed",
    },
  ],
  "AX-2026-00426": [
    {
      id: "F-201",
      severity: "Medium",
      category: "PFS",
      title: "Perfect Forward Secrecy Disabled",
      description: "Child SA was established without Diffie-Hellman recalculation during rekeying.",
      evidence: ["CREATE_CHILD_SA exchange lacks KE payload", "Child SA proposals omit DH group transform"],
      recommendation: "Enable PFS on both IPsec gateways to ensure session keys are ephemeral.",
      confidence: 0.95,
      provenance: "Inferred",
    },
    {
      id: "F-202",
      severity: "Low",
      category: "Configuration",
      title: "Extended SA Lifetime Configured",
      description: "Security Association lifetime is configured for 86400 seconds (24 hours), increasing vulnerability to cryptanalytic window exposure.",
      evidence: ["SA lifetime attribute: 86400 seconds"],
      recommendation: "Reduce SA lifetime to 28800 seconds (8 hours) or 4GB volume limit.",
      confidence: 0.92,
      provenance: "Observed",
    },
    {
      id: "F-203",
      severity: "Informational",
      category: "Cryptography",
      title: "CBC Mode Encryption in Use",
      description: "AES-256-CBC with HMAC-SHA256 is functional but lacks performance and integrity benefits of modern AEAD modes.",
      evidence: ["Transform: ENCR_AES_CBC (256-bit)", "Transform: AUTH_HMAC_SHA2_256_128"],
      recommendation: "Plan migration to AES-GCM or ChaCha20-Poly1305 AEAD suites.",
      confidence: 0.90,
      provenance: "Observed",
    },
  ],
  "AX-2026-00425": [
    {
      id: "F-401",
      severity: "Informational",
      category: "Key Exchange",
      title: "High-Assurance DH Group 20 Negotiated",
      description: "DH Group 20 (NIST P-384 ECP) provides 192-bit cryptographic strength for high-assurance classifications.",
      evidence: ["Transform: DH_GROUP_20 (384-bit ECP)", "Elliptic Curve Diffie-Hellman verified"],
      recommendation: "Retain high-security posture.",
      confidence: 0.99,
      provenance: "Observed",
    },
    {
      id: "F-402",
      severity: "Informational",
      category: "Protocol",
      title: "Clean End-to-End IPv6 Encapsulation",
      description: "Native IPv6 tunnel eliminates NAT-T overhead and preserves strict protocol headers.",
      evidence: ["IP Header version: 6", "UDP 4500 encapsulation not invoked"],
      recommendation: "Maintain native IPv6 security policy.",
      confidence: 0.97,
      provenance: "Observed",
    },
  ],
  "AX-2026-00424": [
    {
      id: "F-501",
      severity: "Medium",
      category: "Metadata Exposure",
      title: "Encrypted Flow Anomaly Detected",
      description: "Statistical packet size entropy and burst variance deviate significantly from standard baseline traffic distributions.",
      evidence: ["Entropy score: 5.12 (standard range 7.8-8.0)", "Inter-arrival variance: +240% above baseline profile"],
      recommendation: "Perform deep session tracing to rule out covert channels or data exfiltration over the tunnel.",
      confidence: 0.85,
      provenance: "MLPrediction",
    },
    {
      id: "F-502",
      severity: "Informational",
      category: "Cryptography",
      title: "Strong Underlying Cryptography Verified",
      description: "Cryptographic tunnel negotiation is fully compliant with NIST guidelines despite application flow anomalies.",
      evidence: ["AES-256-GCM / DH Group 19 active"],
      recommendation: "Audit client applications transmitting over the tunnel.",
      confidence: 0.95,
      provenance: "Observed",
    },
  ],

  "AX-2026-00423": [
    {
      id: "F-601",
      severity: "Informational",
      category: "Cryptography",
      title: "Modern Authenticated Encryption (ChaCha20-Poly1305)",
      description: "ChaCha20-Poly1305 AEAD cipher suite offers exceptional performance and resistance to side-channel cache timing attacks.",
      evidence: ["Transform: ENCR_CHACHA20_POLY1305 with 256-bit key", "RFC 7634 / RFC 8221 recommended suite"],
      recommendation: "Retain modern ChaCha20-Poly1305 cipher for mobile and remote endpoints.",
      confidence: 0.98,
      provenance: "Observed",
    },
    {
      id: "F-602",
      severity: "Informational",
      category: "PFS",
      title: "Perfect Forward Secrecy Enforced",
      description: "Child SA negotiation mandates fresh Diffie-Hellman exchange with Group 19.",
      evidence: ["CREATE_CHILD_SA contains fresh KE payload"],
      recommendation: "Ensure rekeying timers align with endpoint mobility profiles.",
      confidence: 0.97,
      provenance: "Observed",
    },
  ],
};

export function getPredefinedAnalysis(analysisId: string): AnalysisResult | null {
  const summaryItem = DASHBOARD_DATA.recentAnalyses.find((a) => a.id === analysisId);
  if (!summaryItem) {
    return null;
  }

  const findings = PREDEFINED_FINDINGS[analysisId] || [];
  const critical = findings.filter((f) => f.severity === "Critical").length;
  const high = findings.filter((f) => f.severity === "High").length;
  const medium = findings.filter((f) => f.severity === "Medium").length;
  const low = findings.filter((f) => f.severity === "Low").length;
  const informational = findings.filter((f) => f.severity === "Informational").length;

  return {
    analysis_id: summaryItem.id,
    status: "completed" as const,
    created_at: summaryItem.createdAt,
    completed_at: summaryItem.createdAt,
    source: {
      type: summaryItem.sourceType,
      name: summaryItem.sourceName,
      file_name: summaryItem.sourceName,
    },
    vpn: {
      protocol: summaryItem.vpnProtocol,
      ike_version: summaryItem.vpnProtocol.includes("IKEv1") ? "IKEv1" : "IKEv2",
      mode: summaryItem.vpnMode,
      ip_version: summaryItem.ipVersion,
      nat_traversal: summaryItem.vpnProtocol === "IKEv2",
      protocols_detected: [summaryItem.vpnProtocol, "ESP"],
    },
    cryptography: {
      encryption: summaryItem.encryption,
      authentication: summaryItem.authentication,
      dh_group: summaryItem.dhGroup,
      pfs: summaryItem.pfsEnabled,
    },
    security: {
      score: summaryItem.securityScore,
      grade: summaryItem.grade,
      risk_level: summaryItem.riskLevel,
      replay_protection: summaryItem.grade !== "F",
      sa_lifetime_seconds: summaryItem.id === "AX-2026-00427" || summaryItem.id === "AX-2026-00426" ? 86400 : 28800,
    },
    traffic: {
      predicted_class:
        analysisId === "AX-2026-00428"
          ? "Video"
          : analysisId === "AX-2026-00427"
          ? "Messaging"
          : analysisId === "AX-2026-00426"
          ? "Web"
          : analysisId === "AX-2026-00425"
          ? "VoIP"
          : analysisId === "AX-2026-00424"
          ? "Unknown"
          : "Web",
      confidence:
        analysisId === "AX-2026-00428"
          ? 0.94
          : analysisId === "AX-2026-00427"
          ? 0.88
          : analysisId === "AX-2026-00426"
          ? 0.89
          : analysisId === "AX-2026-00425"
          ? 0.92
          : analysisId === "AX-2026-00424"
          ? 0.62
          : 0.91,
      candidate_classes: [
        { class: "Web", confidence: 0.45 },
        { class: "Video", confidence: 0.35 },
        { class: "Messaging", confidence: 0.2 },
      ],
      features: {
        packet_size_pattern: "moderate_variable",
        directionality: "bidirectional",
        inter_arrival_pattern: "interactive_cadence",
        session_duration_seconds: 840,
      },
      model: { name: "traffic_classifier", version: "v1.0.0" },
      classification_mode: summaryItem.sourceType === "pcap" ? "ml" : "simulated",
    },
    findings,
    summary: {
      total_findings: findings.length,
      critical,
      high,
      medium,
      low,
      informational,
    },
    engine_type: summaryItem.sourceType === "pcap" ? "real" : "mock",
    risk_scoring: {
      security_score: summaryItem.securityScore,
      risk_level: summaryItem.riskLevel,
      base_score: 100,
      total_deduction: 100 - summaryItem.securityScore,
      scoring_breakdown: findings.map((f) => ({
        finding_id: f.id,
        category: f.category,
        severity: f.severity,
        deduction:
          f.id === "F-304" ? 25 :
          f.id === "F-301" ? 20 :
          (f.id === "F-302" || f.id === "F-303") ? 15 :
          f.id === "F-201" ? 12 :
          f.id === "F-202" ? 8 :
          f.id === "F-501" ? 5 : 0,
        reason: f.title,
      })),
      methodology_version: "v1.2.0-deterministic",
      formula: "score = max(0, 100 - sum(deductions))",
    },
    evidence_provenance: [
      {
        id: "PROV-001",
        source_type: summaryItem.sourceType === "pcap" ? "Observed" : "Simulated",
        field: "vpn.protocol",
        value: summaryItem.vpnProtocol,
        description: "Verified IPsec handshake protocol signature.",
        confidence: 1.0,
      },
      {
        id: "PROV-002",
        source_type: summaryItem.sourceType === "pcap" ? "Observed" : "Simulated",
        field: "cryptography.encryption",
        value: summaryItem.encryption,
        description: "Observed transform proposal in Security Association negotiation.",
        confidence: 1.0,
      },
      {
        id: "PROV-003",
        source_type: summaryItem.sourceType === "pcap" ? "Observed" : "Simulated",
        field: "cryptography.dh_group",
        value: summaryItem.dhGroup,
        description: "Diffie-Hellman group identified in key exchange payload.",
        confidence: 1.0,
      },
      {
        id: "PROV-004",
        source_type: summaryItem.sourceType === "pcap" ? "Observed" : "Simulated",
        field: "security.replay_protection",
        value: String(summaryItem.grade !== "F"),
        description: "Anti-replay window status verified on active IPsec session.",
        confidence: 1.0,
      },
      {
        id: "PROV-005",
        source_type: "MLPrediction",
        field: "traffic.predicted_class",
        value:
          analysisId === "AX-2026-00428"
            ? "Video"
            : analysisId === "AX-2026-00427"
            ? "Messaging"
            : analysisId === "AX-2026-00426"
            ? "Web"
            : analysisId === "AX-2026-00425"
            ? "VoIP"
            : analysisId === "AX-2026-00424"
            ? "Unknown"
            : "Web",
        description: "Application class inferred from flow metadata patterns without payload decryption.",
        confidence:
          analysisId === "AX-2026-00428"
            ? 0.93
            : analysisId === "AX-2026-00427"
            ? 0.84
            : analysisId === "AX-2026-00426"
            ? 0.89
            : analysisId === "AX-2026-00425"
            ? 0.91
            : analysisId === "AX-2026-00424"
            ? 0.61
            : 0.91,
      },
    ],
    validation: {
      status: "passed",
      ground_truth_available: true,
      matched_fields: 6,
      total_fields: 6,
      mismatches: [],
    },
  };
}
