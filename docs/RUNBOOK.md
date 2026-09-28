# AbhedyaX Complete System Runbook & Developer Guide

This document contains step-by-step instructions to configure, run, test, and troubleshoot the **AbhedyaX** platform across all deployment and development modes.

---

## 📋 System Prerequisites

### Required Tools
- **Operating System:** Linux (Ubuntu 22.04 / 24.04 LTS recommended), macOS, or WSL2 on Windows
- **Python:** Python 3.12+
- **Node.js:** Node.js 20+ (with `npm` or `pnpm`)
- **TShark / Wireshark CLI:** `tshark` $\ge 4.0$ installed and available in `$PATH`

### Optional Tools (For strongSwan Testbed & Containerized Deployments)
- **Docker & Docker Compose:** Docker Engine $\ge 24.0$
- **Linux Network Tools:** `iproute2` (for `ip netns`), `tcpdump`, `iptables`
- **strongSwan:** strongSwan 5.9+ with `swanctl` and `charon-systemd`

### Installing Prerequisites on Ubuntu / Debian
```bash
# Update repositories
sudo apt-get update

# Install Python 3.12, Node.js 20, and developer utilities
sudo apt-get install -y python3 python3-venv python3-pip curl git

# Install TShark, tcpdump, and network utilities
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y tshark tcpdump iproute2

# Allow non-root users to capture packets with TShark (optional)
sudo usermod -aG wireshark $USER
```

---

## 🚀 Execution Methods

### Method A: One-Command Startup (Recommended for Local Dev)

