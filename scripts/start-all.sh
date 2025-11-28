#!/usr/bin/env bash
set -euo pipefail

# Go to repo root
cd "$(dirname "$0")/.."

# Free API port 3000 if occupied
lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true

# Start API server in background
nohup npm run server > /tmp/focusbuddy_server.log 2>&1 &
SERVER_PID=$!

# Choose frontend port (default 5174)
PORT=${PORT:-5174}

# Start Vite dev server in background; force host exposure for Codespaces
nohup npm run dev -- --port "$PORT" --host > /tmp/focusbuddy_vite.log 2>&1 &
VITE_PID=$!

# Small wait to let Vite attempt startup and possibly pick another port if busy
sleep 0.8

# Detect if Vite switched ports by scanning the log for Local URL
URL_LINE=$(grep -Eo "http://localhost:[0-9]+/" /tmp/focusbuddy_vite.log | tail -n 1 || true)
if [[ -n "$URL_LINE" ]]; then
  APP_URL="$URL_LINE"
else
  APP_URL="http://localhost:$PORT/"
fi

cat <<INFO
API server PID: $SERVER_PID (logs: /tmp/focusbuddy_server.log)
Vite dev PID:   $VITE_PID (logs: /tmp/focusbuddy_vite.log)
Open:           $APP_URL
INFO

# Open in default browser if available in this environment
if [[ -n "${BROWSER:-}" ]]; then
  "$BROWSER" "$APP_URL" >/dev/null 2>&1 || true
fi
