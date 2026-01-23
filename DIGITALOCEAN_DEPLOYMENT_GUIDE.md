# DigitalOcean App Platform Deployment Guide

Complete step-by-step guide for deploying the Offshore Logistics Application to DigitalOcean App Platform via GitHub repository connection.

## Quick Start

1. **Prerequisites Check**
   ```bash
   # Verify repository structure
   ls -la app.yaml backend/package.json frontend/package.json

   # Generate JWT secret
   ./scripts/generate-jwt-secret.sh
   ```

2. **Deploy via Web UI** (Recommended for first-time setup)
   - Follow [Phase 1: GitHub Repository Connection](#phase-1-github-repository-connection)
   - Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) to track progress

3. **Deploy via CLI** (For automation)
   ```bash
   doctl auth init
   doctl apps create --spec app.yaml
   ```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           DigitalOcean App Platform                      │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Frontend   │    │   Backend    │                  │
│  │  (Vite/React)│───▶│ (Node/Express)│                 │
│  │   Port: 80   │    │  Port: 3001  │                  │
│  └──────────────┘    └──────┬───────┘                  │
│                             │                           │
│                    ┌────────▼────────┐                  │
│                    │  PostgreSQL DB  │                  │
│                    │  (with PostGIS) │                  │
│                    └─────────────────┘                  │
└─────────────────────────────────────────────────────────┘
         ▲
         │
         │ GitHub Webhook
         │ (auto-deploy on push)
         │
