# AbhedyaX Production & Hackathon Deployment Guide

## 1. System Requirements

### Host Environment
- **Operating System:** Linux (Ubuntu 22.04 LTS / Debian 12 recommended)
- **Python:** 3.12+ (managed with `uv` or standard `python3.12-venv`)
- **Node.js:** 20.x or 22.x LTS (with `npm` 10+)
- **Network Dissector:** `tshark` 4.0+ (`sudo apt install -y tshark`)
- **Memory & Storage:** 4 GB RAM minimum, 10 GB free disk space

---

## 2. Quickstart Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/abhedyax.git
cd abhedyax
```

### Step 2: Configure Backend Environment
```bash
# Create and activate Python 3.12 virtual environment
python3 -m venv apps/api/.venv
source apps/api/.venv/bin/activate

# Install all backend dependencies
pip install -r apps/api/requirements.txt
```

### Step 3: Configure Frontend Environment
```bash
cd apps/web
npm install
cd ../..
```

---

## 3. Configuration & Environment Variables

### Backend Configuration (`apps/api/.env`)
```bash
# Analysis Engine Mode: "mock" (simulation benchmark) or "real" (TShark packet analysis)
ABHEDYAX_ANALYSIS_ENGINE=mock

# TShark Dissector Binary
ABHEDYAX_TSHARK_BINARY=/usr/bin/tshark
ABHEDYAX_TSHARK_TIMEOUT_SECONDS=60

# Upload Constraints
ABHEDYAX_MAX_PCAP_SIZE_MB=50
ABHEDYAX_PCAPS_DIR=/home/gnx/Projects/SIH/abhedyax/data/pcaps

# CORS Configuration
ABHEDYAX_CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

### Frontend Configuration (`apps/web/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 4. Running the Services

### Start Backend Service (FastAPI)
```bash
# From repository root
PYTHONPATH=apps/api:services/security-engine:services/report-generator:services/ml \
  apps/api/.venv/bin/uvicorn app.main:app \
  --app-dir apps/api \
  --host 0.0.0.0 \
  --port 8000 \
  --reload
```
API Documentation is available at `http://localhost:8000/docs` (Swagger UI).

### Start Frontend Service (Next.js)
```bash
# Production mode (Recommended for demo)
cd apps/web
npm run build
npm start -- -p 3000

# Or Development mode
npm run dev -- -p 3000
```
Dashboard is accessible at `http://localhost:3000`.

---

## 5. System Hardening & Troubleshooting

### 1. TShark Non-Root Capture Permissions
If running live packet capture or accessing protected interfaces:
```bash
sudo setcap 'CAP_NET_RAW+eip CAP_NET_ADMIN+eip' /usr/bin/dumpcap
sudo usermod -aG wireshark $USER
```

### 2. Python Package Resolution
The repository organizes modular micro-subsystems under `services/`. Symlinks ensure import compatibility:
- `services/security_engine -> services/security-engine`
- `services/report_generator -> services/report-generator`
Ensure `PYTHONPATH` includes both the repo root and `apps/api`:
```bash
export PYTHONPATH=.:apps/api:$PYTHONPATH
```

### 3. Verifying Health Endpoints
```bash
# Check API health
curl -s http://localhost:8000/health

# Check TShark & Engine status
curl -s http://localhost:8000/api/v1/analyses/environment

# Check active ML model status
curl -s http://localhost:8000/api/v1/analyses/ml/model
```