The repository provides [`run.sh`](file:///home/gnx/Projects/SIH/abhedyax/run.sh) which automatically handles:
- Checking and copying `.env.example` to `.env`, `apps/api/.env`, and `apps/web/.env.local`
- Creating the Python virtual environment in `apps/api/.venv` and installing requirements
- Installing frontend dependencies in `apps/web/node_modules`
- Launching the FastAPI backend API on `http://localhost:8000` with hot-reload
- Launching the Next.js frontend on `http://localhost:3000` with Turbopack
- Gracefully stopping both processes when you press `Ctrl+C`

```bash
# From repository root
chmod +x run.sh
./run.sh
```

---

### Method B: Manual Step-by-Step Startup

If you prefer running services in separate terminal sessions:

#### Terminal 1 — Backend API (FastAPI)
```bash
# 1. Navigate to apps/api
cd apps/api

# 2. Setup virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Copy environment configuration
cp .env.example .env

# 5. Start the backend service
python main.py
# Alternatively:
# PYTHONPATH="../..:." uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API will be accessible at: `http://localhost:8000`
- Interactive API Docs at: `http://localhost:8000/docs`

#### Terminal 2 — Frontend Application (Next.js)
```bash
# 1. Navigate to apps/web
cd apps/web

# 2. Copy environment configuration
cp .env.example .env.local

# 3. Install dependencies
npm install

# 4. Start Next.js development server
npm run dev
```
- Web Application will be accessible at: `http://localhost:3000`

---

### Method C: Docker Compose Startup

To run the entire system in isolated containers:

```bash
# 1. Copy root environment variables
cp .env.example .env

# 2. Build and start all containers (API, Web, PostgreSQL, Redis)
docker compose up --build

# To run in the background:
docker compose up -d
```

To stop containers:
```bash
docker compose down
```

---

## ⚙️ Configuration & Environment Variables

### Root / System-Wide (`.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `API_PORT` | `8000` | Host port for FastAPI backend |
| `WEB_PORT` | `3000` | Host port for Next.js web application |
| `SIMULATION_MODE` | `true` | Enables deterministic benchmark scenarios |
| `TSHARK_BINARY` | `tshark` | Path to TShark CLI executable |
| `POSTGRES_USER` | `abhedyax` | Database username |
| `POSTGRES_PASSWORD` | `abhedyax_secret` | Database password |
| `POSTGRES_DB` | `abhedyax_db` | Database schema name |

### Backend API (`apps/api/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `APP_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `ABHEDYAX_ANALYSIS_ENGINE` | `mock` | Default engine (`mock` or `real`). When `mock`, simulation endpoints use fast benchmark responses while PCAP uploads automatically dispatch to `RealAnalysisEngine`. |
| `TSHARK_BINARY` | `tshark` | TShark executable binary |
| `TSHARK_TIMEOUT_SECONDS` | `120` | Subprocess dissection timeout |
| `MAX_PCAP_SIZE_MB` | `250` | Maximum capture upload size limit |
| `LOG_LEVEL` | `INFO` | Logger verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |

### Frontend Web (`apps/web/.env.local`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL consumed by client and SSR |
| `NEXT_PUBLIC_SIMULATION_MODE` | `true` | Shows simulation mode badge in UI topbar |

---

## 🧪 Testing & Verification Guide

### 1. Run Complete Backend Test Suite
```bash
# Run API routes, mock engine, real engine, and data consistency tests
cd apps/api
.venv/bin/pytest tests
```
*Expected: 31 passed.*

### 2. Run Deterministic Security Engine & Report Generator Tests
```bash
# From repository root
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest \
  services/security-engine/tests \
  services/report-generator/tests
```
*Expected: 17 passed.*

### 3. Run ML Pipeline & Testbed Unit Tests
```bash
# From repository root
PYTHONPATH=.:apps/api apps/api/.venv/bin/pytest \
  services/ml/tests \
  services/testbed/tests
```
*Expected: 28 passed.*

### 4. Run Frontend TypeScript, Linting & Build
```bash
cd apps/web

# Check TypeScript typing
npx tsc --noEmit

# Run ESLint
npm run lint

# Compile production build
npm run build
```
*Expected: 0 errors, 0 warnings.*

---

## 📊 Using the Platform

### Running an IPsec Benchmark Simulation
1. Navigate to `http://localhost:3000/analyze`.
2. Choose **Simulation Mode**.
3. Select any scenario:
   - **Secure Enterprise VPN:** Modern compliant IKEv2 + AES-256-GCM (Score: `100/100`, Grade: `A`).
   - **Legacy Weak Configuration:** Deprecated IKEv1, 3DES/SHA-1, DH2, No Replay (Score: `25/100`, Grade: `F`, Critical Risk).
   - **Moderate Security VPN:** AES-256-CBC, no PFS, extended 24h lifetime (Score: `80/100`, Grade: `B`, Moderate Risk).
   - **Secure IPv6 VPN:** Native IPv6 IPsec tunnel without NAT-T (Score: `100/100`, Grade: `A`).
   - **Traffic Anomaly:** Compliant cryptography with statistical flow entropy variance (Score: `95/100`, Grade: `A`).
4. Click **Start Inspection** to watch the real-time pipeline stepper.

### Analyzing a Real PCAP / PCAPNG Capture
1. Go to `http://localhost:3000/analyze` $\rightarrow$ select **Upload PCAP**.
2. Select any sample file from [`datasets/scenarios/pcaps/`](file:///home/gnx/Projects/SIH/abhedyax/datasets/scenarios/pcaps/):
   - `modern-ikev2-aes256gcm.pcap`
   - `legacy-ikev1-3des-sha1.pcap`
   - `weak-ikev2-des-md5.pcap`
   - `natt-esp-traffic.pcap`
3. Click **Start Inspection**. TShark will dissect the capture, extract IKE/ESP parameters, apply deterministic security rules, run ML classification, and present the findings.

### Generating & Exporting Reports
1. On any analysis detail page, click **Export** or open **Reports** from the sidebar (`http://localhost:3000/reports`).
2. Select:
   - **Executive Assessment:** High-level scorecard and prioritized remediation for leadership.
   - **Technical Audit:** Detailed transform proposals, SA attributes, wire SPI evidence, and deduction reasons.
3. Click **Print / Save as PDF** to generate an official PDF assessment.
4. Click **Download JSON** for raw machine-readable data.

---

## 🛠️ Troubleshooting & Common Questions

### `TSharkNotFoundError: TShark binary 'tshark' is not available in PATH`
- **Cause:** TShark is not installed or the user does not have executable permission.
- **Fix:** Install TShark using `sudo apt-get install -y tshark` and verify with `tshark --version`.

### Port 8000 or 3000 Already in Use
- **Cause:** Another process or previous instance is holding the port.
- **Fix:**
  ```bash
  # Find and kill process on port 8000
  fuser -k 8000/tcp
  # Find and kill process on port 3000
  fuser -k 3000/tcp
  ```

### `ModuleNotFoundError: No module named 'services'`
- **Cause:** Python execution path does not include the project root.
- **Fix:** Ensure `PYTHONPATH` includes the repository root:
  ```bash
  export PYTHONPATH="/path/to/abhedyax:/path/to/abhedyax/apps/api"
  ```
  *(Note: `apps/api/app/main.py`, `apps/api/main.py`, and `run.sh` configure this automatically).*

### Missing Permissions for strongSwan Testbed Namespaces
- **Cause:** Linux network namespaces require `CAP_NET_ADMIN` or `sudo` privileges.
- **Fix:**
  ```bash
  sudo python3 services/testbed/src/cli/main.py run --scenario ts-secure-ikev2-gcm
  ```
