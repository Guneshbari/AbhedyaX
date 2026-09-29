# AbhedyaX — Production & Hackathon Deployment Guide

This guide describes how to deploy the finalized AbhedyaX prototype for **PPT shortlisting, public judge evaluation, and local/containerized demonstrations**.

---

## 1. Architecture Overview (Dual-Mode Design)

AbhedyaX uses an **API-Optional Architecture** to ensure 100% availability for evaluators:

```
                            ┌──────────────────────────────────────────┐
                            │            Next.js Frontend              │
                            │           (Deployed to Vercel)           │
                            └────────────────────┬─────────────────────┘
                                                 │
                                                 ▼
                                     ┌───────────────────────┐
                                     │  DataProvider Context │
                                     └───────────┬───────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   │                                                           │
                   ▼                                                           ▼
       ┌────────────────────────┐                                  ┌───────────────────────┐
       │    DemoDataProvider    │                                  │    ApiDataProvider    │
       │  (Default / Fallback)  │                                  │   (Optional Engine)   │
       └───────────┬────────────┘                                  └───────────┬───────────┘
                   │                                                           │
                   ▼                                                           ▼
       Deterministic Datasets                                           FastAPI Backend
       • 6 Canonical Scenarios                                          (Render / Container)
       • Security Twin Baselines                                        • TShark Dissection
       • Auditable Reasoning Chains                                     • strongSwan 5.9
       • Offline HTML/JSON Reports                                      • ML Classification
```

### Why Dual-Mode?
- **Zero-Downtime Guarantee for Judges**: Free-tier cloud instances (e.g., Render, Railway) spin down after inactivity, causing 50+ second cold starts or failed requests.
- **Identical User Experience**: The exact same UI, components, charts, and report exports run in both modes. Demo Mode is not a degraded fallback—it serves the verified canonical datasets established during Phase 5.2/6.

---

## 2. Frontend Deployment (Vercel)

### Step 1: Push Repository to GitHub
Ensure the project is committed to your GitHub repository.

### Step 2: Import into Vercel
1. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select the `abhedyax` repository.
3. Configure the **Root Directory**:
   - Set Root Directory to `apps/web`.
4. Configure **Build Settings**:
   - Framework Preset: `Next.js`
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

### Step 3: Configure Environment Variables
Set the following environment variables in Vercel project settings:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_DATA_MODE` | `demo` | Guarantees instant response without requiring the backend |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` | Optional URL of the deployed FastAPI service |
| `NEXT_PUBLIC_SIMULATION_MODE` | `true` | Enables deterministic scenario triggers |

### Step 4: Deploy & Verify
Click **Deploy**. Once built:
- Navigate to your deployed Vercel URL (e.g. `https://abhedyax.vercel.app`).
- Verify the Topbar displays **DEMO MODE**.
- Click the badge to verify the modal and switch between modes if desired.
- Test browsing to `/analyses`, `/compare`, `/security-twin`, `/metadata-exposure`, and `/reports`.

---

## 3. Backend Deployment (Render / Docker)

### Option A: Render Web Service

1. Create a new **Web Service** on [render.com](https://render.com).
2. Connect your GitHub repository.
3. Set **Runtime**: `Docker`.
4. Set **DockerfilePath**: `docker/Dockerfile.api`.
5. Set Environment Variables:
   - `APP_ENV=production`
   - `SIMULATION_MODE=true`
   - `ABHEDYAX_ANALYSIS_ENGINE=mock` (or `real` if running on host with TShark)
   - `LOG_LEVEL=INFO`
   - `CORS_ORIGINS=["https://your-vercel-domain.vercel.app","http://localhost:3000"]`
6. Health Check Path: `/health`.

### Option B: Docker Compose (Local or VPS)

To deploy both frontend and backend on a local server or cloud VPS:

```bash
# Clone the repository
git clone https://github.com/your-org/abhedyax.git
cd abhedyax

# Copy environment config
cp .env.example .env

# Build and start services
docker compose up --build -d
```

Access points:
- Web Dashboard: `http://localhost:3000`
- FastAPI Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

---

## 4. Evaluator / PPT Shortlisting Verification Checklist

Before submitting the URL for PPT evaluation, verify the following:

- [ ] **Instant Page Load**: Dashboard loads in under 1 second with no spinners or cold-start freezes.
- [ ] **Scenario Integrity**:
  - `AX-2026-00428` (Enterprise): Score 100, Grade A, Low Risk
  - `AX-2026-00427` (Legacy): Score 25, Grade F, Critical Risk, AES-128-CBC / SHA-1
  - `AX-2026-00426` (Moderate): Score 80, Grade B, Moderate Risk, PFS Disabled
  - `AX-2026-00425` (IPv6): Score 100, Grade A, Low Risk, DH Group 20
  - `AX-2026-00424` (Anomaly): Score 95, Grade A, Low Risk, -5 Traffic Deduction
  - `AX-2026-00423` (Observed PCAP): Score 100, Grade A, Low Risk, ChaCha20-Poly1305
- [ ] **USP Features**:
  - `/security-twin`: Displays 6-point policy alignment matrix.
  - `/compare`: Shows 4 preset comparisons with accurate delta calculations.
  - `/metadata-exposure`: Displays 5 zero-payload traffic observability dimensions.
  - `/posture`: Shows chronological session evolution with delta transitions.
- [ ] **Dossier & Report Exports**:
  - Click "Print / Save as PDF" on `/reports/standalone` to verify official publication format.
