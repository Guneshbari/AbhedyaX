# AbhedyaX

> **AI-Powered IPsec VPN Protocol Analyzer and Security Assessment Framework**  
> *Derived from Sanskrit "Abhedya" (अभैद्य), meaning difficult to penetrate, invulnerable, or impervious.*

---

## 📌 Problem Overview

- **Problem ID:** 26160
- **Organization:** National Technical Research Organisation (NTRO)
- **Theme:** Blockchain & Cybersecurity
- **Category:** Software
- **Title:** AI-Powered IPsec VPN Protocol Analyzer and Security Assessment Framework

AbhedyaX is an enterprise-grade cybersecurity analysis platform designed to inspect, analyze, and assess the security posture of IPsec (IKEv1/IKEv2, ESP/AH) Virtual Private Networks. It combines deterministic protocol inspection, cryptographic policy validation, auditable risk scoring, and zero-payload machine learning-driven encrypted traffic classification into a unified, actionable security intelligence dashboard.

---

## ⚡ Quickstart: Running the Platform

### Option 1: One-Command Startup (Recommended)

From the repository root, execute the automated runner:

```bash
chmod +x run.sh
./run.sh
```

**What this does automatically:**
- Sets up `.env`, `apps/api/.env`, and `apps/web/.env.local`
- Provisions the Python 3.12 virtual environment (`apps/api/.venv`) and installs backend dependencies
- Installs frontend packages (`apps/web/node_modules`)
- Starts the FastAPI backend at **`http://localhost:8000`** (Swagger docs at `/docs`)
- Starts the Next.js SOC web application at **`http://localhost:3000`**

Press `Ctrl+C` at any time to cleanly stop all background services.

---

### Option 2: Step-by-Step Manual Startup

#### 1. Backend Service (FastAPI)
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env

# Run FastAPI with hot-reload
python main.py
```
- API Endpoint: `http://localhost:8000`
- Swagger Documentation: `http://localhost:8000/docs`

