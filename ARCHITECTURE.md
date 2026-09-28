# AbhedyaX — System Architecture Specification

## 1. Executive Summary

**AbhedyaX** is an AI-powered protocol analyzer and security assessment framework tailored for IPsec Virtual Private Networks (VPNs). It fulfills the requirements of SIH 2026 Problem ID **26160** (National Technical Research Organisation - NTRO).

The framework provides deep protocol visibility, cryptographic configuration auditing, deterministic vulnerability assessment, and machine learning-driven encrypted traffic analysis without requiring tunnel decryption.

```
                      +---------------------------------------+
                      |         Next.js Web Frontend          |
                      |   (SOC Dashboard & Investigation UI)   |
                      +-------------------+-------------------+
                                          |
                                    REST / WebSocket
                                          |
                      +-------------------v-------------------+
                      |          FastAPI REST API             |
                      |         (apps/api Service)            |
                      +-------------------+-------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
         +--------------v--------------+     +--------------v--------------+
         |     MockAnalysisEngine      |     |     RealAnalysisEngine      |
         |  (Phase 1: Simulation/UX)   |     |  (Phase 2+: Live / PCAP)    |
         +-----------------------------+     +--------------+--------------+
                                                            |
                       +------------------------------------+------------------------------------+
                       |                    |                       |                            |
         +-------------v----+     +---------v--------+     +--------v--------+     +-------------v----+
         |   Capture Loader |     | Protocol Parser  |     | ML Classifier   |     | Security Engine  |
         |  (TShark/Scapy)  |     | (IKEv1/2 & ESP)  |     | (Encrypted Flow)|     | (Rules & Scoring)|
         +------------------+     +------------------+     +-----------------+     +------------------+
```

---

## 2. Architecture Principles

1. **Modular Monorepo Structure:** Components are isolated into clear domains (`apps/`, `services/`, `packages/`, `datasets/`, `models/`, `configs/`, `storage/`).
2. **Canonical Contract Decoupling:** The frontend binds exclusively to a versioned API contract (`AnalysisResult`). The underlying engine can switch between simulation and real inspection without frontend changes.
3. **Deterministic Security Decisions:** Cryptographic policy compliance, vulnerability discovery, and risk scoring are strictly deterministic and rule-driven. LLMs are never used to compute security grades or CVSS-equivalent metrics.
4. **Targeted Machine Learning:** Machine learning is focused on statistical flow classification (e.g., distinguishing VoIP from Video or Web within encrypted ESP tunnels) and metadata anomaly detection.
5. **Clear Simulation Indication:** When operating in simulation mode, the UI prominently displays a "Simulation Mode" badge to guarantee transparency and technical integrity.

---

## 3. Analysis Engine Abstraction

The core system defines a uniform abstraction:

```python
class AnalysisEngine(ABC):
    @abstractmethod
    async def analyze_capture(
        self, 
        source_id: str, 
        source_type: SourceType, 
        options: AnalysisOptions
    ) -> AnalysisResult:
        """Executes full analysis pipeline and returns canonical AnalysisResult."""
        pass
```

### Implementations:
- **`MockAnalysisEngine` (Phase 1):** Loads realistic pre-configured scenario models (`secure-enterprise`, `weak-configuration`, etc.) and returns populated canonical `AnalysisResult` structures for UI validation and demonstrations.
- **`RealAnalysisEngine` (Phase 2+):** Coordinates `capture_loader`, `ike_analyzer`, `esp_analyzer`, `security_assessor`, and the `ml_classifier` to produce identical `AnalysisResult` structures from physical network traffic and PCAPs.

---

## 4. Canonical Analysis Modules

The analysis pipeline is structured into 9 canonical modules:

