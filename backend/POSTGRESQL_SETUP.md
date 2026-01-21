# PostgreSQL Setup for Arch Linux

## Option 1: Install PostgreSQL Server (Recommended)

```bash
# Install PostgreSQL server
sudo pacman -S postgresql

# Initialize the database cluster
sudo -u postgres initdb -D /var/lib/postgres/data

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Start on boot

# Create database and user
sudo -u postgres psql
```

In psql:
```sql
CREATE DATABASE prio_logistics;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE prio_logistics TO your_username;
\c prio_logistics
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
\q
```

## Option 2: Use Docker (Quick Setup)

If you have Docker installed:

```bash
# Run PostgreSQL in Docker
docker run --name prio-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=prio_logistics \
  -p 5432:5432 \
  -d postgis/postgis:15-3.4

# Install PostGIS extension
docker exec -it prio-postgres psql -U postgres -d prio_logistics -c "CREATE EXTENSION IF NOT EXISTS postgis;"
docker exec -it prio-postgres psql -U postgres -d prio_logistics -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

Then update your `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prio_logistics
DB_USER=postgres
DB_PASSWORD=postgres
```

## Option 3: Use SQLite (Development Only)

For quick development/testing, you could modify the connection to use SQLite, but this won't work with PostGIS features.

## Verify Installation

After setup, verify PostgreSQL is running:

```bash
# Check service status
sudo systemctl status postgresql

# Or test connection
pg_isready -h localhost -p 5432

# Or connect directly
psql -h localhost -U postgres -d prio_logistics
```

## Troubleshooting

### Service Name Issues

On some Arch installations, the service might be named differently:
```bash
# Try these service names:
sudo systemctl start postgresql
sudo systemctl start postgresql@default
sudo systemctl start postgresql@main
```

### Port Already in Use

If port 5432 is already in use:
```bash
# Find what's using the port
sudo lsof -i :5432
# Or
sudo netstat -tlnp | grep 5432
```

### Permission Issues

If you get permission errors:
```bash
# Fix PostgreSQL data directory permissions
sudo chown -R postgres:postgres /var/lib/postgres/data
sudo chmod 700 /var/lib/postgres/data
```
