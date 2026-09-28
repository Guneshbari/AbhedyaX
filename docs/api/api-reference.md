# AbhedyaX REST API Reference

The **AbhedyaX API** is built on FastAPI and Pydantic v2, providing a high-performance, asynchronous REST interface for IPsec protocol inspection, cryptographic security scoring, encrypted traffic intelligence, testbed execution, and report generation.

- **Base URL:** `http://localhost:8000/api/v1`
- **Interactive Swagger UI:** `http://localhost:8000/docs`
- **ReDoc Specification:** `http://localhost:8000/redoc`
- **OpenAPI Schema (JSON):** `http://localhost:8000/openapi.json`

---

## 1. System Health & Environment

### `GET /health` or `GET /api/v1/health`
Liveness check for container orchestration and uptime monitoring.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "app": "AbhedyaX API",
  "timestamp": "2026-09-29T01:40:00.000000Z"
}
```

### `GET /api/v1/analyses/environment`
Inspects server capabilities, TShark/Wireshark CLI availability, version, and capture file limits.

**Response:** `200 OK`
```json
{
  "engine_mode": "mock",
  "tshark_available": true,
  "tshark_version": "TShark (Wireshark) 4.2.2",
  "tshark_binary": "tshark",
  "max_pcap_size_mb": 250,
  "timeout_seconds": 120,
  "supported_formats": [".pcap", ".pcapng"]
}
```

### `GET /api/v1/analyses/ml/model`
Retrieves metadata, performance metrics, and feature importances for the active encrypted traffic classification model.

**Response:** `200 OK`
```json
{
  "status": "ready",
  "model_name": "traffic_classifier",
  "model_version": "v1.0.0",
  "algorithm": "RandomForestClassifier",
  "dataset_version": "v1.0.0",
  "feature_count": 28,
  "classes": ["VoIP", "Video", "Web", "Messaging", "DNS"],
  "abstention_threshold": 0.55,
  "metrics": {
    "test_accuracy": 0.812,
    "test_macro_f1": 0.778
  },
  "created_at": "2026-09-28T14:48:33Z"
}
```

---

## 2. Analyses & Ingestion Lifecycle

### `GET /api/v1/analyses/scenarios`
Returns the list of predefined RFC benchmark simulation profiles.

**Response:** `200 OK` (Array of Scenario Objects)
- `secure-enterprise` (IKEv2, AES-256-GCM, DH19, PFS: True)
- `moderate-security` (IKEv2, AES-256-CBC, DH14, PFS: False)
- `weak-configuration` (IKEv1, AES-128-CBC, SHA-1, DH2, PFS: False, Replay: Off)
- `secure-ipv6` (IKEv2 IPv6, AES-256-GCM, DH20, PFS: True)
- `traffic-anomaly` (IKEv2, AES-256-GCM, Flow Entropy Anomaly)

### `POST /api/v1/analyses`
Creates and queues a new analysis session for a benchmark simulation scenario.

**Request Body:**
```json
{
  "source_type": "simulation",
  "scenario_id": "weak-configuration"
}
```

**Response:** `201 Created`
```json
{
  "analysis_id": "AX-2026-00429",
  "status": "queued",
  "source_type": "simulation"
}
```

### `POST /api/v1/analyses/upload`
Uploads a real `.pcap` or `.pcapng` capture file for deep protocol dissection via TShark.

**Request:** `multipart/form-data`
- `file`: Binary capture file (`.pcap` or `.pcapng`, up to 250 MB)
- `analysis_name` (optional): Human-readable label

**Example `curl`:**
```bash
curl -X POST http://localhost:8000/api/v1/analyses/upload \
  -F "file=@datasets/scenarios/pcaps/modern-ikev2-aes256gcm.pcap"
