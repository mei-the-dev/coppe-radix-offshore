#!/bin/bash
# Verify DigitalOcean App Platform deployment
# Usage: ./scripts/verify-deployment.sh <backend-url> <frontend-url>

set -e

BACKEND_URL=${1:-"https://your-backend-url.ondigitalocean.app"}
FRONTEND_URL=${2:-"https://your-frontend-url.ondigitalocean.app"}

echo "🔍 Verifying DigitalOcean App Platform Deployment"
echo "=================================================="
echo ""

# Check backend health
echo "1. Checking backend health endpoint..."
BACKEND_HEALTH=$(curl -s "${BACKEND_URL}/health" || echo "ERROR")
if echo "$BACKEND_HEALTH" | grep -q "status.*ok"; then
    echo "   ✅ Backend health check passed"
    echo "   Response: $BACKEND_HEALTH"
else
    echo "   ❌ Backend health check failed"
    echo "   Response: $BACKEND_HEALTH"
    exit 1
fi

echo ""

# Check frontend
echo "2. Checking frontend availability..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ Frontend is accessible (HTTP $FRONTEND_STATUS)"
else
    echo "   ❌ Frontend check failed (HTTP $FRONTEND_STATUS)"
    exit 1
fi

echo ""

# Check backend API endpoints
echo "3. Checking backend API endpoints..."
API_ENDPOINTS=(
    "/api/vessels"
    "/api/berths"
    "/installations"
    "/fleet/vessels"
)

for endpoint in "${API_ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}${endpoint}" || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "401" ]; then
        echo "   ✅ ${endpoint} (HTTP $STATUS)"
    else
        echo "   ⚠️  ${endpoint} (HTTP $STATUS)"
    fi
done

echo ""
echo "=================================================="
echo "✅ Deployment verification complete!"
echo ""
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Test authentication flow"
echo "2. Verify database connectivity"
echo "3. Test cargo/loading plan operations"
