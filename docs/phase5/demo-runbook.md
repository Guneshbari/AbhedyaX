# AbhedyaX Hackathon Live Demonstration Runbook

## 1. Demo Metadata & Problem Statement
- **Problem Statement:** AI-Powered IPsec VPN Protocol Analyzer and Security Assessment Framework
- **Problem ID:** 26160
- **Organization:** National Technical Research Organisation (NTRO)
- **Time Allocation:** 5 – 7 Minutes Live Pitch & Demo

---

## 2. Pre-Flight Checklist (10 Minutes Before Demo)
1. Verify backend service is healthy:
   ```bash
   curl -s http://localhost:8000/health
   # Expected: {"status":"healthy","version":"1.0.0"}
   ```
2. Verify TShark and ML model status:
   ```bash
   curl -s http://localhost:8000/api/v1/analyses/environment | jq .tshark_available
   # Expected: true
   curl -s http://localhost:8000/api/v1/analyses/ml/model | jq .status
   # Expected: "ready"
   ```
3. Open browser tabs:
   - Tab 1: `http://localhost:3000` (Main SOC Dashboard)
   - Tab 2: `http://localhost:3000/analyze` (Analysis Launcher)
   - Tab 3: `http://localhost:8000/docs` (Interactive API Documentation)

---

## 3. Step-by-Step Demonstration Flow

### Minute 0:00 – 1:00 | The Problem & The Solution
- **Hook:** "IPsec VPNs encrypt mission-critical national security traffic. But how do security analysts audit encrypted tunnels without breaking encryption, violating privacy, or relying on hallucinating LLMs?"
- **Thesis:** "AbhedyaX solves this with a two-pillar architecture:
  1. **Deterministic Protocol & Cryptographic Risk Scoring** via direct wire dissection of IKE handshakes against NIST SP 800-77 Rev. 1 standards.
  2. **Zero-Payload Encrypted Traffic Classification** using 28 statistical flow metadata features without decrypting a single byte of user data."

### Minute 1:00 – 2:30 | Walkthrough Scenario 1: Compliant Enterprise VPN
1. Navigate to `/analyze` → Select **Simulation Mode**.
2. Select **"Secure Enterprise VPN"** → Click **"Launch Simulation Analysis"**.
3. Point out the live processing stepper (Ingestion → Protocol Analysis → Security Assessment → ML Classification).
4. Highlight on the Analysis Overview:
   - **Score Hero:** `100 / 100` (Low Risk, Grade A).
   - **Deterministic Risk Scoring Card:** Base 100, Deductions: 0. Explain that zero penalty rules were triggered because AES-256-GCM and DH Group 19 are fully compliant.
   - **Traffic Intelligence Card:** Model predicted `Video` with 93% confidence based on large bursty packet sizing.
   - **Evidence Provenance:** Point out the `Wire Observed` and `ML Flow Inference` badges.

### Minute 2:30 – 4:00 | Walkthrough Scenario 2: Legacy Vulnerable VPN
1. Click **"New Analysis"** → Select **"Weak Legacy VPN"** → Launch.
2. Highlight the dramatic contrast:
   - **Score Hero:** `20 / 100` (Critical Risk, Grade F).
   - **Auditable Score Breakdown Table:**
     - `RULE_IKEV1`: -25 points (Deprecated protocol).
     - `RULE_WEAK_DH`: -20 points (Insecure DH Group 2, 1024-bit).
     - `RULE_WEAK_CRYPTO`: -15 points (3DES-CBC cipher).
     - `RULE_WEAK_AUTH`: -15 points (MD5 hashing).
     - `RULE_NO_PFS`: -12 points (No Perfect Forward Secrecy).
   - Show the judges: *"Every single deducted point is tied to an auditable NIST rule. No subjective opinions, no AI hallucinations in the risk score."*

