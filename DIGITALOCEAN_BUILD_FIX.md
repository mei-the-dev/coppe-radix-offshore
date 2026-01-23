# DigitalOcean Build Fix

## Issue: Build Using Dockerfile Instead of Buildpacks

If your build is using Dockerfile instead of buildpacks, follow these steps:

### Solution: Configure Build Method in UI

1. **Edit Your App Components**
   - Go to your app in DigitalOcean App Platform
   - Click on the component (backend or frontend)
   - Click **Edit** or **Settings**

2. **Change Build Method**
   - Look for **Build Method** or **Build Type** setting
   - Select **Buildpacks** (NOT Dockerfile)
   - Save changes

3. **Verify Build Commands**
   - Ensure these are set:
     - **Build Command**: `npm ci && npm run build`
     - **Run Command**: `npm start` (backend) or `npx vite preview --host 0.0.0.0 --port 80` (frontend)

### Alternative: Remove Dockerfile Detection

If DigitalOcean keeps auto-detecting the Dockerfile:

1. **Temporarily rename Dockerfiles** (for UI deployment only):
   ```bash
   # Rename to prevent auto-detection
   mv frontend/Dockerfile frontend/Dockerfile.docker
   mv backend/Dockerfile backend/Dockerfile.docker
   ```

2. **Deploy via UI** (will use buildpacks)

3. **Rename back** (if you need Dockerfiles for other deployments):
   ```bash
   mv frontend/Dockerfile.docker frontend/Dockerfile
   mv backend/Dockerfile.docker backend/Dockerfile
   ```

### Why This Happens

DigitalOcean App Platform auto-detects build methods in this order:
1. Dockerfile (if present in source directory)
2. Buildpacks (if package.json, requirements.txt, etc. found)

Since we have Dockerfiles in the repo, DigitalOcean prefers them. You need to explicitly select Buildpacks in the UI.

## Issue: Missing LoginPage Files

If you see this error:
```
error TS2307: Cannot find module '../pages/LoginPage'
```

**Solution**: The LoginPage files are now committed. Pull the latest changes:
```bash
git pull origin main
```

Or if deploying from UI, the files are now in the repository.

## Verification

After fixing, verify:
1. Build logs show "using buildpacks" not "using dockerfile"
2. Build completes successfully
3. No TypeScript errors about missing modules