#### 2. Frontend Application (Next.js)
```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

### Option 3: Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

---

## 🏛️ Core Architecture Principles

1. **Modular Monorepo:** Clean architectural separation between apps (`api`, `web`), core engines (`security-engine`, `report-generator`, `ml`, `testbed`), and datasets.
2. **Canonical Contract First:** All components communicate via a canonical [`AnalysisResult`](file:///home/gnx/Projects/SIH/abhedyax/apps/api/app/models/analysis.py#L125-L160) contract. Both simulated benchmark scenarios and real packet captures produce the exact same schema.
3. **Deterministic Security Risk Engine:** Cryptographic assessment, policy compliance, and risk grading are 100% deterministic, evidence-backed, and auditable. Baseline score starts at 100 with itemized deductions against NIST SP 800-77 and RFC 8221 standards.
4. **Zero-Payload Traffic Intelligence:** Machine learning models classify encrypted tunnels using observable packet metadata (sizes, inter-arrival times, burst ratios, entropy), never decrypting payloads or inspecting cleartext.
5. **Auditable Evidence Provenance:** Every assessment finding records clear provenance tags (`Observed`, `Inferred`, `Simulated`, `GroundTruth`, `MLPrediction`).
6. **Executive & Technical Reporting:** Jinja2 templates render self-contained executive and technical reports with print-to-PDF CSS.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router, Turbopack), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts, TanStack Query |
| **Backend API** | Python 3.12+, FastAPI, Uvicorn, Pydantic v2 |
| **Security Risk Engine** | Deterministic rule matching, NIST SP 800-77 & RFC 8221 policy checks, anti-double-counting logic |
| **Wire Dissection** | TShark / Wireshark CLI (`-T json`), structured frame normalizer, IKEv1/IKEv2 & ESP/AH extractors |
| **Machine Learning** | scikit-learn, XGBoost, NumPy, Polars (28 zero-payload statistical flow features, confidence abstention) |
| **IPsec Testbed** | strongSwan 5.9, Linux Network Namespaces (`netns`), `tcpdump`, synthetic traffic generators |
| **Reporting** | Jinja2 templating, inline print-to-PDF styling, canonical JSON serialization |
| **Testing** | Pytest, pytest-asyncio, TypeScript (`tsc`), ESLint |

---

## 📂 Repository Structure

```text
abhedyax/
├── apps/
│   ├── api/                     # FastAPI backend REST service
│   │   ├── app/                 # Routes, engine orchestrator, packet normalizer
│   │   ├── tests/               # API, consistency, and engine test suites
│   │   ├── main.py              # Application entrypoint
│   │   └── requirements.txt     # Backend dependencies
│   └── web/                     # Next.js frontend SOC dashboard
│       ├── src/app/             # Pages: Dashboard, Analyze, Analyses, Findings, Traffic, Reports, Testbed
│       ├── src/components/      # Reusable UI components, tables, scorecards, charts
│       ├── src/lib/api/         # Typed API clients for backend communication
│       └── src/data/            # Synchronized canonical telemetry and fallback datasets
├── services/
│   ├── security-engine/         # Centralized deterministic risk scoring engine & grading
│   ├── report-generator/        # Executive & technical HTML/PDF report generators
│   ├── ml/                      # ML pipeline: 28-feature extractor, model registry, inference
│   └── testbed/                 # strongSwan IPsec testbed, Linux namespaces, capture orchestrator
├── datasets/
│   └── scenarios/
│       └── pcaps/               # Benchmark test captures (IKEv2 AES-GCM, IKEv1 3DES, NAT-T, etc.)
├── docs/                        # Comprehensive documentation and runbooks
│   ├── RUNBOOK.md               # Detailed developer and execution runbook
│   ├── api/api-reference.md     # Complete REST API specification
│   ├── dataset/overview.md      # Benchmark PCAPs catalog and format specification
│   ├── demo/quickstart.md       # 3-minute hackathon demo walkthrough
│   ├── phase5/                  # Phase 5 deep dives (risk scoring, reports, validation, hardening)
│   ├── ml/                      # Machine learning architecture, features, and evaluation
│   └── testbed/                 # strongSwan namespace architecture and safety
├── docker/
│   ├── Dockerfile.api           # Container build for FastAPI backend (with TShark)
│   └── Dockerfile.web           # Container build for Next.js frontend
├── docker-compose.yml           # Multi-container orchestration (API, Web, Postgres, Redis)
├── run.sh                       # One-command development runner
└── README.md                    # This document
```

---

## 🧪 Testing & Quality Assurance

All test suites can be executed with standard commands:

```bash
# 1. API and Cross-Surface Consistency Tests (31 tests)
cd apps/api
.venv/bin/pytest tests

# 2. Deterministic Risk Engine & Report Generator Tests (17 tests)
cd ../..
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest \
  services/security-engine/tests \
  services/report-generator/tests

# 3. Machine Learning & Testbed Pipeline Tests (28 tests)
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest \
  services/ml/tests \
  services/testbed/tests

# 4. Frontend TypeScript Typing, Linting & Build Verification
cd apps/web
npx tsc --noEmit
npm run lint
npm run build
```

---

## 📖 Documentation Index

- **[Complete Developer Runbook](docs/RUNBOOK.md)** — Step-by-step setup, configuration reference, and troubleshooting.
- **[REST API Reference](docs/api/api-reference.md)** — Comprehensive endpoint schemas, requests, and responses.
- **[Benchmark Datasets & PCAP Catalog](docs/dataset/overview.md)** — Sample capture files and wire validation profiles.
- **[Quickstart & Live Demo Guide](docs/demo/quickstart.md)** — Demonstration script for presentations and hackathons.
- **[Deterministic Risk Scoring Methodology](docs/phase5/risk-scoring.md)** — Mathematical deduction formula and risk bands.
- **[Evidence Provenance Framework](docs/phase5/evidence-provenance.md)** — Wire verification and zero-payload guarantee.
- **[Executive & Technical Reporting](docs/phase5/reporting.md)** — Print-to-PDF reports architecture.
- **[End-to-End Validation](docs/phase5/validation.md)** — Testbed ground-truth verification.
- **[ML Architecture & 28-Feature Pipeline](docs/ml/architecture.md)** — Encrypted traffic classification without payload decryption.
- **[strongSwan Testbed Architecture](docs/testbed/architecture.md)** — Linux network namespaces and VPN provisioning.
