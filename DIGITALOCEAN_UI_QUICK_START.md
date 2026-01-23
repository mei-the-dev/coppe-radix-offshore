# DigitalOcean UI Quick Start Guide

## Source Directory Configuration

**You do NOT need to create any files.** Just enter the directory names in the Source Directory field.

### For Backend Component:
- **Source Directory**: `backend`
  - Enter exactly: `backend` (no leading slash, no trailing slash, no quotes)

### For Frontend Component:
- **Source Directory**: `frontend`
  - Enter exactly: `frontend` (no leading slash, no trailing slash, no quotes)

## Step-by-Step UI Deployment

### Step 1: Connect Repository
1. Go to DigitalOcean Control Panel → Apps → Create App
2. Select **GitHub** as source
3. Authorize DigitalOcean (if needed)
4. Select repository: `mei-the-dev/coppe-radix-offshore`
5. Select branch: `main`
6. Click **Next**

### Step 2: Handle "No Components Detected"
If you see "No components detected" (normal for monorepos):
- Click **Edit Components** or **Skip to Review**
- Then manually add components

### Step 3: Add Backend Component
1. Click **Add Component** → **Service**
2. Fill in these fields:
   - **Name**: `backend`
   - **Source Directory**: `backend` ← Enter this exactly
   - **Build Command**: `npm ci && npm run build`
   - **Run Command**: `npm start`
   - **HTTP Port**: `3001`
   - **Health Check Path**: `/health`
   - **Environment**: Node.js

### Step 4: Add Frontend Component
1. Click **Add Component** → **Service** (or Static Site)
2. Fill in these fields:
   - **Name**: `frontend`
   - **Source Directory**: `frontend` ← Enter this exactly
   - **Build Command**: `npm ci && npm run build`
   - **Run Command**: `npx vite preview --host 0.0.0.0 --port 80`
   - **HTTP Port**: `80`
   - **Routes**: `/`
   - **Environment**: Node.js

### Step 5: Add Database
1. Click **Add Database** → **PostgreSQL**
2. Configure:
   - **Version**: PostgreSQL 15
   - **Name**: `prio-logistics-db`
   - **Production**: Yes

### Step 6: Configure Environment Variables

**Backend Environment Variables:**
- `NODE_ENV` = `production`
- `PORT` = `3001`
- `DB_HOST` = Use reference: `${prio-logistics-db.HOSTNAME}`
- `DB_PORT` = Use reference: `${prio-logistics-db.PORT}`
- `DB_NAME` = Use reference: `${prio-logistics-db.DATABASE}`
- `DB_USER` = Use reference: `${prio-logistics-db.USERNAME}`
- `DB_PASSWORD` = Use reference: `${prio-logistics-db.PASSWORD}`
- `JWT_SECRET` = Generate with: `openssl rand -hex 32`

**Frontend Environment Variables:**
- `VITE_API_URL` = Use reference: `${backend.PUBLIC_URL}` (IMPORTANT: Set scope to BUILD_TIME)
- `NODE_ENV` = `production`

### Step 7: Deploy
1. Click **Create Resources**
2. Wait for deployment to complete
3. Note the URLs for backend and frontend

### Step 8: Post-Deployment
1. Enable PostGIS extension (see `scripts/setup-postgis.sql`)
2. Run database migrations (via backend console)
3. Verify deployment (use `scripts/verify-deployment.sh`)

## Important Notes

### Source Directory Field
- ✅ **Correct**: `backend` or `frontend`
- ❌ **Wrong**: `/backend`, `./backend`, `backend/`, `"backend"`

### Environment Variable References
When setting database variables, use the **reference syntax**:
- Click the variable reference button (usually a link icon)
- Select the database component
- Choose the variable (HOSTNAME, PORT, etc.)

### VITE_API_URL Scope
**Critical**: `VITE_API_URL` must be set at **BUILD_TIME** (not just RUN_TIME) for Vite to embed it in the production build.

## Troubleshooting

### "No components detected"
This is **normal** for monorepos. Just manually add components as described above.

### Build fails
- Check Source Directory is exactly `backend` or `frontend` (no slashes)
- Verify `package.json` exists in those directories
- Check build logs for specific errors

### Frontend can't connect to backend
- Ensure `VITE_API_URL` is set at BUILD_TIME scope
- Verify backend service URL is correct
- Check CORS configuration

## Quick Reference

| Component | Source Directory | Build Command | Run Command | Port |
|-----------|-----------------|---------------|------------|------|
| Backend | `backend` | `npm ci && npm run build` | `npm start` | 3001 |
| Frontend | `frontend` | `npm ci && npm run build` | `npx vite preview --host 0.0.0.0 --port 80` | 80 |

---

**Remember**: You don't need to create any files. Just enter `backend` and `frontend` in the Source Directory fields!
