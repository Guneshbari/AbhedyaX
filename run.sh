#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$REPO_ROOT/apps/api"
WEB_DIR="$REPO_ROOT/apps/web"

echo "=== Starting AbhedyaX Development Services ==="

# 1. Ensure .env files exist
if [ ! -f "$REPO_ROOT/.env" ]; then
    echo "Creating .env from .env.example..."
    cp "$REPO_ROOT/.env.example" "$REPO_ROOT/.env"
fi

if [ ! -f "$API_DIR/.env" ]; then
    echo "Creating apps/api/.env from apps/api/.env.example..."
    cp "$API_DIR/.env.example" "$API_DIR/.env"
fi

# 2. Check virtual environment
VENV_PYTHON="$API_DIR/.venv/bin/python"
if [ ! -f "$VENV_PYTHON" ]; then
    echo "Creating virtual environment in $API_DIR/.venv..."
    python3 -m venv "$API_DIR/.venv"
    "$VENV_PYTHON" -m pip install --upgrade pip
    "$VENV_PYTHON" -m pip install -r "$API_DIR/requirements.txt"
fi

# 3. Check web dependencies
if [ ! -d "$WEB_DIR/node_modules" ]; then
    echo "Installing frontend dependencies in $WEB_DIR..."
    (cd "$WEB_DIR" && npm install)
fi

# 4. Cleanup background processes on exit
cleanup() {
    echo -e "\nShutting down AbhedyaX services..."
    kill "$API_PID" "$WEB_PID" 2>/dev/null || true
    wait "$API_PID" "$WEB_PID" 2>/dev/null || true
    echo "All services stopped."
}
trap cleanup SIGINT SIGTERM EXIT

# 5. Start Backend API
echo "Starting Backend API on http://localhost:8000..."
(
    cd "$API_DIR"
    PYTHONPATH="$REPO_ROOT:$API_DIR" "$VENV_PYTHON" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) &
API_PID=$!

# Wait for API to respond
for i in {1..20}; do
    if curl -s http://localhost:8000/ >/dev/null 2>&1; then
        echo "Backend API is up at http://localhost:8000 (docs at http://localhost:8000/docs)"
        break
    fi
    sleep 0.5
done

# 6. Start Frontend Web
echo "Starting Frontend Web on http://localhost:3000..."
(
    cd "$WEB_DIR"
    npm run dev
) &
WEB_PID=$!

echo "=========================================================="
echo " AbhedyaX is running!"
echo "   - Web UI: http://localhost:3000"
echo "   - API:    http://localhost:8000"
echo "   - Docs:   http://localhost:8000/docs"
echo " Press Ctrl+C to stop all services."
echo "=========================================================="

wait
