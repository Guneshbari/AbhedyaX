# AbhedyaX — Demo Data Provider & Offline Resilience Specification

This document details the architecture, data contracts, and verification procedures for the **Demo Data Provider** in AbhedyaX.

---

## 1. Motivation & Design Goals

During hackathons and presentation evaluations, web services hosted on free-tier infrastructure (such as Render or Fly.io) frequently experience:
- Idle sleep mode requiring 50+ seconds to spin up.
- Rate limiting or intermittent outbound network latency.
- Cross-Origin Resource Sharing (CORS) blocks if host configurations mismatch.

AbhedyaX resolves this with an **API-Optional Architecture**. Rather than presenting judges with a failed network request or broken loading state, the frontend defaults to the `DemoDataProvider`.

### Core Invariants:
1. **Identical UI Components**: The exact same React pages, charts, navigation flows, and export tools consume the data.
2. **Canonical Data Authority**: All scores, findings, deductions, and evidence match the canonical dataset locked in Phase 5.2 and Phase 6.
3. **Transparent Provenance**: Telemetry items explicitly indicate provenance (`GroundTruth`, `Observed Wire`, or `Simulated`).

---

## 2. Supported Modes

The application supports three data modes configured via `NEXT_PUBLIC_DATA_MODE` or dynamically via the Topbar modal / Settings page:

| Mode | Behavior | Use Case |
| :--- | :--- | :--- |
| `demo` | Instant local responses from memory; zero HTTP requests made. | Public evaluations, PPT submissions, offline review. |
| `auto` | Starts immediately with demo data for zero initial load delay; background worker probes `/health` (2s timeout). Upgrades to live backend if healthy. | Production hybrid deployments. |
| `api` | Strictly routes all requests to the FastAPI backend service. | Local development with live strongSwan kernel or Docker stack. |

---

## 3. Canonical Scenarios Reference

The demo provider serves 6 canonical scenario sessions:

| ID | Name | Protocol & Cipher | Score | Grade | Risk | Key Deductions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AX-2026-00428` | Enterprise Baseline | IKEv2 / AES-256-GCM / DH 19 | **100** | **A** | **Low** | 0 deductions (NIST SP 800-77 compliant) |
| `AX-2026-00427` | Legacy Branch 04 | IKEv1 / AES-128-CBC / SHA-1 / DH 2 | **25** | **F** | **Critical** | -25 (IKEv1), -20 (DH 2), -15 (CBC/SHA1), -15 (No Replay) |
| `AX-2026-00426` | DR Backup Link | IKEv2 / AES-256-CBC / SHA-256 / DH 14 | **80** | **B** | **Moderate** | -12 (PFS Disabled), -8 (24h SA Lifetime) |
| `AX-2026-00425` | Cloud Gateway IPv6 | IKEv2 / AES-256-GCM / DH 20 (IPv6) | **100** | **A** | **Low** | 0 deductions (CNSA Suite B baseline) |
| `AX-2026-00424` | Perimeter Tap Anomaly | IKEv2 / AES-256-GCM / DH 19 | **95** | **A** | **Low** | -5 (Side-Channel Cadence Anomaly F-401) |
| `AX-2026-00423` | Remote Worker PCAP | IKEv2 / ChaCha20-Poly1305 / DH 19 | **100** | **A** | **Low** | 0 deductions (Observed Wire WireGuard/IPsec) |

---

## 4. Verification Suite

The demo provider has a standalone verification test suite verifying all 11 subsystems:

```bash
cd apps/web
npx tsx tests/test-demo-provider.ts
```

Output:
```
=================================================
  AbhedyaX Demo Data Provider Verification Suite 
=================================================
[1/11] Testing Health & Environment Diagnostics...
  ✓ PASS: checkHealth() returns demo engine status
  ✓ PASS: getEnvironmentStatus() returns valid pcap support
[2/11] Testing Canonical Scenario Coverage & Scores...
  ✓ PASS: getAnalyses() returns exactly 6 canonical analyses
  ✓ PASS: Scenario AX-2026-00428: Score=100/100, Grade=A, Risk=Low
  ✓ PASS: Scenario AX-2026-00427: Score=25/25, Grade=F, Risk=Critical
  ...
=================================================
  Tests Completed: 31 Passed, 0 Failed
=================================================
```
