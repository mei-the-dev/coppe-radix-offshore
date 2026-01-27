# DevOps: Production vs Development

This app is **deployed to production**. Every push to `main` triggers a new build and deploy on DigitalOcean. This doc explains how to work safely with production and development, and how AI agents should treat the repo.

**Production URL:** https://sea-lion-app-8l7y7.ondigitalocean.app/

---

## For You (Human): First Deployed App

### Main idea

- **Development** = your machine, `npm run dev`, localhost, local or dev DB.
- **Production** = live app on DigitalOcean. Users use it.
- **Push to `main`** = deploy. No separate “deploy” button; git push is the trigger.

So: only push to `main` when the code is tested and you are okay with it going live.

### Safe daily workflow

1. **Work on a branch**
   ```bash
   git checkout -b your-feature-or-fix
   ```

2. **Run tests before committing**
   ```bash
   cd backend && npm test
   cd ../frontend && npm test
   ```
   Optionally for UI changes: `cd frontend && npm run test:visual`

3. **Commit and merge only when tests pass**
   - Merge into `main` (or push `main`) only when you want that exact code in production.

4. **After pushing `main`**
   - Check the [DigitalOcean dashboard](https://cloud.digitalocean.com/apps) or the production URL to confirm the new build succeeded and the app works.

### If something breaks in production

- **Revert:** `git revert <bad-commit> && git push origin main` → new deploy with previous code.
- **Or fix forward:** fix on a branch, test, then merge to `main` and push.

### Where config and secrets live

- **Production:** DigitalOcean App Platform → your app → each component (backend, frontend) → **Environment Variables**. Do not put production secrets in the repo.
- **Local:** `backend/.env`, `frontend/.env` (both gitignored). Use `*.env.example` as templates.

### Using DigitalOcean from Cursor (MCP)

You can let Cursor talk to DigitalOcean (list apps, check deployments, app status) via the [DigitalOcean MCP](https://github.com/digitalocean-labs/mcp-digitalocean/). Add the **apps** remote server and your API token in Cursor’s MCP config (`~/.cursor/config.json`). The **devops-production-workflow** subagent is instructed to use these MCP tools when they’re available instead of only saying “check the dashboard.”

### More detail

- **Deployment / troubleshooting:** [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)
- **DigitalOcean setup:** [DIGITALOCEAN_DEPLOYMENT_GUIDE.md](./DIGITALOCEAN_DEPLOYMENT_GUIDE.md)
- **Full DevOps + AI instructions (including MCP):** use the **devops-production-workflow** subagent (`.cursor/agents/devops-production-workflow.md`)

---

## For AI Agents

When editing this repo, assume:

- **`main` = production.** Pushes to `main` deploy.
- **Test before commit:** run `backend` and `frontend` tests before proposing or applying commits that could affect runtime.
- **No production secrets in repo.** Use env vars and existing client logic; document in `.env.example` or deployment docs.

For full rules, triggers, and checklist, see **`.cursor/agents/devops-production-workflow.md`** (subagent **devops-production-workflow**). Use it proactively when changes might affect production, deployment, or test-before-commit workflow.

---

## Quick reference

| What | Where / Command |
|------|------------------|
| Production app | https://sea-lion-app-8l7y7.ondigitalocean.app/ |
| Backend tests | `cd backend && npm test` |
| Frontend tests | `cd frontend && npm test` |
| Frontend e2e/visual | `cd frontend && npm run test:visual` |
| “Push = deploy” | Push to `main` on `mei-the-dev/coppe-radix-offshore` |
| Pre-push checklist | See `.cursor/agents/devops-production-workflow.md` |
