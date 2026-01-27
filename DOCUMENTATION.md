# Project Documentation

This document is the **master index** for all documentation in the offshore logistics app (COPPE-RADIX / ROTAVIVA). Use it to find setup, development, deployment, and reference docs quickly.

---

## Documentation map

| Topic | Document | When to use |
|-------|----------|-------------|
| **Getting started** | [README.md](README.md) | Overview, quick start, tech stack, project structure |
| **Environment variables** | [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) | Local `.env` setup, **DigitalOcean App-Level** vars (JWT_SECRET, DB_PASSWORD), where to find DB credentials |
| **Deployment (DigitalOcean)** | [DIGITALOCEAN_DEPLOYMENT_GUIDE.md](DIGITALOCEAN_DEPLOYMENT_GUIDE.md) | Step-by-step deploy to App Platform |
| **Deployment troubleshooting** | [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md) | Missing JWT_SECRET, DB_PASSWORD, backend URL, login issues |
| **Deployment checklist** | [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre- and post-deploy checklist |
| **DigitalOcean MCP** | [docs/DIGITALOCEAN_MCP.md](docs/DIGITALOCEAN_MCP.md) | Configure and use the DO MCP server in Cursor for app list, logs, deployment status |
| **Database setup (DO)** | [docs/DIGITALOCEAN_MCP.md#7-setting-up-the-database-when-mcp-apps-update-returns-405](docs/DIGITALOCEAN_MCP.md#7-setting-up-the-database-when-mcp-apps-update-returns-405) | Add App Platform PostgreSQL via the control panel when MCP apps-update returns 405 |
| **Architecture** | [ARCHITECTURE.md](ARCHITECTURE.md) | Module boundaries, backend/frontend structure |
| **Development rules** | [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) | Worktrees, design system, rendering checks, server usage |
| **DevOps & production** | [DEVOPS_README.md](DEVOPS_README.md) | Production vs dev, deploy flow, test-before-commit |

---

## By role

### New developer

1. [README.md](README.md) – clone, install, run backend + frontend.
2. [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) – create `backend/.env` and `frontend/.env`.
3. [backend/DATABASE_SETUP.md](backend/DATABASE_SETUP.md) or [backend/QUICK_START.md](backend/QUICK_START.md) – database and PostGIS.
4. [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) – design system, icons, verification.

### Deploying to production (DigitalOcean)

1. [DIGITALOCEAN_DEPLOYMENT_GUIDE.md](DIGITALOCEAN_DEPLOYMENT_GUIDE.md) – full deploy flow.
2. [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) – **App-Level** vars: **JWT_SECRET** and **DB_PASSWORD** (and where to get DB_PASSWORD).
3. [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md) – “Missing JWT_SECRET”, “Missing DB_PASSWORD”, backend URL.
4. [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) – final checks.
5. [docs/DIGITALOCEAN_MCP.md](docs/DIGITALOCEAN_MCP.md) – use the DigitalOcean MCP in Cursor to list apps, get deployment status, and fetch logs.

### Backend / API

- [backend/README.md](backend/README.md) – backend overview and scripts.
- [backend/API_IMPLEMENTATION.md](backend/API_IMPLEMENTATION.md) – API and schema details.
- [backend/DATABASE_SETUP.md](backend/DATABASE_SETUP.md) – PostgreSQL and PostGIS.
- [backend/DATABASE_SEED.md](backend/DATABASE_SEED.md) – seeding and data.
- [backend/QUICK_START.md](backend/QUICK_START.md) – minimal run instructions.

### Frontend

- [frontend/README.md](frontend/README.md) – frontend overview.
- [frontend/FRONTEND_SPECIFICATION.md](frontend/FRONTEND_SPECIFICATION.md) – component architecture.
- [frontend/src/design-system/DESIGN_SYSTEM.md](frontend/src/design-system/DESIGN_SYSTEM.md) – design tokens and components.

### Specs and change management

- [openspec/AGENTS.md](openspec/AGENTS.md) – OpenSpec and change proposals.
- [openspec/project.md](openspec/project.md) – project context and conventions.

---

## Other references

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | General deployment (Docker, etc.) |
| [DIGITALOCEAN_SETUP.md](DIGITALOCEAN_SETUP.md) | DO setup and config |
| [DIGITALOCEAN_UI_QUICK_START.md](DIGITALOCEAN_UI_QUICK_START.md) | Quick UI-oriented deploy steps |
| [DIGITALOCEAN_BUILD_FIX.md](DIGITALOCEAN_BUILD_FIX.md) | Buildpack vs Dockerfile, build issues |
| [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md) | How frontend talks to backend |
| [WORKTREE_AND_AGENTS.md](WORKTREE_AND_AGENTS.md) | Git worktrees and AI agents |
| [AGENTS.md](AGENTS.md) | AI assistant instructions (OpenSpec, production) |

---

## Quick commands

```bash
# Run app locally
cd backend && npm run dev          # API: http://localhost:3001
cd frontend && npm run dev        # UI:  http://localhost:5173

# Backend: migrate, seed, deck-area
cd backend && npm run migrate
cd backend && npm run seed
cd backend && npm run add-deck-area   # add vessels.clear_deck_area_m2
cd backend && npm run check-deck-area # CI/deploy check

# Generate JWT secret (for App-Level JWT_SECRET)
openssl rand -hex 32
```

For env vars and where to set them (local vs App-Level), use **[docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)**.
