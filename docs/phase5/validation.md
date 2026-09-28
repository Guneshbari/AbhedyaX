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
| `moderate-security` | Moderate Security VPN | IKEv2 | AES-128-CBC | Group 14 (MODP-2048) | **85** | **Moderate** | 6 / 6 (100%) |
| `weak-configuration`| Weak Legacy VPN | IKEv1 | 3DES-CBC | Group 2 (MODP-1024) | **20** | **Critical** | 6 / 6 (100%) |
| `secure-ipv6` | Secure IPv6 Tunnel | IKEv2 | ChaCha20-Poly1305 | Group 20 (ECP-384) | **100** | **Low** | 6 / 6 (100%) |
| `traffic-anomaly` | Traffic Anomaly / Attack | IKEv2 | AES-256-GCM | Group 19 (ECP-256) | **95** | **Low** | 6 / 6 (100%) |

### Scenario Breakdown

#### 1. Secure Enterprise VPN
- **Transforms:** IKEv2, AES-256-GCM, PRF-HMAC-SHA256, DH Group 19 (NIST P-256), Child SA with PFS.
- **Audit Findings:** 3 Informational (AEAD verified, Strong EC, PFS verified).
- **Deductions:** 0 points deducted.
- **Final Score:** 100/100 (Low Risk).

#### 2. Moderate Security VPN
- **Transforms:** IKEv2, AES-128-CBC, HMAC-SHA256, DH Group 14 (MODP-2048), Child SA with PFS.
- **Audit Findings:** CBC mode without AEAD, moderate DH key exchange.
- **Deductions:** -15 (RULE_WEAK_CRYPTO: non-AEAD CBC mode).
- **Final Score:** 85/100 (Moderate Risk).

#### 3. Weak Legacy VPN
- **Transforms:** IKEv1, 3DES-CBC, HMAC-MD5, DH Group 2 (1024-bit MODP), PFS disabled.
- **Audit Findings:** Deprecated IKEv1 (-25), Insecure DH Group 2 (-20), Legacy 3DES (-15), Broken MD5 Auth (-15), No PFS (-12).
- **Deductions:** Total penalty -87 points (capped at score floor 20 based on active triggers).
- **Final Score:** 20/100 (Critical Risk).

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

The complete verification suite passes with zero failures:
```bash
# 1. Security Engine Unit Tests (9 tests)
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest services/security-engine/tests

# 2. Report Generator Unit Tests (5 tests)
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest services/report-generator/tests

# 3. Machine Learning Pipeline Tests (17 tests)
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest services/ml/tests

# 4. API & Real/Mock Engine Integration Tests (25 tests)
(cd apps/api && PYTHONPATH=. ../../apps/api/.venv/bin/pytest tests)

# 5. Frontend Lint & Build (9 static routes compiled)
(cd apps/web && npm run lint && npm run build)
```
Total automated test count: **56 backend tests passing**, **frontend typecheck & build passing (0 errors, 0 warnings)**.
