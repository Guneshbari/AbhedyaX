# AbhedyaX End-to-End Validation & Ground-Truth Verification

## 1. Validation Overview
Phase 5 ensures that AbhedyaX operates as a cohesive, deterministic, and verifiable framework across all phases. The system guarantees that:
1. **Engine Polymorphism:** Both `MockAnalysisEngine` and `RealAnalysisEngine` emit identical canonical `AnalysisResult` structures.
2. **Ground-Truth Fidelity:** Wire dissection results match strongSwan testbed configurations without hallucinations.
3. **Reproducible Demonstrations:** 5 canonical benchmark scenarios exercise all risk levels, encryption suites, and traffic patterns.

---

## 2. Canonical Demo Scenarios

| Scenario ID | Name | IKE Ver | Encryption | DH Group | Score | Risk Band | Ground Truth Match |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| `secure-enterprise` | Secure Enterprise VPN | IKEv2 | AES-256-GCM | Group 19 (ECP-256) | **100** | **Low** | 6 / 6 (100%) |
| `moderate-security` | Moderate Security VPN | IKEv2 | AES-128-CBC | Group 14 (MODP-2048) | **80** | **Moderate** | 6 / 6 (100%) |
| `weak-configuration`| Weak Legacy VPN | IKEv1 | AES-128-CBC | Group 2 (MODP-1024) | **25** | **Critical** | 6 / 6 (100%) |
| `secure-ipv6` | Secure IPv6 Tunnel | IKEv2 | ChaCha20-Poly1305 | Group 20 (ECP-384) | **100** | **Low** | 6 / 6 (100%) |
| `traffic-anomaly` | Traffic Anomaly / Attack | IKEv2 | AES-256-GCM | Group 19 (ECP-256) | **95** | **Low** | 6 / 6 (100%) |
| `baseline-compliant` | Production Perimeter Tunnel | IKEv2 | AES-256-GCM | Group 19 (ECP-256) | **100** | **Low** | 6 / 6 (100%) |

### Scenario Breakdown

#### 1. Secure Enterprise VPN
- **Transforms:** IKEv2, AES-256-GCM, PRF-HMAC-SHA256, DH Group 19 (NIST P-256), Child SA with PFS.
- **Audit Findings:** 3 Informational (AEAD verified, Strong EC, PFS verified).
- **Deductions:** 0 points deducted.
- **Final Score:** 100/100 (Low Risk).

#### 2. Moderate Security VPN
- **Transforms:** IKEv2, AES-128-CBC, HMAC-SHA256, DH Group 14 (MODP-2048), Child SA with PFS.
- **Audit Findings:** CBC mode without AEAD, moderate DH key exchange.
- **Deductions:** -20 (RULE_WEAK_CRYPTO: non-AEAD CBC mode).
- **Final Score:** 80/100 (Moderate Risk).

#### 3. Weak Legacy VPN
- **Transforms:** IKEv1, AES-128-CBC, HMAC-SHA1, DH Group 2 (1024-bit MODP), PFS disabled.
- **Audit Findings:** Deprecated IKEv1 (F-304, -25), Insecure DH Group 2 (F-301, -20), Weak AES-CBC-128/SHA-1 (F-302, -15), Anti-Replay Disabled (F-303, -15).
- **Deductions:** Total penalty -75 points.
- **Final Score:** 25/100 (Critical Risk).

#### 4. Secure IPv6 Tunnel
- **Transforms:** IKEv2 over IPv6, ChaCha20-Poly1305 AEAD, DH Group 20 (NIST P-384), Child SA with PFS.
- **Audit Findings:** Posture meets NSA Commercial National Security Algorithm (CNSA) Suite.
- **Deductions:** 0 points deducted.
- **Final Score:** 100/100 (Low Risk).

#### 5. Traffic Anomaly / High-Entropy Burst
- **Transforms:** IKEv2, AES-256-GCM, DH Group 19.
- **Audit Findings:** Flow cadence anomaly detected via packet inter-arrival clustering.
- **Deductions:** -5 (RULE_TRAFFIC_ANOMALY).
- **Final Score:** 95/100 (Low Risk).

---

## 3. Testbed Ground-Truth Verification

The strongSwan testbed (`services/testbed`) generates controlled network traffic inside isolated Linux network namespaces (`ns_initiator`, `ns_responder`).
- When a scenario is executed, the testbed writes a `ground_truth.json` file recording exact swanctl configuration parameters.
- When AbhedyaX analyzes the resulting capture file, `RealAnalysisEngine` cross-references extracted wire values against the ground-truth metadata:
  1. `vpn.protocol`
  2. `vpn.ike_version`
  3. `vpn.mode`
  4. `cryptography.encryption`
  5. `cryptography.dh_group`
  6. `cryptography.pfs`
- When all 6 parameters match, `validation.status = "passed"` with `matched_fields = 6` and `total_fields = 6`.

---

## 4. Test Suite Execution & Results

The complete verification suite passes with zero failures across all components:
```bash
# 1. Security Engine Unit Tests (9 tests)
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest services/security-engine/tests

# 2. Report Generator Unit Tests (5 tests)
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest services/report-generator/tests

# 3. Machine Learning Pipeline Tests (17 tests)
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest services/ml/tests

# 4. Testbed & Integration Scenarios (14 tests)
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest services/testbed/tests

# 5. API, Real/Mock Engine & USP Feature Tests (54 tests)
(cd apps/api && PYTHONPATH=. ../../apps/api/.venv/bin/pytest tests)

# 6. Frontend Lint, Typecheck & Production Build (17 routes compiled)
(cd apps/web && npm run lint && npx tsc --noEmit && npm run build)
```
Total automated test count: **99 backend tests passing**, **frontend typecheck & build passing (0 errors, 0 warnings across 17 static and dynamic routes)**.

---

## 5. Phase 6 USP Layer Verification

The USP Layer (`services/security-twin` and its corresponding API / UI routes) undergoes rigorous automated testing via `apps/api/tests/test_usp_features.py`:

1. **Security Twin Alignment:** Verifies that compliant tunnels yield `status="aligned"` and weak tunnels produce expected deviations with exact security score impacts.
2. **Configuration Drift Computation:** Proves that comparing modern enterprise and legacy configurations yields exact mathematical score delta $\Delta s = -75$, correctly identifying introduced critical vulnerabilities and cryptographic downgrades.
3. **5-Step Auditable Reasoning:** Verifies deduction chain continuity from raw wire SPI evidence through NIST rule references, penalty deductions, and actionable remediation steps.
4. **Zero-Payload Metadata Exposure:** Validates that 5 observable flow dimensions (Timing, Size Pattern, Directionality, Burst Pattern, Flow Duration) produce valid risk scores ($0 \le score \le 100$) without decrypting inner ESP ciphertext payloads.
5. **Posture Timeline Aggregation:** Tests chronological sorting, health category derivation, and inter-session transition status tracking over multi-session analysis runs.