```

**Response:** `201 Created`
```json
{
  "analysis_id": "AX-2026-REAL-701",
  "status": "processing",
  "source_type": "pcap"
}
```

### `GET /api/v1/analyses/{analysis_id}/status`
Polls the processing pipeline and stepper progress.

**Response:** `200 OK`
```json
{
  "analysis_id": "AX-2026-REAL-701",
  "status": "completed",
  "progress": 100,
  "current_step": "Analysis Complete",
  "message": "Successfully analyzed 14 packets using TShark."
}
```

### `GET /api/v1/analyses/{analysis_id}`
Retrieves the complete, canonical `AnalysisResult` contract.

**Response:** `200 OK`
```json
{
  "analysis_id": "AX-2026-00427",
  "status": "completed",
  "created_at": "2026-09-28T15:45:00Z",
  "completed_at": "2026-09-28T15:45:00Z",
  "source": {
    "type": "simulation",
    "name": "legacy-branch-04.pcap",
    "file_name": "legacy-branch-04.pcap"
  },
  "vpn": {
    "protocol": "IPsec",
    "ike_version": "IKEv1",
    "mode": "Tunnel",
    "ip_version": "IPv4",
    "nat_traversal": true,
    "protocols_detected": ["IKEv1", "ESP"]
  },
  "cryptography": {
    "encryption": "AES-128-CBC",
    "authentication": "HMAC-SHA1",
    "dh_group": "DH Group 2",
    "pfs": false
  },
  "security": {
    "score": 25,
    "grade": "F",
    "risk_level": "Critical",
    "replay_protection": false,
    "sa_lifetime_seconds": 86400
  },
  "traffic": {
    "predicted_class": "Messaging",
    "confidence": 0.84,
    "candidate_classes": [
      { "class": "Messaging", "confidence": 0.84 },
      { "class": "Web", "confidence": 0.11 }
    ]
  },
  "findings": [
    {
      "id": "F-301",
      "severity": "High",
      "category": "Key Exchange",
      "title": "Deprecated Key Exchange (DH Group 2)",
      "description": "Diffie-Hellman Group 2 (MODP-1024) is cryptographically deficient and vulnerable to state-level precomputation attacks (Logjam).",
      "evidence": ["Proposal DH Group: 2 (1024-bit MODP)"],
      "recommendation": "Immediately upgrade to DH Group 14 (MODP-2048) or Group 19 (ECP-256).",
      "provenance": "Observed"
    }
  ],
  "summary": {
    "total_findings": 4,
    "critical": 0,
    "high": 2,
    "medium": 2,
    "low": 0,
    "informational": 0
  },
  "risk_scoring": {
    "security_score": 25,
    "risk_level": "Critical",
    "base_score": 100,
    "total_deduction": 75,
    "scoring_breakdown": [
      { "finding_id": "F-301", "deduction": 20, "reason": "Diffie-Hellman groups < 2048-bit vulnerable to precomputation." },
      { "finding_id": "F-302", "deduction": 15, "reason": "Legacy cipher/hash algorithms vulnerable to collision attacks." },
      { "finding_id": "F-303", "deduction": 15, "reason": "Anti-replay sequence number checking disabled." },
      { "finding_id": "F-304", "deduction": 25, "reason": "IKEv1 is obsolete (RFC 7296) and vulnerable to dictionary attacks." }
    ],
    "methodology_version": "v1.2.0-deterministic"
  }
}
```

### `GET /api/v1/analyses`
Returns all completed analyses across real and simulated sessions, sorted by creation timestamp descending.

**Response:** `200 OK` (Array of `AnalysisResult` objects)

---

## 3. Reports & Exports

### `GET /api/v1/analyses/{analysis_id}/report/executive`
Renders an executive-ready HTML security report with clean layout, scorecards, risk band actions, and `@media print` CSS for saving as PDF.

**Response:** `200 OK` (`text/html`)

### `GET /api/v1/analyses/{analysis_id}/report/technical`
Renders an in-depth technical HTML report detailing negotiated transforms, SA parameters, wire evidence, and score deduction breakdown.

**Response:** `200 OK` (`text/html`)

### `GET /api/v1/analyses/{analysis_id}/report/json`
Downloads the canonical JSON assessment with `Content-Disposition: attachment; filename=abhedyax_analysis_{analysis_id}.json`.

**Response:** `200 OK` (`application/json`)

---

## 4. strongSwan Testbed Operations

### `GET /api/v1/testbed/scenarios`
Returns the 5 controlled strongSwan VPN scenarios (`ts-secure-ikev2-gcm`, `ts-aes256-cbc`, `ts-weak-dh`, `ts-legacy-ikev1`, `ts-secure-ipv6`).

### `GET /api/v1/testbed/environment`
Checks host readiness for testbed execution: Linux kernel, `iproute2` namespaces, `swanctl` / `strongswan`, `tcpdump`, and root / sudo access.

### `POST /api/v1/testbed/execute`
Initiates controlled VPN provisioning, tunnel negotiation, traffic generation, and packet capture in isolated network namespaces (`ns_left`, `ns_right`).

---

## 5. HTTP Error Handling & Status Codes

| Status Code | Meaning | Example Condition |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | Telemetry, report, status, or results retrieved |
| `201 Created` | Resource instantiated | Analysis session created or file uploaded |
| `400 Bad Request` | Invalid payload or file | Unsupported file extension, malformed parameters |
| `404 Not Found` | Resource does not exist | Unknown `analysis_id` or non-existent scenario |
| `409 Conflict` | Lifecycle conflict | Analysis still processing when result requested |
| `413 Payload Too Large` | Capture exceeds limit | Uploaded file > 250 MB |
| `503 Service Unavailable`| Missing tool dependency | Real PCAP uploaded but `tshark` is not in PATH |
