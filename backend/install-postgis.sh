#!/bin/bash
echo "Installing PostGIS for PostgreSQL..."
echo "This requires sudo privileges."
echo ""
sudo pacman -S postgis
echo ""
echo "PostGIS installed. Now enabling extension in database..."
psql -h localhost -U postgres -d prio_logistics -c "CREATE EXTENSION IF NOT EXISTS postgis;"
echo ""
echo "✅ PostGIS setup complete!"
echo "You can now run: npm run migrate"
