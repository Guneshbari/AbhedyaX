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

AbhedyaX is an enterprise-grade cybersecurity analysis platform designed to inspect, analyze, and assess the security posture of IPsec (IKEv1/IKEv2, ESP/AH) Virtual Private Networks. It combines deterministic protocol inspection, cryptographic policy validation, risk scoring, and machine learning-driven encrypted traffic classification into a unified, actionable security intelligence dashboard.

---

## 🏛️ Core Architecture Principles

1. **Modular Monorepo:** Distinct boundaries between frontend, backend, packet analyzer, machine learning, security engine, testbed, datasets, and shared schemas.
2. **Canonical API Contract First:** The backend communicates strictly via a canonical `AnalysisResult` contract, allowing frontend UI development and backend engine evolution to proceed independently.
3. **Engine Interchangeability:** An abstract `AnalysisEngine` interface powers both the initial `MockAnalysisEngine` (for deterministic simulation and UX validation) and the subsequent `RealAnalysisEngine` (integrating TShark, Scapy, Zeek, ML inference, and strongSwan).
4. **Deterministic & Explainable Security Rules:** Cryptographic evaluation, policy compliance, and risk grading are 100% deterministic, evidence-based, and auditable.
5. **Targeted Machine Learning:** ML models are applied strictly where statistical inference is required (encrypted traffic classification, anomaly detection), never for subjective cryptographic severity decisions.
6. **Explicit Simulation Transparency:** Simulation Mode is clearly indicated in the UI; simulated data is never misrepresented as live packet captures.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts, Zustand, TanStack Query |
| **Backend** | Python 3.12+, FastAPI, Uvicorn, Pydantic v2 |
| **Packet Analysis** | TShark / Wireshark CLI, Scapy, Zeek (optional) |
| **IPsec Testbed** | strongSwan, Linux Network Namespaces (`netns`), tcpdump |
| **Machine Learning** | scikit-learn, XGBoost, NumPy, Polars, ONNX Runtime |
| **Data & Cache** | PostgreSQL 16, Redis 7 |
| **Reporting** | Jinja2 (Templating), Playwright / Chromium (PDF rendering) |
| **Testing** | Pytest (Backend), Vitest (Frontend), Playwright (E2E) |
| **Infrastructure** | Docker, Docker Compose, Ubuntu 24.04 LTS |

---

## 📂 Repository Structure

```text
abhedyax/
├── apps/
│   ├── api/                     # FastAPI backend and REST API service
│   └── web/                     # Next.js frontend dashboard and SOC UI
├── services/
│   ├── analyzer/                # Packet capture analysis, protocol identification, feature extraction
│   ├── ml/                      # ML models, feature engineering, training, inference
│   ├── security-engine/         # Deterministic IPsec security rules, findings, risk scoring
│   ├── testbed/                 # strongSwan IPsec testbed, network namespaces, traffic generation
│   └── report-generator/        # Executive and technical security report rendering
├── packages/
│   ├── shared-types/            # Canonical TypeScript types, Pydantic schemas, enums
│   └── config/                  # Shared configuration presets and environment conventions
├── datasets/
│   ├── raw/                     # Original PCAP files and captures
│   ├── processed/               # Cleaned, normalized flow datasets
│   ├── synthetic/               # Synthetic and simulated training/testing data
│   └── scenarios/               # Controlled IPsec test scenarios & ground-truth outputs
├── models/
│   ├── checkpoints/             # Trained model checkpoints (.onnx, .joblib)
│   └── artifacts/               # Scalers, encoders, feature schemas, evaluation metrics
├── docker/                      # Dockerfiles and container configurations
├── docs/
│   ├── architecture/            # Architectural design records and component diagrams
│   ├── api/                     # REST API schemas and endpoint specifications
│   ├── security/                # Cryptographic rules, scoring rubric, threat model
│   ├── dataset/                 # Dataset curation, labeling, and feature documentation
│   └── demo/                    # Hackathon demonstration runbooks and walkthroughs
├── scripts/                     # Setup, data preparation, training, and demo scripts
├── tests/
│   ├── integration/             # Cross-service integration test suite
│   └── e2e/                     # End-to-end browser and workflow tests
├── configs/                     # System configuration files and scenario descriptors
├── storage/
│   ├── pcaps/                   # Local development PCAP storage
│   └── reports/                 # Generated PDF and JSON reports
├── docker-compose.yml           # Multi-container local orchestration
├── ARCHITECTURE.md              # Detailed architecture specifications
├── .env.example                 # Template environment variables
└── LICENSE                      # License placeholder
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v20.x or higher + pnpm / npm
- **Python:** v3.12 or higher + virtualenv / poetry
- **Docker & Docker Compose:** Latest stable version
- **System Tools (Linux):** `tshark`, `tcpdump`, `iproute2` (for testbed development)

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Start the supporting services using Docker Compose:
   ```bash
   docker compose up -d postgres redis
   ```

3. Backend setup (`apps/api`):
   ```bash
   cd apps/api
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

4. Frontend setup (`apps/web`):
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

---

---

## 🚦 Roadmap & Implementation Status

- [x] **Phase 1: Product UI & UX** - Complete Next.js dashboard with full interactive screens, Dark SOC design system, and canonical API contract.
- [x] **Phase 2: Core Packet Engine** - Integration of TShark CLI for real PCAP dissection, IKE/ESP parameter extraction, and normalized wire parsing.
- [x] **Phase 3: strongSwan Testbed & Dataset Generator** - Controlled Linux network namespaces, automated traffic generators (ping/curl/iperf3), and ground-truth metadata generation.
- [x] **Phase 4: ML Encrypted Traffic Classifier** - Zero-payload 28-feature extraction pipeline, trained Random Forest model (F1: 77.8%), confidence abstention, and feature explainability.
- [x] **Phase 5: End-to-End Validation, Risk Engine & Reporting Hardening** - Centralized deterministic risk scoring engine (`services/security-engine`), evidence provenance framework (`Observed`, `Inferred`, `Simulated`, `GroundTruth`, `MLPrediction`), testbed ground-truth validation, and executive/technical report generator (`services/report-generator`) with print-to-PDF CSS.

---

## 📚 Phase 5 Documentation & Runbooks
Detailed implementation guides and verification records:
- [Deterministic Risk Scoring Engine](docs/phase5/risk-scoring.md)
- [Evidence Provenance & Zero-Payload Guarantee](docs/phase5/evidence-provenance.md)
- [Executive & Technical Security Reporting](docs/phase5/reporting.md)
- [End-to-End Validation & Ground-Truth Verification](docs/phase5/validation.md)
- [Production & Hackathon Deployment Guide](docs/phase5/deployment.md)
- [Security Architecture & Hardening Safeguards](docs/phase5/security-hardening.md)
- [Hackathon Live Demonstration Runbook](docs/phase5/demo-runbook.md)

