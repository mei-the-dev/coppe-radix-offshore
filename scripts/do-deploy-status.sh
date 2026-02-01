#!/bin/bash
# Print DigitalOcean App Platform deployment status for sea-lion-app.
# Mirrors MCP apps-get-deployment-status. Use when doctl is installed and authenticated.
# Usage: ./scripts/do-deploy-status.sh [APP_ID]
# Requires: doctl, jq (optional, for pretty output)
# Auth: doctl auth init --access-token YOUR_TOKEN (or DIGITALOCEAN_ACCESS_TOKEN)

set -e

APP_ID="${1:-a639b515-01d7-489e-bccb-074a9cf6f62a}"

if ! command -v doctl >/dev/null 2>&1; then
  echo "doctl is required. Install: https://docs.digitalocean.com/reference/doctl/how-to/install/"
  exit 1
fi

echo "Deployment status for app $APP_ID (sea-lion-app)"
echo "==============================================="

DEPLOYS=$(doctl apps list-deployments "$APP_ID" --output json 2>/dev/null || echo "[]")

if [ "$DEPLOYS" = "[]" ] || [ -z "$DEPLOYS" ]; then
  echo "No deployments found. Check APP_ID and doctl auth."
  exit 1
fi

if command -v jq >/dev/null 2>&1; then
  echo "$DEPLOYS" | jq -r '.[0] | "Phase: \(.phase)\nCreated: \(.created_at)\nUpdated: \(.updated_at)\nCause: \(.cause // "n/a")"'
else
  echo "$DEPLOYS"
fi
