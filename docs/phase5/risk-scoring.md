# AbhedyaX Deterministic Security Risk Scoring Engine

## 1. Executive Summary & Design Principle
The AbhedyaX Security Risk Engine (`services/security-engine`) calculates security posture scores through an auditable, deterministic deduction model rather than subjective weighting or ungrounded machine-learning scoring.

### Core Architectural Principle
> **Rule of Orthogonality:** Protocol configuration security is deterministic and auditable. AI and Machine Learning are utilized exclusively for zero-payload application traffic classification from flow metadata, never for computing the security risk score.

No LLM or stochastic model is permitted in the numerical scoring path. Every point deducted from the baseline score of 100 directly corresponds to an observed cryptographic weakness or configuration flaw.

---

## 2. Mathematical Deduction Model

### Mathematical Formulation
$$\text{Security Score} = \max\left(0, 100 - \sum_{i=1}^{n} D_i\right)$$

Where:
- Base score is fixed at $100$.
- $D_i \in \mathbb{N}^+$ represents the penalty points deducted for active rule trigger $i$.
- Anti-double-counting constraints prevent applying multiple penalties for the same root-cause vulnerability.

### Calibrated Risk Bands
Risk levels are categorized according to NIST SP 800-77 Rev. 1 and RFC 8221 security guidelines:

| Score Range | Risk Level | Grade | Operational Posture | Recommended Remediation Action |
| :--- | :--- | :---: | :--- | :--- |
| **90 – 100** | **Low** | A | Robust defense posture; compliant with NIST SP 800-77 & NSA CNSA standards. | Routine policy audits; monitor upcoming post-quantum baselines. |
| **75 – 89** | **Moderate** | B | Minor compliance deviations or non-critical configuration trade-offs. | Plan migration within standard change-management cycles. |
| **50 – 74** | **High** | C | Significant cryptographic exposure or deprecated parameters in active use. | Expedite remediation; reconfigure transform proposals. |
| **0 – 49** | **Critical** | F | High-severity vulnerability (e.g. deprecated protocol, weak DH, broken cipher). | Immediate emergency intervention; revoke active SAs. |

---

## 3. Auditable Deduction Catalog

The 8 standardized risk deduction rules implemented in `services/security-engine/src/rules.py`:

| Rule ID | Finding Trigger Condition | Category | Severity | Deduction | Audit Rationale & Standards Reference |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `RULE_IKEV1` | Deprecated IKE version 1 negotiated | Protocol | Critical | **-25** | Deprecated per RFC 9395; lacks asymmetric authentication protections and modern DoS resistance. |
| `RULE_WEAK_DH` | Legacy DH Group (Group 1, 2, 5, 22, 23, 24) | Key Exchange | Critical | **-20** | Insufficient key length (<2048-bit MODP); vulnerable to Logjam and precomputation attacks per NIST SP 800-131A. |
| `RULE_WEAK_CRYPTO`| Deprecated cipher (3DES, DES, RC4, Blowfish, AES-CBC-128) | Cryptography | High | **-15** | Sweet32 collision attacks on 64-bit blocks or absence of authenticated encryption (AEAD). |
| `RULE_NO_REPLAY` | Anti-replay window disabled ($0$ or inactive) | Replay Protection | High | **-15** | RFC 4303 Section 3.4.3 violation; allows packet injection and state manipulation by on-path adversaries. |
| `RULE_WEAK_AUTH` | Broken hash/MAC algorithms (MD5, SHA-1, 96-bit truncation) | Authentication | High | **-15** | Cryptanalytic collision vulnerabilities; violates NIST SP 800-131A Rev. 2. |
| `RULE_NO_PFS` | Perfect Forward Secrecy disabled on Child SA | PFS | Medium | **-12** | Compromise of initial IKE SA or long-term private key enables retrospective decryption of all Child SAs. |
| `RULE_EXTENDED_SA`| SA lifetime exceeds 24 hours ($>86400\text{s}$) | SA Lifetime | Low | **-8** | Excess key material exposure under continuous cryptographic operations without rekeying. |
| `RULE_TRAFFIC_ANOMALY`| Statistical traffic anomaly or unexpected metadata burst | Traffic Intelligence | Low | **-5** | Observable flow behavior deviates significantly from baseline operational profile. |

---

## 4. Anti-Double-Counting Logic
In real-world captures, multiple finding notifications may stem from the same root configuration item (e.g., both an informational and high-severity note on DH Group 2). The engine guarantees:
1. **Category Isolation:** Each unique finding ID and rule identifier can only trigger a deduction once per analysis session.
2. **Maximum Penalty Selection:** If multiple candidate rules match the same finding ID, only the highest deduction penalty applies.
3. **Score Floor:** The calculated security score cannot drop below zero ($\max(0, \text{score})$).

---

## 5. Subsystem Architecture & Code Structure
```
services/security-engine/
├── pyproject.toml               # Pytest configuration and package definitions
├── src/
│   ├── __init__.py             # Public exports
│   ├── models.py               # RiskScoringResult, ScoringDeduction Pydantic schemas
│   ├── methodology.py          # Score-to-band normalization logic (v1.2.0-deterministic)
│   ├── rules.py                # 8 deterministic deduction rules and finding matching
│   └── risk_engine.py          # RiskScoringEngine evaluation service & singleton
└── tests/
    ├── test_risk_engine.py     # Evaluation and scenario testing (4 tests)
    └── test_rules.py           # Deduction verification and edge cases (5 tests)
```
All unit tests are verified under Python 3.12 with pytest:
```bash
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest services/security-engine/tests
```
