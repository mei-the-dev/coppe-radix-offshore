#!/bin/bash
echo "PostgreSQL Setup Helper for Arch Linux"
echo ""
echo "Choose an option:"
echo "1. Install PostgreSQL server (requires sudo)"
echo "2. Use Docker (if Docker is installed)"
echo "3. Check current status"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "Installing PostgreSQL..."
    sudo pacman -S postgresql
    echo "Initializing database cluster..."
    sudo -u postgres initdb -D /var/lib/postgres/data
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo "✅ PostgreSQL installed and started!"
    echo ""
    echo "Next steps:"
    echo "  sudo -u postgres psql"
    echo "  CREATE DATABASE prio_logistics;"
    echo "  \\c prio_logistics"
    echo "  CREATE EXTENSION IF NOT EXISTS postgis;"
    ;;
  2)
    echo "Starting PostgreSQL in Docker..."
    docker run --name prio-postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=prio_logistics \
      -p 5432:5432 \
      -d postgis/postgis:15-3.4
    sleep 5
    docker exec -it prio-postgres psql -U postgres -d prio_logistics -c "CREATE EXTENSION IF NOT EXISTS postgis;"
    docker exec -it prio-postgres psql -U postgres -d prio_logistics -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
    echo "✅ PostgreSQL running in Docker!"
    ;;
  3)
    echo "Checking PostgreSQL status..."
    systemctl status postgresql 2>/dev/null || echo "PostgreSQL service not found"
    pg_isready -h localhost -p 5432 2>&1 || echo "PostgreSQL not responding"
    ;;
esac
