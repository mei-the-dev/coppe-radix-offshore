# DigitalOcean MCP Server – Setup & Use

This project can use the **DigitalOcean MCP (Model Context Protocol) server** so Cursor (and AI assistants) can interact with your App Platform apps: list apps, check deployment status, fetch logs, and trigger deploys without leaving the editor.

---

## 1. Packages and status

- **Original repo:** [digitalocean/digitalocean-mcp](https://github.com/digitalocean/digitalocean-mcp) — **archived**. The README points to **[@digitalocean-labs/mcp-digitalocean](https://github.com/digitalocean-labs/mcp-digitalocean)**.
- **Official docs:** [Use the DigitalOcean MCP Server](https://docs.digitalocean.com/products/app-platform/how-to/use-mcp/).
- **Cursor:** If you see a server named **"user-digitalocean-apps"** or **"digitalocean-apps"** in Cursor’s MCP settings, that’s the DigitalOcean Apps MCP. If it shows an error, the config or token is usually the cause.

---

## 2. Configuring the MCP in Cursor

### 2.1 Create a DigitalOcean API token

1. Open [DigitalOcean API](https://cloud.digitalocean.com/account/api/tokens).
2. Create a **Personal Access Token**.
3. Give it **App Platform** (read/write) scope.
4. Copy the token and keep it secret (e.g. in a password manager). Do **not** commit it.

### 2.2 Add the server in Cursor

1. **Cursor → Settings → Cursor Settings → MCP → Add a new global MCP server** (or edit the existing one).
2. Cursor opens `~/.cursor/mcp.json` (or your project MCP config).
3. Add or merge this (replace `YOUR_DO_TOKEN` with your token):

```json
{
  "mcpServers": {
    "digitalocean": {
      "command": "npx",
      "args": ["-y", "@digitalocean/mcp", "--services", "apps"],
      "env": {
        "DIGITALOCEAN_API_TOKEN": "YOUR_DO_TOKEN"
      }
    }
  }
}
```

If you use the **archived** package:

```json
"args": ["@digitalocean/mcp"]
```

If you use **@digitalocean-labs/mcp-digitalocean** or a package that supports services:

```json
"args": ["-y", "@digitalocean/mcp", "--services", "apps"]
```

4. Save the file.
5. In **Cursor → Settings → MCP**, confirm the DigitalOcean server is listed and not in error. Restart Cursor if needed.

**Security:** Prefer an env var for the token instead of putting it in the JSON, if your setup supports it (e.g. `"env": { "DIGITALOCEAN_API_TOKEN": "${DO_API_TOKEN}" }` and set `DO_API_TOKEN` in your shell/profile).

---

## 3. Tools available (this project’s MCP)

When the server is healthy, these tools are available. Tool schemas live under your Cursor MCP config (e.g. `user-digitalocean-apps/tools/`). **Always read the tool schema (e.g. the `.json` descriptor) before calling a tool** so you use the right parameters.

| Tool | Purpose |
|------|---------|
| **apps-list** | List all App Platform apps. Optional: `Page`, `PerPage`. Use this to find your app and its **App ID**. |
| **apps-get-info** | Full details for one app. **Required:** `AppID` (from apps-list). |
| **apps-get-deployment-status** | Active deployment and health for an app. **Required:** `AppID`. |
| **apps-get-logs** | Logs for a given app/deploy/component. **Required:** `AppID`, `DeploymentID`, `Component`, `LogType` (`BUILD` \| `RUN` \| `DEPLOY` \| `RUN_RESTARTED`). Optional: `TailLines`, `Follow`. |
| **apps-update** | Update app spec (env vars, scaling, etc.). Uses app ID and updated spec. |
| **apps-create-app-from-spec** | Create a new app from an app spec (e.g. from `app.yaml`). |
| **apps-delete** | Delete an app. **Required:** `AppID`. |
| **region-list** | List regions (e.g. for create-app or docs). |

---

## 4. How the AI uses this for *offshore-logistics-app*

1. **Resolve App ID**
   - Call **apps-list** (e.g. `Page: 1`, `PerPage: 20`).
   - Find the app whose name matches `offshore-logistics-app` (or your actual app name).
   - From that object, take `id` (or the field the API returns as the app id) and use it as **AppID** everywhere below.

2. **Deployment status**
   - Call **apps-get-deployment-status** with `AppID`.
   - Use the result to see if the latest deploy is running, failed, or building, and basic health.

3. **Logs (e.g. “why did deploy fail?”)**
   - Call **apps-get-deployment-status** → get the **active deployment id**.
   - Call **apps-get-logs** with:
     - `AppID`
     - `DeploymentID` = that deployment id
     - `Component` = `"backend"` or `"frontend"` (whatever you want to inspect)
     - `LogType` = `"BUILD"` or `"RUN"` or `"DEPLOY"` as needed
   - Use `TailLines` (e.g. 200) if you want more context.

4. **Env / spec changes**
   - Use **apps-get-info** to get the current spec.
   - Use **apps-update** with the same spec plus your changes (e.g. new env vars). **Note:** In this project **apps-update** has returned 405 when adding a database; use the [control panel](#7-setting-up-the-database-when-mcp-apps-update-returns-405) for DB setup. Do not rely on “partial” updates unless the tool contract says so; pass a full spec when the schema requires it.

5. **Creating an app**
   - Use **apps-create-app-from-spec** with a spec object derived from your `app.yaml` (and optionally **region-list** to choose a region). The schema is large; the tool descriptor in `apps-create-app-from-spec.json` is the source of truth.

---

## 5. Quick reference: calling tools

- **Server name** in `call_mcp_tool`: use the server id from your MCP config (e.g. `user-digitalocean-apps` or `digitalocean`). Check Cursor’s MCP list or the `SERVER_METADATA.json` / tool folder name under your MCP config.
- **Arguments:** always match the tool’s schema (e.g. `AppID`, `DeploymentID`, `Component`, `LogType` for **apps-get-logs**). Names and types must match exactly.

---

## 6. If the MCP server shows an error

- **Cursor:** Settings → MCP → find the DigitalOcean server. If it’s red or “errored”:
  - Confirm `DIGITALOCEAN_API_TOKEN` is set and valid.
  - Confirm the package in `args` is installed (e.g. `npx -y @digitalocean/mcp` will fetch it).
  - Try running the same `command` + `args` in a terminal with `DIGITALOCEAN_API_TOKEN` set; see if it exits with a clear error.
- **Docs:** [DigitalOcean: Configure Remote MCP](https://docs.digitalocean.com/reference/mcp/configure-mcp/) and [Use the DigitalOcean MCP Server](https://docs.digitalocean.com/products/app-platform/how-to/use-mcp/).

---

## 7. Setting up the database (when MCP apps-update returns 405)

The MCP **apps-update** tool has returned **405 Method Not Allowed** when adding an App Platform database or changing the app spec in this project. To set up the database, use the **DigitalOcean control panel**:

1. **DigitalOcean** → **Apps** → open your app (e.g. **sea-lion-app**).
2. **Settings** → **Components** → **Add Component** → **Database**.
3. Create a **PostgreSQL** database:
   - **Name:** `prio-logistics-db` (lowercase, unique in the app).
   - **Engine:** PostgreSQL **15**.
   - **Production:** Off for a **dev** database (DO provisions a new cluster); or use an existing **Managed Database** cluster name for production.
   - **Database name:** `prio_logistics`
   - **Database user:** `prio_user`
4. **Save** the database component.
5. **Wire the backend** to the database:
   - Open the **backend** component (e.g. **coppe-radix-offshore-backend**) → **Settings** → **App-Level Environment Variables** (or the backend’s env vars).
   - Set (or change) these to **reference the database component** so DO injects the real values at runtime:
     - `DB_HOST` = `${prio-logistics-db.HOSTNAME}`
     - `DB_PORT` = `${prio-logistics-db.PORT}`
     - `DB_NAME` = `${prio-logistics-db.DATABASE}`
     - `DB_USER` = `${prio-logistics-db.USERNAME}`
     - `DB_PASSWORD` = `${prio-logistics-db.PASSWORD}` (mark as **Secret**)
   - In the UI you often pick “Bind to database” / “Link database” and then choose `prio-logistics-db`; the platform fills these for you.
6. **Redeploy** the app so the backend starts with the new DB connection.

DB credentials and host/port come from the database component; see [docs/ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for where to find `DB_PASSWORD` and other vars.

---

## 8. Links

- [DigitalOcean MCP Server (archived)](https://github.com/digitalocean/digitalocean-mcp) — superseded by `@digitalocean-labs/mcp-digitalocean`.
- [Use the DigitalOcean MCP Server](https://docs.digitalocean.com/products/app-platform/how-to/use-mcp/).
- [Configure Remote MCP](https://docs.digitalocean.com/reference/mcp/configure-mcp/).
- This project’s deployment and env docs: [DOCUMENTATION.md](../DOCUMENTATION.md), [docs/ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md), [DEPLOYMENT_TROUBLESHOOTING.md](../DEPLOYMENT_TROUBLESHOOTING.md).
