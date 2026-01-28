# Main = Production (Deploy-Ready)

**Everything on `main` is production.** Pushes to `main` deploy to **sea-lion-app** on DigitalOcean. Use the DigitalOcean MCP server to inspect and validate deploys.

---

## Production at a glance

| Item | Value |
|------|--------|
| **App name** | sea-lion-app |
| **App ID** (DO MCP) | `a639b515-01d7-489e-bccb-074a9cf6f62a` |
| **Production URL** | https://sea-lion-app-8l7y7.ondigitalocean.app/ |
| **Backend base** | https://sea-lion-app-8l7y7.ondigitalocean.app/coppe-radix-offshore-backend |
| **Branch** | `main` on `mei-the-dev/coppe-radix-offshore` |
| **Deploy trigger** | Push to `main` → deploy_on_push |

---

## Using DigitalOcean MCP for deploy readiness

The **user-digitalocean-apps** MCP server has the live state. Use it to make changes deploy-ready.

| Tool | Use |
|------|-----|
| **apps-list** | Confirm app exists; get App ID |
| **apps-get-info** | Full spec (services, DB, envs, ingress) for `AppID: a639b515-01d7-489e-bccb-074a9cf6f62a` |
| **apps-get-deployment-status** | Active deployment, health, phase, last commit |
| **apps-get-logs** | BUILD / RUN / DEPLOY logs for a component |
| **apps-update** | Change spec (use full spec from apps-get-info when required) |

Always read the tool schema (MCP descriptor) before calling. App ID is **a639b515-01d7-489e-bccb-074a9cf6f62a**.

---

## Production spec in repo

**[app.production.yaml](../app.production.yaml)** is the production app spec derived from the live app (via MCP apps-get-info). It documents:

- **Services:** coppe-radix-offshore-frontend, coppe-radix-offshore-backend (Dockerfiles, `main`, deploy_on_push)
- **Database:** `db` (PostgreSQL 17)
- **Ingress:** `/` → frontend; `/coppe-radix-offshore-backend` → backend
- **App-level envs:** DB_*, JWT_SECRET, PORT, VITE_API_URL, AUTH_DEMO_* (set in DO; do not commit secrets)

`app.yaml` in the repo may describe a different (e.g. buildpack) setup; **production** is defined by **app.production.yaml** and by what’s live in DO.

---

## Deploy-ready checklist

Before treating work as production-ready:

1. **Branch:** Work on a branch; merge to `main` only when ready to go live.
2. **Tests:** Run `cd backend && npm test` and `cd frontend && npm test` (and any e2e/visual you use).
3. **Build:** `cd backend && npm run build` and `cd frontend && npm run build` succeed.
4. **MCP:** Use **apps-get-deployment-status** after push to confirm build/deploy and phase ACTIVE.
5. **Logs:** Use **apps-get-logs** (RUN, component = coppe-radix-offshore-backend or frontend) if something fails.

---

## See also

- [DEVOPS_README.md](../DEVOPS_README.md) – Production vs dev, test-before-commit
- [docs/DIGITALOCEAN_MCP.md](DIGITALOCEAN_MCP.md) – MCP setup and tools
- [docs/POPULATE_PRODUCTION_DB.md](POPULATE_PRODUCTION_DB.md) – Migrate + seed production DB
