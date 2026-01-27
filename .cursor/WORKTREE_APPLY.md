# Apply worktree: root cause and how to fix

## Root cause of "Failed to apply worktree to current branch"

**"Apply worktree to current branch" reads files from the target worktree path**, not from the workspace you're editing. For example, if the target worktree is `yvg`, it reads from:

`/home/mei/.cursor/worktrees/offshore-logistics-app/yvg/`

If a file exists only in another workspace (e.g. `/run/media/mei/neo/offshore-logistics-app/`) and **not** in that path, the apply step fails with:

> Unable to read file '…/yvg/.cursor/agents/ux-design.md' (Error: Unable to resolve nonexistent file …)

So the conflict is: **the apply step assumes certain paths exist in the target worktree; those paths were only created or changed in the main workspace.**

---

## Correctly implementing agent file changes

When you add or change files that "apply worktree" might read, they must **also exist (and be up to date) in the target worktree**.

### 1. Agent files (`.cursor/agents/*`)

- **Keep in sync:** For worktree `yvg`, ensure every file in `.cursor/agents/` exists under  
  `yvg/.cursor/agents/` with the same content.
- **What to sync:**  
  - `devops-production-workflow.md`  
  - `logistics-visualization.md`  
  - `ux-design.md`  
  - Any new agent you add.

### 2. Design-system and other Cursor-specific paths

- If apply ever reads from `frontend/src/design-system/` or similar, those paths must exist in the target worktree too (e.g. `yvg/frontend/src/design-system/glass.css`, `DESIGN_SYSTEM.md`, etc.).

### 3. Two ways to keep things in sync

**Option A – Manual/script sync**  
When you add or edit `.cursor/agents/*` (or design-system files that apply uses), copy or rsync them into the target worktree, e.g.:

```bash
# Example: sync agents into yvg worktree
SRC="/run/media/mei/neo/offshore-logistics-app"
YVG="/home/mei/.cursor/worktrees/offshore-logistics-app/yvg"
cp -r "$SRC/.cursor/agents/"* "$YVG/.cursor/agents/"
```

**Option B – Git workflow**  
Commit agent (and design-system) changes on a branch that the target worktree uses, then update that worktree from that branch. Both worktrees then see the same files without manual copy.

---

## Quick reference

| Item        | Main workspace (example)     | Yvg worktree (apply reads from here)   |
|------------|--------------------------------|-----------------------------------------|
| Agents      | `.cursor/agents/*.md`          | `yvg/.cursor/agents/*.md` must match   |
| Design sys | `frontend/src/design-system/` | `yvg/frontend/src/design-system/`       |

If you see "Unable to read file …/yvg/…" during apply, add or update that path under the yvg worktree (or sync the containing directory), then run apply again.
