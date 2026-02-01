# DigitalOcean App Platform: Deployment Best Practices

This doc summarizes deployment best practices for the Offshore Logistics App on DigitalOcean App Platform. Production is **sea-lion-app** (App ID `a639b515-01d7-489e-bccb-074a9cf6f62a`).

---

## 1. Spec-as-code

- **Source of truth:** [app.production.yaml](../app.production.yaml) reflects the live production spec. Keep it in sync with what the DigitalOcean MCP **apps-get-info** returns for that app.
- **Sync workflow:** When you change the app in the control panel (env vars, scaling, routes), update `app.production.yaml` in the repo so the file stays authoritative. Use MCP **apps-get-info** to see the current spec, then edit the YAML and commit.
- **DB and some spec changes:** The MCP **apps-update** tool has returned **405** when adding or changing databases. For DB setup and certain spec edits, use the [DigitalOcean control panel](https://cloud.digitalocean.com/apps) and document the change in this repo (e.g. in [DIGITALOCEAN_MCP.md](DIGITALOCEAN_MCP.md) § 7).

---

## 2. Health checks

- **Backend:** Exposes `/health`. Ensure the App Platform spec sets a health check (e.g. `health_check.http_path: /health` or equivalent). The live app uses component health; the backend’s `/health` is the right endpoint for DO to probe.
- **Frontend:** App Platform uses HTTP serving as health by default. No extra health endpoint is required unless you add one for custom checks.

---

## 3. Secrets and environment variables

- **Never commit production secrets.** No JWT secrets, DB passwords, or API keys in the repo.
- **Use component refs:** Prefer `${db.PASSWORD}`, `${db.HOSTNAME}`, etc. so DigitalOcean injects values at runtime. Set these in the app’s env vars (or app-level envs) in the control panel or in the spec when using MCP/API.
- **Managed DB over SSL:** When connecting to a DigitalOcean managed DB from the app or from your machine, you may need `DB_SSL_REJECT_UNAUTHORIZED=false` if the certificate chain causes Node to fail. Set it in the app’s env vars when required; document it in [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) or [POPULATE_PRODUCTION_DB.md](POPULATE_PRODUCTION_DB.md).

---

## 4. Alerts

- Keep **DEPLOYMENT_FAILED** and **DOMAIN_FAILED** in the app spec (as in [app.production.yaml](../app.production.yaml)). They notify you when a deploy or domain configuration fails.
- To add or tune alerts when MCP **apps-update** is unavailable or returns 405, use the DigitalOcean control panel: **Apps → your app → Settings → Alerts**.

---

## 5. Regions and resources

- **Region:** Production uses `atl` (Atlanta). Chosen in the app spec; change only when you have a reason (latency, compliance).
- **Instance sizes:** Recorded in [app.production.yaml](../app.production.yaml) (e.g. `apps-s-1vcpu-1gb`). Use MCP **region-list** when evaluating regions; resize via control panel or **apps-update** when the API accepts it.

---

## 6. MCP runbook and operations

- **Status, logs, rollback:** Use the DigitalOcean MCP server for deployment status, build/run logs, and troubleshooting. The step-by-step runbook is [DEPLOYMENT_RUNBOOK_MCP.md](DEPLOYMENT_RUNBOOK_MCP.md).
- **Subagent:** The **digitalocean-deploy** Cursor subagent (`.cursor/agents/digitalocean-deploy.md`) uses the same MCP tools. Invoke it for “is production up?”, “why did deploy fail?”, or “show backend logs.”
- **Automation outside Cursor:** In GitHub Actions or local scripts, use **doctl** (or the DigitalOcean API) for the same operations; see the runbook’s “MCP tool ↔ doctl” table. A helper script [scripts/do-deploy-status.sh](../scripts/do-deploy-status.sh) prints deployment status via doctl and mirrors **apps-get-deployment-status**.

---

## 7. Related docs

| Doc | Purpose |
|-----|---------|
| [DEPLOYMENT_RUNBOOK_MCP.md](DEPLOYMENT_RUNBOOK_MCP.md) | MCP (and doctl) steps for status, logs, rollback, create-from-spec |
| [DIGITALOCEAN_MCP.md](DIGITALOCEAN_MCP.md) | MCP setup, tools, DB setup when apps-update returns 405 |
| [DEVOPS_README.md](../DEVOPS_README.md) | Production vs development, push = deploy, CI workflow |
| [app.production.yaml](../app.production.yaml) | Production app spec (source of truth) |