┌────────┴────────┐
│  GitHub Repo    │
│  mei-the-dev/   │
│  coppe-radix-   │
│  offshore       │
└─────────────────┘
```

## Phase 1: GitHub Repository Connection

### Option A: Web UI (Recommended)

1. **Access DigitalOcean Control Panel**
   - Go to https://cloud.digitalocean.com
   - Log in to your account

2. **Create New App**
   - Click **Apps** in the left sidebar
   - Click **Create App** button

3. **Connect GitHub Repository**
   - Select **GitHub** as source
   - If not already connected, click **Connect GitHub Account**
   - Authorize DigitalOcean to access your repositories
   - Select repository: `mei-the-dev/coppe-radix-offshore`
   - Select branch: `main`
   - Click **Next**

4. **Component Detection**
   - DigitalOcean may show "No components detected" (this is normal for monorepos)
   - Click **Edit Components** or **Configure Components**
   - Proceed to [Phase 2: Component Configuration](#phase-2-component-configuration)

### Option B: doctl CLI

1. **Install doctl**
   ```bash
   # macOS
   brew install doctl

   # Linux
   wget https://github.com/digitalocean/doctl/releases/latest/download/doctl-*-linux-amd64.tar.gz
   tar xf doctl-*-linux-amd64.tar.gz
   sudo mv doctl /usr/local/bin

   # Windows (Chocolatey)
   choco install doctl
   ```

2. **Authenticate**
   ```bash
   doctl auth init
   # Enter your DigitalOcean API token
   # Create token at: https://cloud.digitalocean.com/account/api/tokens
   ```

3. **Create App from Spec**
   ```bash
   cd /path/to/offshore-logistics-app
   doctl apps create --spec app.yaml
   ```

4. **Set JWT_SECRET**
   - After app creation, set `JWT_SECRET` in App Platform UI
   - Or update app spec with secret value

## Phase 2: Component Configuration

Since this is a monorepo, components must be configured manually.

### Backend Service Configuration

1. **Add Component**
   - Click **Add Component** → **Service**

2. **Basic Settings**
   - **Name**: `backend`
   - **Source Directory**: `backend` (⚠️ no leading slash)
   - **Environment**: Node.js

3. **Build Settings**
   - **Build Command**: `npm ci && npm run build`
   - **Run Command**: `npm start`

4. **HTTP Settings**
   - **HTTP Port**: `3001`
   - **Health Check Path**: `/health`

5. **Instance Settings**
   - **Instance Size**: Basic XXS (or larger for production)
   - **Instance Count**: 1

### Frontend Service Configuration

1. **Add Component**
   - Click **Add Component** → **Service**

2. **Basic Settings**
   - **Name**: `frontend`
   - **Source Directory**: `frontend`
   - **Environment**: Node.js

3. **Build Settings**
   - **Build Command**: `npm ci && npm run build`
   - **Run Command**: `npx vite preview --host 0.0.0.0 --port 80`

4. **HTTP Settings**
   - **HTTP Port**: `80`
   - **Routes**: `/` (root path)

5. **Instance Settings**
   - **Instance Size**: Basic XXS (or larger for production)
   - **Instance Count**: 1

### Database Configuration

1. **Add Database**
   - Click **Add Database** → **PostgreSQL**

2. **Database Settings**
   - **Name**: `prio-logistics-db`
   - **Version**: PostgreSQL 15
   - **Production**: Yes
   - **Database Name**: `prio_logistics`
   - **Database User**: `prio_user`

## Phase 3: Environment Variables

### Backend Environment Variables

Configure these in the backend service settings:

| Variable | Value | Scope | Type |
|----------|-------|-------|------|
| `NODE_ENV` | `production` | RUN_TIME | Plain |
| `PORT` | `3001` | RUN_TIME | Plain |
| `DB_HOST` | `${prio-logistics-db.HOSTNAME}` | RUN_TIME | Secret |
| `DB_PORT` | `${prio-logistics-db.PORT}` | RUN_TIME | Secret |
| `DB_NAME` | `${prio-logistics-db.DATABASE}` | RUN_TIME | Secret |
| `DB_USER` | `${prio-logistics-db.USERNAME}` | RUN_TIME | Secret |
| `DB_PASSWORD` | `${prio-logistics-db.PASSWORD}` | RUN_TIME | Secret |
| `JWT_SECRET` | (generate with `openssl rand -hex 32`) | RUN_TIME | Secret |

**Important**: Use the reference syntax `${prio-logistics-db.VARIABLE}` to automatically get database connection details.

### Frontend Environment Variables

Configure these in the frontend service settings:

| Variable | Value | Scope | Type |
|----------|-------|-------|------|
| `VITE_API_URL` | `${backend.PUBLIC_URL}` | **RUN_AND_BUILD_TIME** | Plain |
| `NODE_ENV` | `production` | RUN_TIME | Plain |

**Critical**: `VITE_API_URL` must be set at **BUILD_TIME** for Vite to embed it in the production build.

## Phase 4: Database PostGIS Setup

After the database is provisioned:

1. **Access Database Console**
   - Go to your app in App Platform
   - Click on the database component
   - Click **Console** or use connection details with `psql`

2. **Enable PostGIS Extension**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Verify Installation**
   ```sql
   SELECT PostGIS_version();
   ```

4. **Alternative: Use Setup Script**
   ```bash
   # Copy setup-postgis.sql to database console
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f scripts/setup-postgis.sql
   ```

## Phase 5: Database Migrations

1. **Access Backend Console**
   - Go to your app in App Platform
   - Click on the backend service
   - Click **Console** tab

2. **Run Migrations**
   ```bash
   cd backend
   npm run migrate
   ```

3. **Verify Migration**
   - Check console output for success messages
   - Verify tables are created in database

## Phase 6: Deployment Verification

### Health Checks

1. **Backend Health**
   ```bash
   curl https://<your-backend-url>.ondigitalocean.app/health
   ```
   Expected response:
   ```json
   {"status":"ok","timestamp":"2024-01-23T..."}
   ```

2. **Frontend Access**
   - Open: `https://<your-frontend-url>.ondigitalocean.app`
   - Verify application loads
   - Check browser console for errors

