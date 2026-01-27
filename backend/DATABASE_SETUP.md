# Database Setup Guide

This guide will help you set up the PostgreSQL database for the PRIO Offshore Logistics API.

## Prerequisites

- PostgreSQL 14+ installed
- PostGIS extension (for geographic data)
- Node.js and npm installed

## Installation Steps

### 1. Install PostgreSQL and PostGIS

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib postgis
```

**macOS (using Homebrew):**
```bash
brew install postgresql postgis
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE prio_logistics;

# Connect to the database
\c prio_logistics

# Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

# Enable pg_trgm for text search (optional)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

# Note: TimescaleDB is optional for time-series data
# If you have TimescaleDB installed:
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prio_logistics
DB_USER=postgres
DB_PASSWORD=your_password_here

JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

### 4. Run Database Migration

```bash
cd backend
npm install
npm run migrate
```

This will execute the SQL schema from `references/prio_sql_schema.sql`.

**Existing databases:** If the DB was created before `vessels.clear_deck_area_m2` existed, run the additive migration from the project root:

```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/add-vessel-deck-area.sql
```

Or from the backend: `npm run add-deck-area`. Then re-run the seed so vessel rows get clear deck area values (Standard PSV ~950 m², Large PSV ~1120 m², CSV ~1500 m², WSV ~1120 m²).

**Deploy / startup check:** On start, the API runs a deck-area check: it ensures `vessels.clear_deck_area_m2` exists (adds it if missing) and reports if it is empty. This allows deploys to succeed without manual migration. To skip the check (e.g. a worker that does not use vessels), set `SKIP_DECK_AREA_CHECK=1`.

### 5. Install Dependencies

```bash
cd backend
npm install
```

### 6. Start the Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Database Schema

The database schema includes:

- **Network Domain**: Supply bases, installations, distance matrix
- **Fleet Domain**: Vessels, compartments, schedules
- **Cargo Domain**: Cargo types, demands, orders, inventory
- **Operations Domain**: Trips, waypoints, time windows
- **Environment Domain**: Weather forecasts, seasonal patterns
- **Costs Domain**: Cost structures, trip costs, penalties
- **Optimization Domain**: Optimization runs, solutions, KPIs

## API Endpoints

Once the database is set up, you can access the API endpoints:

- **Authentication**: `POST /auth/login`
- **Installations**: `GET /installations`
- **Vessels**: `GET /fleet/vessels`
- **Demands**: `GET /demands`
- **Trips**: `GET /trips`
- **Weather**: `GET /weather/forecasts`
- **Analytics**: `GET /analytics/kpis`

See `references/prio_api_spec.md` for complete API documentation.

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Verify PostgreSQL is running: `sudo systemctl status postgresql`
2. Check your `.env` file has correct credentials
3. Ensure the database exists: `psql -l | grep prio_logistics`

### PostGIS Issues

If PostGIS extension fails:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-14-postgis-3

# Then in psql:
CREATE EXTENSION postgis;
```

### Migration Errors

If migration fails:
1. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
2. Some errors (like "already exists") are safe to ignore
3. TimescaleDB errors are optional - the schema will work without it

## Next Steps

1. Seed the database with initial data (vessels, installations, etc.)
2. Set up authentication with real user accounts
3. Configure optimization solver (Gurobi, CPLEX, etc.)
4. Set up weather data ingestion
5. Configure webhooks for real-time updates
