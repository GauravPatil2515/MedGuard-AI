#!/usr/bin/env bash
# ==============================================================================
# SAFE CAP⁺ & MedGuard AI — CIIA-6 Live Exhibition Demonstration Runner
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "${SCRIPT_DIR}/code/backend" ]; then
    PROJECT_ROOT="${SCRIPT_DIR}/code"
else
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
fi

echo "======================================================================"
echo "🛡️  SAFE CAP⁺ / MedGuard AI — CIIA-6 Demonstration Environment"
echo "======================================================================"
echo "Project Root: ${PROJECT_ROOT}"

# 1. Check Python and dependencies
echo "[1/4] Checking Backend Services..."
cd "${PROJECT_ROOT}/backend"
if [ ! -f "models/herg_rf_model.pkl" ]; then
    echo "⚠️ Warning: herg_rf_model.pkl not found in models/! Checking fallback mode."
else
    echo "✅ hERG Random Forest Model (ROC-AUC 0.8627) Found."
fi

if [ -f "models/dual_stream_tox21_s42.pt" ]; then
    echo "✅ Tox21 Dual-Stream GSAT GNN Model Found."
fi

# 2. Start Backend in background if not already running on port 5000
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend is already running on port 5000."
else
    echo "🚀 Starting Flask Backend on http://127.0.0.1:5000 ..."
    python3 app.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "   Backend started with PID: ${BACKEND_PID}"
    sleep 2
fi

# 3. Check Frontend
echo "[2/4] Checking Frontend Services..."
cd "${PROJECT_ROOT}/frontend"
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Frontend is already running on http://localhost:5173"
else
    echo "🚀 Starting Vite Frontend on http://localhost:5173 ..."
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "   Frontend started with PID: ${FRONTEND_PID}"
    sleep 2
fi

# 4. Open Demo in Default Browser
echo "[3/4] Opening Demo Application..."
DEMO_URL="http://localhost:5173"
if command -v xdg-open > /dev/null; then
    xdg-open "${DEMO_URL}" > /dev/null 2>&1 || true
elif command -v google-chrome > /dev/null; then
    google-chrome "${DEMO_URL}" > /dev/null 2>&1 || true
fi

echo "[4/4] Opening Printable SAFE CAP⁺ Bottle Label..."
LABEL_PATH="${SCRIPT_DIR}/PRINTABLE_BOTTLE_LABEL_AND_QR.html"
if command -v xdg-open > /dev/null; then
    xdg-open "${LABEL_PATH}" > /dev/null 2>&1 || true
fi

echo "======================================================================"
echo "🎉 Exhibition Environment Ready!"
echo "   - Patient / Elderly View: http://localhost:5173"
echo "   - Backend Health Check:   http://127.0.0.1:5000/api/health"
echo "   - Preset Patient:         Mrs. Sumitra Kulkarni (Warfarin + Amiodarone)"
echo "   - Printable Label:        file://${LABEL_PATH}"
echo "======================================================================"
