# AbhedyaX Quickstart & Demonstration Guide

This guide walks you through running AbhedyaX from scratch and demonstrating its core capabilities in under 3 minutes.

---

## ⚡ 1-Minute Launch

```bash
# Clone the repository
git clone https://github.com/Guneshbari/AbhedyaX.git
cd AbhedyaX

# Launch all services (FastAPI on 8000, Next.js on 3000)
./run.sh
```

Open your browser to:
- **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Interactive API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🎬 3-Step Demo Walkthrough

### Step 1: Inspect Historical Analysis Posture
1. Navigate to **[Analyses](http://localhost:3000/analyses)** in the sidebar.
2. Select session **`AX-2026-00427`** (`legacy-branch-04.pcap`).
3. Observe:
   - **Score:** `25 / 100` (Red / Critical Risk, Grade F)
   - **Findings:** `F-301` (DH Group 2), `F-302` (SHA-1), `F-303` (Anti-Replay Off), `F-304` (IKEv1 Deprecated)
   - **Audit Trail:** Deterministic itemized deductions totaling `-75` against starting score of `100`.

### Step 2: Upload a Real Wire Capture (TShark Dissection)
1. Go to **[Analyze](http://localhost:3000/analyze)**.
2. Switch to the **Upload PCAP** tab.
3. Select or drag-and-drop `datasets/scenarios/pcaps/modern-ikev2-aes256gcm.pcap`.
4. Click **Start Inspection**.
5. Watch the real-time pipeline stepper execute:
   - Packet normalization $\rightarrow$ Wire protocol dissection $\rightarrow$ Zero-payload feature extraction $\rightarrow$ ML classification.
6. Observe the resulting clean score (`100/100`, Grade A, Low Risk) and observed wire transforms.

### Step 3: View & Print Executive Report
1. On any completed analysis, click **View Report** or go to **[Reports](http://localhost:3000/reports)**.
2. Toggle between **Executive Summary** (C-level posture and remediation priority) and **Technical Audit** (wire SPIs, cryptographic transforms, and evidence provenance).
3. Click **Print / Save as PDF** to generate an executive-ready PDF report.

---

## 🔬 Additional Capabilities

- **AI Traffic Intelligence:** Visit **[AI Intelligence](http://localhost:3000/ai-intelligence)** to inspect the trained Random Forest classifier (F1: 77.8%), confusion matrix, and feature importances.
- **strongSwan Testbed:** Visit **[Testbed](http://localhost:3000/testbed)** to review Linux network namespace topology and controlled tunnel provisioning.
