#!/bin/bash
# Generate a secure JWT secret for DigitalOcean App Platform
# Usage: ./scripts/generate-jwt-secret.sh

echo "Generating JWT secret for DigitalOcean deployment..."
echo ""
echo "Use this value for the JWT_SECRET environment variable in DigitalOcean App Platform:"
echo ""
openssl rand -hex 32
echo ""
echo "Copy the value above and set it as JWT_SECRET in your App Platform environment variables."
echo "Make sure to set it as type: SECRET"