1. **`capture_loader`**: Ingestion of PCAP/PCAPNG files or live interfaces via `libpcap` / `tshark` stream wrappers.
2. **`protocol_identifier`**: Demultiplexes IKE (UDP 500/4500), ESP (IP Protocol 50), AH (IP Protocol 51), and NAT-Traversal headers.
3. **`ike_analyzer`**: Extracts Phase 1 / Phase 2 (IKEv1) or IKE_SA_INIT / IKE_AUTH / CREATE_CHILD_SA (IKEv2) proposal payloads, transforms, SPIs, and exchange types.
4. **`esp_analyzer`**: Analyzes sequence number distributions, anti-replay window state, IV randomness, and encapsulation modes (Tunnel vs Transport).
5. **`traffic_classifier`**: Extracts flow-level packet length distributions, inter-arrival times, and bursts for statistical ML classification of encrypted payload types.
6. **`security_assessor`**: Evaluates active cryptographic parameters against NIST SP 800-77, RFC 8221, and ANSSI recommendations.
7. **`risk_engine`**: Computes deterministic risk scores (0–100), overall security grade (A through F), and risk level (Low, Medium, High, Critical).
8. **`finding_engine`**: Emits structured, evidence-backed security findings (CVEs, weak cipher suites, truncated MACs, missing PFS).
9. **`report_generator`**: Produces executive and deep-dive technical reports in PDF and JSON formats.

---

## 5. Security Assessment Categories

The deterministic rule engine evaluates 10 core dimensions:

| Category | Evaluation Scope |
| :--- | :--- |
| **`cryptographic_strength`** | Symmetric encryption algorithms (e.g. 3DES, AES-CBC vs AES-GCM), key lengths (128 vs 256 bit). |
| **`authentication`** | Integrity algorithms (MD5, SHA1 vs SHA2-256/384/512), pre-shared keys vs certificates, auth exchange validity. |
| **`key_exchange`** | Diffie-Hellman groups (DH Group 1, 2, 5 [Insecure] vs Group 14, 19, 20, 21 [Secure]). |
| **`perfect_forward_secrecy`** | Verification of PFS enablement in Child SA negotiation. |
| **`security_association_parameters`** | SA validation, SPI uniqueness, mode of operation (Tunnel vs Transport). |
| **`key_lifetime`** | Rekeying interval thresholds (time in seconds, volume in kilobytes). |
| **`replay_protection`** | Anti-replay window size verification and sequence number rollover mitigation. |
| **`cipher_strength`** | Resistance against known cryptanalytic attacks (e.g., Sweet32, Bleichenbacher, Logjam equivalents). |
| **`configuration_posture`** | Aggressive Mode detection in IKEv1, NAT-T port floating, cleartext identity exposure. |
| **`metadata_exposure`** | Leaked payload lengths, traffic flow patterns, and side-channel exposure. |

---

## 6. Traffic Intelligence & Classes

Encrypted payload traffic is classified by the ML subsystem into 7 canonical categories:
- **`VoIP`**: Low packet sizes, low jitter, strict inter-arrival cadence (RTP characteristics).
- **`Messaging`**: Infrequent short bursts, long idle gaps.
- **`Email`**: Sporadic mid-size payloads with bursty transfers (IMAP/SMTP over IPsec).
- **`Web`**: High variability in size and bursts, bidirectional flow (HTTPS encapsulation).
- **`ICMP`**: Deterministic interval, fixed small sizes.
- **`Video`**: Continuous high-throughput bursts, large frame-sized packets.
- **`Unknown`**: Non-conforming or anomalous statistical profiles.

---

## 7. Canonical API Contract (`AnalysisResult`)

