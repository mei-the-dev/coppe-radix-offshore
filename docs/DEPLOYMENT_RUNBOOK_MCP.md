# Deployment Runbook: DigitalOcean MCP (and doctl)

This runbook describes how to perform deployment operations using the **DigitalOcean MCP server** in Cursor. The same operations can be automated with **doctl** in scripts or GitHub Actions.

**Production app:** sea-lion-app  
**App ID:** `a639b515-01d7-489e-bccb-074a9cf6f62a`

The **digitalocean-deploy** subagent (`.cursor/agents/digitalocean-deploy.md`) follows these steps when you delegate deployment tasks.

---

## 1. Resolve App ID

**MCP:** Call **apps-list** (e.g. `Page: 1`, `PerPage: 20`). Find the app by name (`sea-lion-app`). Use its `id` as **AppID** in all later calls.

**doctl:** `doctl apps list --output json` and pick the app by name, or use the known ID:

```bash
doctl apps get a639b515-01d7-489e-bccb-074a9cf6f62a
```

**Record once:** Production App ID = `a639b515-01d7-489e-bccb-074a9cf6f62a`.

---

## 2. Is production up?

**MCP:** Call **apps-get-deployment-status** with `AppID` = `a639b515-01d7-489e-bccb-074a9cf6f62a`.  
Interpret `phase` (e.g. `ACTIVE`, `BUILDING`, `ERROR`) and `health.components[*].state` (e.g. `HEALTHY`).

**doctl:**

```bash
doctl apps list-deployments a639b515-01d7-489e-bccb-074a9cf6f62a --output json
```

A helper script [scripts/do-deploy-status.sh](../scripts/do-deploy-status.sh) prints deployment status via doctl and mirrors **apps-get-deployment-status**; use it in CI or from the repo root when doctl is installed and authenticated.

---

## 3. Why did the deploy fail?

**MCP:**

1. Call **apps-get-deployment-status** with `AppID` → take `deployment.id`.
2. Call **apps-get-logs** with:
   - `AppID` = production app ID
   - `DeploymentID` = that deployment id
   - `Component` = `coppe-radix-offshore-backend` or `coppe-radix-offshore-frontend`
   - `LogType` = `BUILD` or `RUN` (or `DEPLOY`)
   - `TailLines` = 200 (optional)

**doctl:**

```bash
# List deployments to get latest deployment id
doctl apps list-deployments a639b515-01d7-489e-bccb-074a9cf6f62a --output json

# Logs (doctl syntax may vary; check doctl apps logs --help)
doctl apps logs a639b515-01d7-489e-bccb-074a9cf6f62a --type build
doctl apps logs a639b515-01d7-489e-bccb-074a9cf6f62a --type run
```

---

## 4. Change env vars or scaling (no DB change)

**MCP:**

1. Call **apps-get-info** with `AppID` to get the current spec.
2. Edit the spec (envs, `instance_count`, etc.).
3. Call **apps-update** with the **full** updated spec.

If the API returns **405**, use the [DigitalOcean control panel](https://cloud.digitalocean.com/apps) and document in [DIGITALOCEAN_MCP.md](DIGITALOCEAN_MCP.md).

**doctl:**

```bash
doctl apps update a639b515-01d7-489e-bccb-074a9cf6f62a --spec app.production.yaml
```

(Or pipe a spec from another file; see `doctl apps update --help`.)

---

## 5. Rollback

**Actions:** Revert the bad commit on `main` and push. That triggers a new deploy with the previous code.

```bash
git revert <bad-commit>
git push origin main
```

**Verify:** Use **apps-get-deployment-status** (or doctl) and **apps-get-logs** to confirm the new deployment is `ACTIVE` and healthy.

---

## 6. Create a new app from spec

**MCP:** Call **apps-create-app-from-spec** with a spec object derived from [app.yaml](../app.yaml) or a new file. The schema in the MCP tool descriptor (`apps-create-app-from-spec.json`) is the source of truth. For databases, if MCP returns 405, add the DB in the control panel and wire env vars there (see [DIGITALOCEAN_MCP.md](DIGITALOCEAN_MCP.md) § 7).

**doctl:**

```bash
doctl apps create --spec app.yaml
```

---

## 7. MCP tool ↔ doctl equivalence

| MCP tool | doctl equivalent |
|----------|------------------|
| apps-list | `doctl apps list` |
| apps-get-info | `doctl apps get <APP_ID>` |
| apps-get-deployment-status | `doctl apps list-deployments <APP_ID>`; inspect latest phase |
| apps-get-logs | `doctl apps logs <APP_ID> --type build \| run` (see doctl docs) |
| apps-update | `doctl apps update <APP_ID> --spec <file>` |
| apps-create-app-from-spec | `doctl apps create --spec <file>` |
| apps-delete | `doctl apps delete <APP_ID>` |
| region-list | `doctl apps list-regions` or account/region APIs |

Use these when running in GitHub Actions or local scripts; MCP is used from Cursor.
