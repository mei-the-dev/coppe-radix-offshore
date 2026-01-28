<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

**Worktrees & agents:** Never use "Apply worktree to current branch". Sync only via git (commit → push → pull). See **WORKTREE_AND_AGENTS.md**.

**Production & DevOps:** Main is production. The app is deployed at https://sea-lion-app-8l7y7.ondigitalocean.app/. Pushes to `main` trigger deployment. Use the **DigitalOcean MCP** (user-digitalocean-apps) for deploy readiness: apps-list, apps-get-info (AppID `a639b515-01d7-489e-bccb-074a9cf6f62a`), apps-get-deployment-status, apps-get-logs. Production spec: `app.production.yaml`. See `DEVOPS_README.md` and `docs/PRODUCTION_MAIN.md`.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->