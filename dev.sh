#!/usr/bin/env bash
set -euo pipefail

# Single local dev run script for the project
# Usage: ./dev.sh [--db] [--no-db] [--skip-install]
#  --db            : start postgres service using docker-compose (optional)
#  --no-db         : skip DB startup even if --db is passed later
#  --skip-install  : skip npm install checks (useful in CI)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

START_DB=0
SKIP_INSTALL=0
NO_DB=0
DB_STARTED=0
DOCKER_CMD=""

for arg in "$@"; do
  case "$arg" in
    --db) START_DB=1 ;;
    --no-db) NO_DB=1 ;;
    --skip-install) SKIP_INSTALL=1 ;;
    -h|--help) echo "Usage: $0 [--db] [--no-db] [--skip-install]"; exit 0 ;;
    *) echo "Unknown arg: $arg"; echo "Usage: $0 [--db] [--no-db] [--skip-install]"; exit 2 ;;
  esac
done

echo "Starting local dev environment"

if [ "$START_DB" -eq 1 ]; then
  # Prefer the legacy `docker-compose` command, fall back to `docker compose` if available
  if [ "$NO_DB" -eq 1 ]; then
    echo "Skipping DB start because --no-db was passed."
  else
    # Try docker-compose first, then `docker compose`. If starting the DB fails we WARN and continue
    if command -v docker-compose >/dev/null 2>&1; then
      echo "Bringing up Postgres via docker-compose (background)..."
      DOCKER_CMD="docker-compose"
      if docker-compose up -d postgres; then
        DB_STARTED=1
      else
        echo "Warning: Failed to start Postgres with docker-compose. Is Docker running and configured? If you see permission errors try 'sudo docker-compose up -d postgres' or add your user to the 'docker' group." >&2
        DB_STARTED=0
      fi
    elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
      echo "Bringing up Postgres via 'docker compose' (background)..."
      DOCKER_CMD="docker compose"
      if docker compose up -d postgres; then
        DB_STARTED=1
      else
        echo "Warning: Failed to start Postgres with 'docker compose'. Is Docker running and configured? If you see permission errors try 'sudo docker compose up -d postgres' or add your user to the 'docker' group." >&2
        DB_STARTED=0
      fi
    else
      echo "Warning: docker-compose / docker compose are not available. Please start Postgres manually or install Docker with the Compose plugin." >&2
      DB_STARTED=0
    fi
    if [ "$DB_STARTED" -eq 0 ]; then
      echo "Continuing without starting Postgres. The backend may fail to connect to DB if it requires a running database." >&2
    fi
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
  # If we started the DB, stop it
  if [ "$DB_STARTED" -eq 1 ]; then
    echo "Stopping Postgres started by this script..."
    if [ -n "$DOCKER_CMD" ]; then
      # Use the same compose command we used to start
      if $DOCKER_CMD stop postgres 2>/dev/null; then
        $DOCKER_CMD rm -f postgres >/dev/null 2>&1 || true
      else
        echo "Failed to stop Postgres via '$DOCKER_CMD'. You may need to stop it manually." >&2
      fi
    fi
  fi
}

trap cleanup EXIT INT TERM

echo "Dev servers started. Backend: http://localhost:3001  Frontend: http://localhost:5173"
echo "Press Ctrl-C to stop"

wait
