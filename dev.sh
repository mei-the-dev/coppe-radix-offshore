#!/usr/bin/env bash
set -euo pipefail

# Single local dev run script for the project
# Usage: ./dev.sh [--db] [--skip-install]
#  --db            : start postgres service using docker-compose (optional)
#  --skip-install  : skip npm install checks (useful in CI)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

START_DB=0
SKIP_INSTALL=0

for arg in "$@"; do
  case "$arg" in
    --db) START_DB=1 ;;
    --skip-install) SKIP_INSTALL=1 ;;
    -h|--help) echo "Usage: $0 [--db] [--skip-install]"; exit 0 ;;
    *) echo "Unknown arg: $arg"; echo "Usage: $0 [--db] [--skip-install]"; exit 2 ;;
  esac
done

echo "Starting local dev environment"

if [ "$START_DB" -eq 1 ]; then
  if command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1; then
    echo "Bringing up Postgres via docker-compose (background)..."
    docker-compose up -d postgres
  else
    echo "docker-compose is not available. Please start Postgres manually or install docker-compose." >&2
    exit 1
  fi
fi

warn_if_no_env() {
  local path="$1/.env"
  local example="$1/.env.example"
  if [ ! -f "$path" ] && [ -f "$example" ]; then
    echo "Warning: $path is missing; consider copying $example -> $path"
  fi
}

warn_if_no_env "$ROOT_DIR/backend"
warn_if_no_env "$ROOT_DIR/frontend"

if [ "$SKIP_INSTALL" -ne 1 ]; then
  if [ ! -d "$ROOT_DIR/backend/node_modules" ]; then
    echo "Note: backend/node_modules not found; run 'cd backend && npm install' if needed"
  fi
  if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
    echo "Note: frontend/node_modules not found; run 'cd frontend && npm install' if needed"
  fi
fi

PIDS=()

start_in_dir() {
  local dir="$1"
  shift
  (cd "$dir" && echo "--- Running: $* in $dir ---" && eval "$@") &
  PIDS+=("$!")
}

echo "Starting backend (npm run dev)..."
start_in_dir "$ROOT_DIR/backend" "npm run dev"

echo "Starting frontend (npm run dev)..."
start_in_dir "$ROOT_DIR/frontend" "npm run dev"

cleanup() {
  echo "Shutting down dev processes..."
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" || true
    fi
  done
  wait
}

trap cleanup EXIT INT TERM

echo "Dev servers started. Backend: http://localhost:3001  Frontend: http://localhost:5173"
echo "Press Ctrl-C to stop"

wait
