# DigitalOcean Deployment Checklist

Use this checklist to ensure all steps are completed during deployment.

## Pre-Deployment

- [ ] Repository is up to date (`git pull` on main branch)
- [ ] All changes committed and pushed to GitHub
- [ ] `app.yaml` exists in repository root
- [ ] `backend/package.json` and `frontend/package.json` verified
- [ ] DigitalOcean account is active
- [ ] GitHub account connected to DigitalOcean (for web UI)
- [ ] DigitalOcean API token created (for doctl CLI option)

## Phase 1: GitHub Repository Connection

- [ ] Logged into DigitalOcean Control Panel
- [ ] Navigated to Apps → Create App
- [ ] Selected "GitHub" as source
- [ ] Authorized DigitalOcean to access GitHub (if needed)
- [ ] Selected repository: `mei-the-dev/coppe-radix-offshore`
- [ ] Selected branch: `main`
- [ ] Chose deployment method (Use App Spec or Configure Components)

## Phase 2: Component Configuration

### Backend Service
- [ ] Component Type: Service
- [ ] Name: `backend`
- [ ] Source Directory: `backend` (no leading slash)
- [ ] Build Command: `npm ci && npm run build`
- [ ] Run Command: `npm start`
- [ ] HTTP Port: `3001`
- [ ] Health Check Path: `/health`
- [ ] Environment: Node.js

### Frontend Service
- [ ] Component Type: Service
- [ ] Name: `frontend`
- [ ] Source Directory: `frontend`
- [ ] Build Command: `npm ci && npm run build`
- [ ] Run Command: `npx vite preview --host 0.0.0.0 --port 80`
- [ ] HTTP Port: `80`
- [ ] Routes: `/` (root path)
- [ ] Environment: Node.js

### Database
- [ ] Component Type: Database
- [ ] Engine: PostgreSQL
- [ ] Version: 15
- [ ] Name: `prio-logistics-db`
- [ ] Production: true

## Phase 3: Environment Variables

### Backend Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001`
- [ ] `DB_HOST` = `${prio-logistics-db.HOSTNAME}` (reference)
- [ ] `DB_PORT` = `${prio-logistics-db.PORT}` (reference)
- [ ] `DB_NAME` = `${prio-logistics-db.DATABASE}` (reference)
- [ ] `DB_USER` = `${prio-logistics-db.USERNAME}` (reference)
- [ ] `DB_PASSWORD` = `${prio-logistics-db.PASSWORD}` (reference)
- [ ] `JWT_SECRET` = Generated with `openssl rand -hex 32` (set as SECRET type)

### Frontend Environment Variables
- [ ] `VITE_API_URL` = `${backend.PUBLIC_URL}` (reference, BUILD_TIME scope)
- [ ] `NODE_ENV` = `production`

## Phase 4: Database PostGIS Setup

- [ ] Database provisioned successfully
- [ ] Connected to database via App Platform console or psql
- [ ] Ran: `CREATE EXTENSION IF NOT EXISTS postgis;`
- [ ] Verified PostGIS: `SELECT PostGIS_version();`
- [ ] PostGIS extension confirmed working

## Phase 5: Database Migrations

- [ ] Accessed App Platform console for backend service
- [ ] Navigated to backend directory
- [ ] Ran: `npm run migrate`
- [ ] Migration completed successfully
- [ ] Verified schema creation

## Phase 6: Deployment Verification

### Health Checks
- [ ] Backend health endpoint: `https://<backend-url>.ondigitalocean.app/health`
  - Returns: `{"status":"ok","timestamp":"..."}`
- [ ] Frontend loads: `https://<frontend-url>.ondigitalocean.app`
  - Application loads without errors

### Functional Tests
- [ ] API endpoints accessible from frontend
- [ ] Database connectivity verified
- [ ] Authentication flow works
- [ ] Cargo/loading plan operations functional

## Post-Deployment

- [ ] PostGIS extension enabled
- [ ] Database migrations completed
- [ ] Custom domain configured (optional)
- [ ] SSL certificates configured (if custom domain)
- [ ] Monitoring alerts set up (optional)
- [ ] Auto-deploy verified (push to main branch)
- [ ] All environment variables correctly configured

## Troubleshooting Notes

If issues occur, check:
- [ ] Build logs for errors
- [ ] Environment variable scopes (BUILD_TIME vs RUN_TIME)
- [ ] Database connection strings
- [ ] CORS configuration
- [ ] Service URLs and routing

## Quick Commands Reference

```bash
# Generate JWT secret
openssl rand -hex 32

# Connect to database (via App Platform console)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

# Run migrations
cd backend && npm run migrate

# Check backend health
curl https://<backend-url>.ondigitalocean.app/health
```