3. **Automated Verification**
   ```bash
   ./scripts/verify-deployment.sh \
     https://<backend-url>.ondigitalocean.app \
     https://<frontend-url>.ondigitalocean.app
   ```

### Functional Testing

- [ ] Login/authentication works
- [ ] API endpoints return data
- [ ] Database queries execute successfully
- [ ] Frontend connects to backend API
- [ ] Cargo/loading plan operations work

## Post-Deployment Tasks

### 1. Enable PostGIS Extension
See [Phase 4](#phase-4-database-postgis-setup)

### 2. Run Database Migrations
See [Phase 5](#phase-5-database-migrations)

### 3. Configure Custom Domain (Optional)

1. **Add Domain in App Platform**
   - Go to Settings → Domains
   - Click **Add Domain**
   - Enter your domain name

2. **Update DNS Records**
   - Add CNAME record pointing to App Platform domain
   - Wait for DNS propagation

3. **SSL Certificate**
   - App Platform automatically provisions SSL certificates
   - Wait for certificate to be issued

### 4. Set Up Monitoring (Optional)

- Configure alerts for service health
- Set up log aggregation
- Monitor database performance metrics

### 5. Verify Auto-Deploy

1. **Make a Test Change**
   ```bash
   git checkout -b test-auto-deploy
   echo "# Test" >> README.md
   git commit -m "Test auto-deploy"
   git push origin test-auto-deploy
   ```

2. **Check App Platform**
   - Go to your app
   - Check Deployments tab
   - Verify new deployment triggered

## Troubleshooting

### "No components detected"

**Solution**: This is normal for monorepos. Manually configure components as described in Phase 2.

### Build Failures

**Common Causes**:
- Missing environment variables at BUILD_TIME
- Node.js version mismatch
- Dependency installation issues

**Solutions**:
- Check build logs in App Platform
- Verify `VITE_API_URL` is set at BUILD_TIME for frontend
- Ensure all dependencies are in `package.json`

### Database Connection Issues

**Common Causes**:
- Environment variables not using reference syntax
- Database not provisioned before backend
- Firewall rules blocking access

**Solutions**:
- Use `${prio-logistics-db.VARIABLE}` syntax
- Verify database component exists
- Check database connection strings

### Frontend Can't Connect to Backend

**Common Causes**:
- `VITE_API_URL` not set at BUILD_TIME
- CORS configuration issues
- Backend URL incorrect

**Solutions**:
- Set `VITE_API_URL` with scope `RUN_AND_BUILD_TIME`
- Verify backend CORS allows frontend domain
- Check backend service URL

### PostGIS Extension Issues

**Common Causes**:
- Extension not enabled
- Database user lacks permissions
- PostGIS not available in managed database

**Solutions**:
- Run `CREATE EXTENSION postgis;`
- Check database user permissions
- Consider using DigitalOcean Managed Database with PostGIS

## Configuration Files Reference

- **`app.yaml`**: Main App Platform configuration
- **`DEPLOYMENT_CHECKLIST.md`**: Step-by-step checklist
- **`scripts/generate-jwt-secret.sh`**: Generate JWT secret
- **`scripts/setup-postgis.sql`**: PostGIS setup script
- **`scripts/verify-deployment.sh`**: Deployment verification script

## Quick Reference Commands

```bash
# Generate JWT secret
./scripts/generate-jwt-secret.sh

# Verify deployment
./scripts/verify-deployment.sh <backend-url> <frontend-url>

# Check backend health
curl https://<backend-url>.ondigitalocean.app/health

# Connect to database
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

# Run migrations (in backend console)
cd backend && npm run migrate
```

## Support Resources

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [App Platform App Spec Reference](https://docs.digitalocean.com/products/app-platform/reference/app-spec/)
- [DEPLOYMENT.md](./DEPLOYMENT.md): General deployment guide
- [DIGITALOCEAN_SETUP.md](./DIGITALOCEAN_SETUP.md): Setup troubleshooting guide
