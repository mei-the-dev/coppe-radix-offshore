# DigitalOcean App Platform Setup Guide

## The Problem

DigitalOcean App Platform's web UI tries to **auto-detect components** from the repository root first. Since this is a monorepo with `backend/` and `frontend/` subdirectories, it can't find `package.json` in the root and shows "No components detected".

## Solution Options

### Option 1: Manual Component Configuration (Recommended for Web UI)

When DigitalOcean shows "No components detected", you can manually configure each component:

#### Step 1: Add Backend Component

1. In the App Platform UI, click **"Edit Components"** or **"Add Component"**
2. Select **"Service"** (not Static Site)
3. Configure:
   - **Name**: `backend`
   - **Source Directory**: `backend` (important: no leading slash)
   - **Build Command**: `npm ci && npm run build`
   - **Run Command**: `npm start`
   - **HTTP Port**: `3001`
   - **Health Check Path**: `/health`
   - **Environment**: Node.js

#### Step 2: Add Frontend Component

1. Click **"Add Component"** again
2. Select **"Service"** or **"Static Site"** (Service works better for Vite preview)
3. Configure:
   - **Name**: `frontend`
   - **Source Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Run Command**: `npx vite preview --host 0.0.0.0 --port 80`
   - **HTTP Port**: `80`
   - **Environment**: Node.js
   - **Routes**: `/` (root path)

#### Step 3: Add Database

1. Click **"Add Database"**
2. Select **PostgreSQL**
3. Choose version **15**
4. Name it: `prio-logistics-db`

#### Step 4: Configure Environment Variables

**Backend Environment Variables:**
- `NODE_ENV` = `production`
- `PORT` = `3001`
- `DB_HOST` = (from database component - use the reference)
- `DB_PORT` = (from database component - use the reference)
- `DB_NAME` = (from database component - use the reference)
- `DB_USER` = (from database component - use the reference)
- `DB_PASSWORD` = (from database component - use the reference)
- `JWT_SECRET` = (generate with `openssl rand -hex 32`)

**Frontend Environment Variables:**
- `VITE_API_URL` = (use backend component's public URL reference)
- `NODE_ENV` = `production`

#### Step 5: Deploy

Click **"Create Resources"** and monitor the deployment.

---

### Option 2: Use doctl CLI (Recommended for app.yaml)

If you prefer to use the `app.yaml` file directly, use DigitalOcean's CLI tool:

#### Step 1: Install doctl

```bash
# macOS
brew install doctl

# Linux
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-1.104.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin

# Windows (using Chocolatey)
choco install doctl
```

#### Step 2: Authenticate

```bash
doctl auth init
```

Enter your DigitalOcean API token (create one at https://cloud.digitalocean.com/account/api/tokens)

#### Step 3: Update app.yaml

Edit `app.yaml` and replace `your-username` with your actual GitHub username:

```yaml
github:
  repo: mei-the-dev/coppe-radix-offshore  # Update this
  branch: main
```

#### Step 4: Create App from app.yaml

```bash
doctl apps create --spec app.yaml
```

This will create the app directly from your `app.yaml` configuration.

#### Step 5: Set Environment Variables

After the app is created, set the `JWT_SECRET`:

```bash
# Get your app ID
doctl apps list

# Set JWT_SECRET
doctl apps update <APP_ID> --spec app.yaml
# Then add JWT_SECRET in the web UI, or use:
doctl apps update <APP_ID> --spec - <<EOF
# ... (you'll need to update the spec with the secret)
EOF
```

Or set it in the web UI after the app is created.

---

### Option 3: Import Existing App Spec

If you've already created an app in the web UI, you can export its spec and use it:

1. In App Platform, go to your app
2. Click **Settings** → **App Spec**
3. Copy the YAML
4. Save it as `app.yaml` in your repo
5. Future updates can use `doctl apps update <APP_ID> --spec app.yaml`

---

## Troubleshooting

### "No components detected" still appears

1. **Verify package.json exists:**
   ```bash
   ls backend/package.json frontend/package.json
   ```

2. **Check source directory path:**
   - Use `backend` not `/backend`
   - Use `frontend` not `/frontend`

3. **Try the manual setup** (Option 1) - it's more reliable for monorepos

### Build fails

1. **Check Node.js version:**
   - App Platform uses Node.js 18+ by default
   - Verify your `package.json` doesn't require a specific version

2. **Check build commands:**
   - Backend: `npm ci && npm run build`
   - Frontend: `npm ci && npm run build`

3. **Check environment variables:**
   - Ensure `VITE_API_URL` is set for frontend build
   - Ensure database variables are set for backend

### Database connection fails

1. **Verify database component is created first**
2. **Check environment variable references:**
   - Use the database component's variable references, not hardcoded values
3. **Run migrations after deployment:**
   ```bash
   # Via App Platform console
   cd backend
   npm run migrate
   ```

---

## Quick Reference

### Component Detection Rules

DigitalOcean looks for these files in the **root directory**:
- `package.json` → Node.js app
- `requirements.txt` → Python app
- `Dockerfile` → Docker build
- `go.mod` → Go app
- etc.

For monorepos, you **must** specify `source_dir` manually.

### app.yaml Location

- `app.yaml` in root directory ✅
- `.do/app.yaml` in root directory ✅
- `app.yaml` in subdirectory ❌

### Source Directory Format

- ✅ `source_dir: backend`
- ✅ `source_dir: frontend`
- ❌ `source_dir: /backend` (leading slash)
- ❌ `source_dir: ./backend` (relative path with ./)

---

## Next Steps After Deployment

1. **Run database migrations:**
   ```bash
   # Via App Platform console or SSH
   cd backend
   npm run migrate
   ```

2. **Verify health endpoints:**
   - Backend: `https://your-backend-url.ondigitalocean.app/health`
   - Frontend: `https://your-frontend-url.ondigitalocean.app`

3. **Set up custom domain** (optional):
   - Go to Settings → Domains
   - Add your custom domain
   - Update DNS records

4. **Enable auto-deploy:**
   - Already configured if you set `deploy_on_push: true` in app.yaml
   - Or enable in Settings → App Spec
