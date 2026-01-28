# Populate the production database

This guide describes how to run **migrate** and **seed** against the production database so it has the same schema and data as your local environment (supply bases, installations, vessels, cargo types, distances, etc.).

---

## 1. Get production DB connection settings

Production DB credentials are provided by the **database component** in your DigitalOcean App Platform app.

1. **DigitalOcean** → **Apps** → open your app (e.g. **sea-lion-app**).
2. Open the **database** component (e.g. **db** or **prio-logistics-db**).
3. Go to **Connection details** or **Settings** and note:
   - **Host / Hostname**
   - **Port**
   - **Database name**
   - **User**
   - **Password** (you may need to reveal or reset it)

If the backend is already bound to this DB, the same values are injected via `${db.HOSTNAME}`, `${db.PORT}`, etc. You need the **actual** host, port, database, user, and password to run migrate/seed from your machine or from a one-off job.

See also: [docs/DIGITALOCEAN_MCP.md § 7 – Setting up the database](DIGITALOCEAN_MCP.md#7-setting-up-the-database-when-mcp-apps-update-returns-405) and [docs/ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).

---

## 2. Run migrate and seed from your machine

If the production DB is reachable from your network (e.g. DigitalOcean has given it a public host or you are on a trusted network):

1. **From the project root**, create a temporary env file or set variables so the backend uses the **production** DB:

   ```bash
   export DB_HOST="<production-host>"
   export DB_PORT="<production-port>"
   export DB_NAME="<production-database-name>"
   export DB_USER="<production-user>"
   export DB_PASSWORD="<production-password>"
   ```

   Use the exact values from the database component. Do not commit these.

2. **Migrate** (create schema, PostGIS, tables):

   ```bash
   cd backend
   RUN_MIGRATE_VIA_NODE=1 npm run migrate
   ```

   `RUN_MIGRATE_VIA_NODE=1` uses the Node-based migration path (no `psql` required). The script reads `references/prio_sql_schema.sql` and runs it against the DB. If `psql` is installed and you omit `RUN_MIGRATE_VIA_NODE`, the script will try `psql` first and fall back to Node if `psql` is not found.

3. **Seed** (supply bases, installations, vessels, distances, etc.):

   ```bash
   npm run seed
   ```

4. Clear the temporary env vars when done, and do not commit production credentials.

---

## 3. When the production DB is not reachable from your machine

App Platform databases are often only reachable from inside the app (private network). In that case you cannot run `migrate` or `seed` from your laptop using the DB hostname.

Options:

- **One-off Job (recommended)**  
  Add a **Job** component in the same app that:
  - Uses the same **source** and **environment** as the backend (so it gets `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` from the same DB binding).
  - Run command: e.g. `cd backend && RUN_MIGRATE_VIA_NODE=1 npm run migrate && npm run seed`.
  - Ensure the job has access to the repo (and to `references/prio_sql_schema.sql` if the migrate script is run from the backend directory with the same path resolution). If the built image only contains the backend, you may need a job that runs in a context where the schema file exists (e.g. a full repo checkout or a custom run command that has the schema baked in).

- **Console / SSH**  
  If your plan provides a console or shell that can reach the DB, run the same commands there with the same env vars the backend uses.

- **Public / trusted access**  
  If you enable public or “trusted sources” access for the managed DB, you can then use section 2 from your machine with the public host and credentials.

---

## 4. What gets populated

- **Migrate** applies `references/prio_sql_schema.sql`: PostGIS, tables (supply_bases, installations, vessels, cargo types, distance_matrix, etc.). “Already exists” and other ignorable messages are skipped.
- **Seed** (see [backend/DATABASE_SEED.md](../backend/DATABASE_SEED.md)) inserts the same operational data you use locally: Porto do Açu supply base, FPSO/installations, vessels, compartments, cargo types, distances, costs, and related lookup data.

**Existing databases:** If the production DB already has supply base `macaé`, run the one-off migration once before or after seed: `scripts/migrate-supply-base-to-porto-acu.sql` (e.g. `psql ... -f scripts/migrate-supply-base-to-porto-acu.sql`). This updates the supply base to Porto do Açu and all related FKs.

After a successful migrate + seed, the production API (e.g. `/fleet/vessels`, `/cargo/orders`, `/installations`, `/supply-bases`) will return the same kind of data as locally, and the simulation map should show installations and data instead of “No valid data points”.

---

## 5. Quick reference

| Step | Command |
|------|--------|
| Migrate (Node, no psql) | `cd backend && RUN_MIGRATE_VIA_NODE=1 npm run migrate` |
| Seed | `cd backend && npm run seed` |
| Both (with prod env set) | `cd backend && RUN_MIGRATE_VIA_NODE=1 npm run migrate && npm run seed` |

Related docs: [backend/DATABASE_SETUP.md](../backend/DATABASE_SETUP.md), [backend/DATABASE_SEED.md](../backend/DATABASE_SEED.md), [docs/DIGITALOCEAN_MCP.md](DIGITALOCEAN_MCP.md), [docs/ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).