```json
{
  "analysis_id": "string (UUIDv4)",
  "status": "completed | processing | failed",
  "created_at": "ISO-8601 string",
  "source": {
    "type": "simulation | pcap | live",
    "name": "string",
    "hash_sha256": "string (optional)",
    "packet_count": 0,
    "duration_seconds": 0.0
  },
  "vpn": {
    "protocol": "IPsec",
    "ike_version": "IKEv1 | IKEv2",
    "mode": "Tunnel | Transport",
    "ip_version": "IPv4 | IPv6",
    "nat_traversal": true,
    "initiator_spi": "string (hex)",
    "responder_spi": "string (hex)"
  },
  "cryptography": {
    "encryption": "AES-256-GCM | AES-256-CBC | 3DES-CBC | ChaCha20-Poly1305",
    "authentication": "HMAC-SHA2-256-128 | HMAC-SHA1-96 | HMAC-MD5-96 | None (AEAD)",
    "dh_group": "Group 19 (ECP256) | Group 14 (MODP2048) | Group 2 (MODP1024)",
    "pfs": true
  },
  "security": {
    "score": 88,
    "grade": "A | B | C | D | F",
    "risk_level": "Low | Medium | High | Critical",
    "checks_passed": 18,
    "checks_failed": 2,
    "checks_total": 20
  },
  "traffic": {
    "predicted_class": "VoIP | Messaging | Email | Web | ICMP | Video | Unknown",
    "confidence": 0.94,
    "entropy": 7.98,
    "flow_rate_kbps": 1420.5
  },
  "findings": [
    {
      "id": "FIND-001",
      "category": "perfect_forward_secrecy",
      "severity": "Medium",
      "title": "PFS Disabled on Child SA",
      "description": "Child SA was established without Diffie-Hellman recalculation during rekeying.",
      "remediation": "Enable PFS (dh-group in phase 2 proposal) on both endpoints.",
      "rfc_reference": "RFC 7296 Section 1.3"
    }
  ],
  "timeline": [
    {
      "timestamp": "ISO-8601",
      "message_type": "IKE_SA_INIT",
      "direction": "Initiator -> Responder",
      "exchange_id": 0,
      "details": "Negotiated Proposal: AES_GCM_16_256 / PRF_HMAC_SHA2_256 / ECP_256"
    }
  ],
  "metadata": {
    "engine_version": "0.1.0",
    "simulation_scenario": "secure-enterprise",
    "execution_time_ms": 145
  }
}
```

---

## 8. Simulation Scenarios (Phase 1)

1. **`secure-enterprise`**: IKEv2, AES-256-GCM, DH Group 19 (ECP-256), PFS enabled, replay protection enabled. High Score (95+, Grade A, Low Risk).
2. **`moderate-security`**: IKEv2, AES-256-CBC with HMAC-SHA256, DH Group 14 (MODP-2048), PFS disabled. Moderate Score (70-79, Grade C, Medium Risk).
3. **`weak-configuration`**: IKEv1 Aggressive Mode, 3DES-CBC / MD5, DH Group 2 (MODP-1024), PFS disabled, extended SA lifetime. Critical Score (<50, Grade F, Critical Risk).
4. **`secure-ipv6`**: IPv6 IKEv2 tunnel, modern AEAD ciphers, clean header hygiene. High Score (92+, Grade A, Low Risk).
5. **`traffic-anomaly`**: Encrypted tunnel exhibiting abnormal metadata variance, packet burst anomalies, and high-frequency retransmissions. Elevated Risk (Grade D, High Risk).

---

## 9. Frontend Screen Taxonomy (Phase 1)

1. **Dashboard:** Global posture overview, active tunnels, recent scans, threat heatmap.
2. **Analyze:** Upload PCAP or select simulation scenario, configuration of analysis depth.
3. **Analysis Processing:** Visual progress indicator with staged analysis pipeline feedback.
4. **Analysis Overview:** High-level summary of a specific analysis session (scores, tunnel specs).
5. **Findings:** Granular, filterable security issues categorized with remediation guidance.
6. **Traffic Intelligence:** Flow classification distribution, bandwidth profiles, entropy charts.
7. **Reports:** Interactive preview and export options for PDF/JSON audit reports.
8. **Testbed:** strongSwan virtual scenario controller, status of virtual namespaces.
9. **AI Intelligence:** ML model explanations, feature importance, traffic inference metrics.
10. **Settings:** Platform configuration, simulation defaults, compliance threshold settings.
