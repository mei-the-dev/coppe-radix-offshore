# Deployment Troubleshooting Guide

## Secrets and Environment Variables

**Never commit secrets or credentials.** All sensitive values must come from environment variables.

| Variable | Where | Required (production) | Description |
|----------|-------|------------------------|-------------|
| `JWT_SECRET` | Backend | Yes, min 16 chars | Secret for signing/verifying JWT tokens. Set in DigitalOcean App Platform → backend → Environment Variables. |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Backend | `DB_PASSWORD` required in production | PostgreSQL connection. Backend and `migrate` script use these. |
| `VITE_API_URL` | Frontend (build) | Optional when same-origin | Backend API base URL. For same-origin deploy, can be empty; client uses `/coppe-radix-offshore-backend`. |
| `AUTH_DEMO_USER`, `AUTH_DEMO_PASSWORD` | Backend | Required in production for auth | Demo login credentials used by `/auth/login`. Set in App Platform for the backend component. |

- **Backend:** Set `JWT_SECRET` and `DB_PASSWORD` in production; the app will not start without them.
- **Frontend:** API URL is derived from `VITE_API_URL` or same-origin path; no API keys in code.
- **Login:** No default or demo credentials in the repo; all login data comes from user input.

See `frontend/.env.example` for frontend env template. Backend uses `dotenv` and reads from App Platform env.

## Backend URL Configuration

**Current deployment:** The backend is at the same origin as the frontend, under the path `/coppe-radix-offshore-backend`:

- Frontend: `https://sea-lion-app-8l7y7.ondigitalocean.app/`
- Backend: `https://sea-lion-app-8l7y7.ondigitalocean.app/coppe-radix-offshore-backend`

The API client is configured to use this path when running on `ondigitalocean.app` and when `VITE_API_URL` is localhost or empty.

## Backend URL Configuration Issue

If you're experiencing "failed to fetch" errors when trying to login, the frontend might not be able to find the backend URL.

### Problem

In DigitalOcean App Platform, `${backend.PUBLIC_URL}` should work, but there are cases where it might not be available at build time (which Vite needs) or might not resolve correctly.

### Solution 1: Find Backend URL Manually

1. **Go to DigitalOcean App Platform Dashboard**
   - Navigate to your app: `offshore-logistics-app`
   - Click on the **backend** service component
   - Look for the **Live App** section or **Domains** section
   - Copy the public URL (should look like `https://backend-xxxxx.ondigitalocean.app`)

2. **Set Environment Variable**
   - Go to your app settings
   - Click on the **frontend** service
   - Go to **Environment Variables**
   - Find or add `VITE_API_URL`
   - Set it to your backend's public URL (e.g., `https://backend-xxxxx.ondigitalocean.app`)
   - **Important**: Set scope to **RUN_AND_BUILD_TIME**
   - Save and redeploy

### Solution 2: Use Manual Override (Temporary Fix)

If you need a quick fix without redeploying:

1. Open your browser's developer console on the deployed app
2. Run this command:
   ```javascript
   localStorage.setItem('API_BASE_URL_OVERRIDE', 'https://your-backend-url.ondigitalocean.app');
   ```
3. Refresh the page
4. Try logging in again

### Solution 3: Verify Backend Has Public Route

Make sure your `app.yaml` has a route configured for the backend:

```yaml
services:
  - name: backend
    # ... other config ...
    routes:
      - path: /
```

This ensures the backend has a public URL.

### Solution 4: Check Backend Health

Test if the backend is accessible:

```bash
curl https://your-backend-url.ondigitalocean.app/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Finding Your Backend URL

The backend URL format in DigitalOcean is typically:
- `https://<app-name>-<service-name>-<hash>.ondigitalocean.app`
- Or: `https://<service-name>-<hash>.ondigitalocean.app`

For example:
- App: `offshore-logistics-app`
- Service: `backend`
- URL might be: `https://backend-xxxxx.ondigitalocean.app`

### Debugging Steps

1. **Check Browser Console**
   - Open developer tools
   - Look for console logs showing:
     - `API Base URL: ...`
     - `VITE_API_URL env: ...`
   - This will show what URL the frontend is trying to use

2. **Check Network Tab**
   - Try to login
   - Look at the failed request
   - Check the URL being requested
   - Check the error message

3. **Verify Environment Variables**
   - In DigitalOcean dashboard
   - Check that `VITE_API_URL` is set for the frontend service
   - Verify it's set to **RUN_AND_BUILD_TIME** scope
   - Check the actual value

### Common Issues

1. **Backend URL not set at build time**
   - Vite needs `VITE_API_URL` at build time
   - Make sure scope is `RUN_AND_BUILD_TIME`

2. **Backend doesn't have public route**
   - Add `routes: - path: /` to backend service in `app.yaml`
   - Redeploy

3. **CORS errors**
   - Backend CORS is configured to allow all origins
   - If still getting CORS errors, check backend logs

4. **Backend not accessible**
   - Check backend health endpoint
   - Verify backend service is running
   - Check DigitalOcean service logs

### Quick Test

After setting the backend URL, test the login endpoint:

```bash
curl -X POST https://your-backend-url.ondigitalocean.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"coppetec","password":"rotaviva"}'
```

Should return a JSON response with `access_token`.
