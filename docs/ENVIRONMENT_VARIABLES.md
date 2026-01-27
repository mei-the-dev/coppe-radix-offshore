# Environment Variables

This document describes all environment variables used by the offshore logistics app (backend and frontend), where to set them locally vs in production (DigitalOcean App Platform), and how to obtain or generate values.

---

## Quick reference: DigitalOcean App-Level

For deployment to succeed, add these **App-Level Environment Variables** in DigitalOcean App Platform (Settings → App-Level Environment Variables):

| Key | Value / how to get it | Type | Scope |
|-----|------------------------|------|--------|
| **JWT_SECRET** | `openssl rand -hex 32` (run in your terminal, copy output) | Secret | Run Time |
| **DB_PASSWORD** | Password from your database component (prio-logistics-db → Connection details) | Secret | Run Time |

Optional for production login:

| Key | Value | Type | Scope |
|-----|--------|------|--------|
| **AUTH_DEMO_USER** | Demo username for `/auth/login` | Secret or plain | Run Time |
| **AUTH_DEMO_PASSWORD** | Demo password for `/auth/login` | Secret | Run Time |

---

## Backend

Backend reads from `backend/.env` (local) or from App Platform env (production). **Never commit `.env` or real secrets.**

### Required in production

| Variable | Description | Local | Production (DigitalOcean) |
|----------|-------------|--------|----------------------------|
| **JWT_SECRET** | Secret for signing/verifying JWT. Min 16 characters; 32+ recommended. | `backend/.env` | App-Level env **JWT_SECRET** (generate with `openssl rand -hex 32`) |
| **DB_PASSWORD** | PostgreSQL password for the app database. | `backend/.env` | App-Level env **DB_PASSWORD** (from DB component → Connection details) |

### Database connection (production)

These are usually provided by the database component via `app.yaml` placeholders (`${prio-logistics-db.HOSTNAME}` etc.). If your spec references them, ensure the database is linked. Otherwise set at App-Level:

| Variable | Description | Typical value |
|----------|-------------|----------------|
| **DB_HOST** | PostgreSQL host | From prio-logistics-db connection |
| **DB_PORT** | PostgreSQL port | From prio-logistics-db (e.g. 25060) |
| **DB_NAME** | Database name | `prio_logistics` |
| **DB_USER** | Database user | `prio_user` |
| **DB_PASSWORD** | Database password | From prio-logistics-db credentials |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| **PORT** | HTTP port | `3001` |
| **NODE_ENV** | `development` or `production` | Set by platform in production |
| **AUTH_DEMO_USER** | Demo login username | `coppetec` (dev only if unset in prod) |
| **AUTH_DEMO_PASSWORD** | Demo login password | `rotaviva` (dev only; **must** be set in production for auth) |
| **SKIP_DECK_AREA_CHECK** | Set to `1` to skip deck-area column check on startup | unset |

### Local backend `.env` example

Create `backend/.env` (gitignored):

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prio_logistics
DB_USER=postgres
DB_PASSWORD=your_local_db_password
JWT_SECRET=your-dev-secret-at-least-16-chars
```

---

## Frontend

Frontend uses Vite; only variables prefixed with `VITE_` are exposed to the client. Local: `frontend/.env`. Production: set at build time in App Platform.

### Variables

| Variable | Description | Local | Production |
|----------|-------------|--------|------------|
| **VITE_API_URL** | Backend API base URL | `http://localhost:3001` in `frontend/.env` | Set to backend public URL or leave unset for same-origin proxy |

### Local frontend `.env` example

Copy from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3001
```

---

## Where to find DB_PASSWORD in DigitalOcean

1. **App database component**  
   App Platform → your app → component **prio-logistics-db** (or your DB name) → **Connection details** or **Credentials** → use the **password** shown there for **DB_PASSWORD**.

2. **Managed Database**  
   DigitalOcean → **Databases** → your cluster → **Connection details** or **Users** → password for the app user. If unknown, use **Reset user password**, then set that value as **DB_PASSWORD** in the app.

---

## Generating JWT_SECRET

Run in any terminal (Cursor, macOS Terminal, Git Bash, WSL):

```bash
openssl rand -hex 32
```

Use the full output (64 hex characters) as the value for **JWT_SECRET** in App-Level Environment Variables. Type: **Secret**, Scope: **Run Time**.

---

## Summary by role

- **Local development:** Use `backend/.env` and `frontend/.env`; see examples above.
- **DigitalOcean production:** Set **JWT_SECRET** and **DB_PASSWORD** (and optionally **AUTH_DEMO_USER** / **AUTH_DEMO_PASSWORD**) as App-Level Environment Variables. DB_HOST, DB_PORT, DB_NAME, DB_USER normally come from the database component when linked in `app.yaml`.

For deployment failures tied to env vars, see [DEPLOYMENT_TROUBLESHOOTING.md](../DEPLOYMENT_TROUBLESHOOTING.md) and the “Missing JWT_SECRET” / “Missing DB_PASSWORD” sections.
