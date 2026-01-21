# Quick Start Guide

## Step 1: Start PostgreSQL

On Arch Linux, start PostgreSQL with:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Optional: start on boot
```

Or if using a different setup:

```bash
# Check if PostgreSQL is installed
psql --version

# Start PostgreSQL (method depends on your installation)
sudo systemctl start postgresql
# OR
sudo service postgresql start
# OR (if installed via Docker)
docker start postgres
```

## Step 2: Create Database and User

```bash
# Connect as postgres user
sudo -u postgres psql

# In psql prompt, run:
CREATE DATABASE prio_logistics;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE prio_logistics TO your_username;

# Enable PostGIS extension
\c prio_logistics
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

# Exit psql
\q
```

## Step 3: Configure Environment

Create `.env` file in `backend/` directory:

```bash
cd backend
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prio_logistics
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
EOF
```

## Step 4: Run Migration

```bash
npm run migrate
```

## Step 5: Start Server

```bash
npm run dev
```

## Troubleshooting

### Connection Refused Error

If you get `ECONNREFUSED`:
1. Check if PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   pg_isready -h localhost -p 5432
   ```

2. If not running, start it:
   ```bash
   sudo systemctl start postgresql
   ```

3. Check PostgreSQL is listening:
   ```bash
   sudo netstat -tlnp | grep 5432
   # OR
   sudo ss -tlnp | grep 5432
   ```

### Authentication Failed

If you get authentication errors:
1. Check your `.env` file has correct credentials
2. Verify user exists:
   ```bash
   sudo -u postgres psql -c "\du"
   ```
3. Reset password if needed:
   ```bash
   sudo -u postgres psql -c "ALTER USER your_username WITH PASSWORD 'new_password';"
   ```

### Database Does Not Exist

If database doesn't exist:
```bash
sudo -u postgres createdb prio_logistics
```

### Permission Denied

If you get permission errors:
```bash
sudo -u postgres psql prio_logistics -c "GRANT ALL PRIVILEGES ON DATABASE prio_logistics TO your_username;"
```