### Minute 4:00 – 5:30 | Automated Reports & PDF Generation
1. Click **"Executive"** in the report actions bar (or navigate to `/reports`).
2. Show the Executive Report in browser:
   - Clean dark-mode SOC presentation.
   - Click **"Print / Save as PDF"**: Show the clean, print-optimized document (background turns crisp white, unnecessary buttons disappear, page breaks align perfectly).
3. Switch to the **Technical Audit Report**:
   - Show the 28 statistical flow features matrix.
   - Show the Ground-Truth Validation status (6/6 parameters verified against strongSwan Linux namespace).
4. Click **"Export JSON"** to demonstrate SIEM/SOAR machine-readability.

### Minute 5:30 – 7:00 | The AbhedyaX USP Layer (Judge Highlights)
1. **Security Twin (`/security-twin`):**
   - Click **Security Twin** in the sidebar.
   - Highlight the **Intended Policy vs Observed Wire State** alignment matrix:
     *"We do not just find issues; we model the intended enterprise cryptographic policy as a digital twin and compare real wire observations against it with clear provenance tags."*
2. **Configuration Drift (`/compare`):**
   - Click **Compare Analyses** or use the dashboard's 1-click **Judge Presets**.
   - Select **"Crypto Downgrade (Enterprise vs Legacy)"** preset.
   - Point out the exact score delta ($\Delta s = -75$), cryptographic parameter transitions (`weakened`), and introduced critical vulnerabilities.
3. **Auditable Security Reasoning (`/analyses/{id}`):**
   - Open the **Weak Legacy VPN** analysis detail page.
   - Expand the **Auditable Security Reasoning** panel.
   - Walk the judges through the 5-step deduction chain:
     *Wire Packet Evidence* $\rightarrow$ *Observation* $\rightarrow$ *Finding* $\rightarrow$ *NIST SP 800-77 Rule* $\rightarrow$ *Score Penalty (-25)* $\rightarrow$ *Remediation*.
4. **Metadata Exposure Indicator (`/metadata-exposure`):**
   - Navigate to **Metadata Exposure**.
   - Show the 5 leakage dimensions (Timing, Size Pattern, Directionality, Burst Pattern, Flow Duration).
   - Reiterate to judges: *"Zero payload decryption. All leakage scoring is mathematically derived from observable metadata."*
5. **Security Posture Timeline (`/posture`):**
   - Show longitudinal tracking across all historical sessions, average fleet posture score, and chronological transition deltas.

---

## 4. Judges Q&A Defense Cheat Sheet

### Q1: "How can you classify encrypted traffic if you don't decrypt it?"
> **Answer:** "We use observable statistical flow dynamics. Packet lengths, inter-arrival time variance, burst cadences, and session durations create distinct behavioral signatures. A high-bandwidth video stream has vastly different statistical burst entropy than an interactive SSH keystroke session, even when both are encrypted inside identical ESP tunnels."

### Q2: "Why not use a Large Language Model to score the risk?"
> **Answer:** "LLMs are probabilistic and prone to hallucinations and prompt drift. National security compliance requires reproducible, mathematically provable assessments. Our Security Risk Engine is 100% deterministic (Base 100 deduction model). We use AI strictly for flow classification where statistical learning excels."

### Q3: "How do you prove your analyzer doesn't have false positives?"
> **Answer:** "We built a dedicated strongSwan testbed using Linux network namespaces that generates ground-truth datasets. Every parameter extracted by our TShark dissection pipeline is validated against the exact kernel configuration that established the tunnel."

### Q4: "What is the Security Twin and why is it useful?"
> **Answer:** "A Security Twin bridges the gap between administrative intent and runtime reality. In large organizations, VPN policies are documented in security standards, but field configurations frequently drift or suffer unauthorized downgrades. The Security Twin models intended policy alongside observed wire state and flags deviations with auditable provenance."

### Q5: "How is Configuration Drift calculated?"
> **Answer:** "Drift compares two canonical analyses without running a second scoring engine. It computes parameter-by-parameter transitions (classified as weakened, strengthened, changed, or unchanged) and calculates exact score deltas based strictly on canonical assessment scores."

