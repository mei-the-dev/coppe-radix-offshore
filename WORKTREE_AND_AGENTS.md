# Worktrees & Agents – Mandatory Protocol

**Read this before any multi-worktree or “apply” operations.** No single file or missing worktree path may cause loss of many-file progress.

---

## Rule 1: Never use “Apply worktree to current branch”

**Do not use “Apply worktree to current branch”.** It reads from the target worktree’s filesystem. If that worktree is missing files (e.g. `.cursor/agents/ux-design.md` or `frontend/src/design-system/DESIGN_SYSTEM.md`), apply fails and can overwrite or drop work. This has caused loss of 40+ file edits.

**Use git instead.**

---

## Rule 2: Sync only via git (commit → push → pull)

Worktrees are separate directories. The only safe way to move changes between them is git:

```bash
# In the worktree where you made changes
git add -A
git commit -m "Your message"
git push origin <branch>

# In the other worktree
git fetch origin <branch>
git merge origin/<branch>   # or: git pull origin <branch>
```

Do not rely on “Apply worktree”. Do not copy individual files by hand except as a last resort.

---

## Rule 3: .cursor/ and design-system are in git

- `.cursor/agents/`, `.cursor/commands/`, and `frontend/src/design-system/` are **tracked** in this repo.
- They are **not** in `.gitignore`. Do not add them.
- Any worktree that checks out the branch gets these files from git. No “apply” step is needed.

If you add or change files under `.cursor/` or `frontend/src/design-system/`, commit them so every worktree can get them via `git pull`.

---

## Rule 4: Checkpoint often

Before large or risky operations:

```bash
git add -A && git commit -m "Checkpoint before <operation>"
```

If something goes wrong, you can revert or recover from the last commit.

---

## Quick decision tree

| Situation | Action |
|-----------|--------|
| “Apply worktree” is offered or requested | **Do not use it.** Use git commit/push/pull. |
| Adding/editing `.cursor/agents/*` or design-system | Commit in this worktree, then sync others via git pull. |
| Unsure which worktree is active | Ask. Main repo path is the workspace path; other worktrees live under `~/.cursor/worktrees/...`. |
| Already lost commits/changes | Use `git reflog`, `git fsck --lost-found`, `git stash list`. |

---

## Recovery if work was lost

```bash
git reflog --all
git fsck --lost-found
git stash list
```

Restore from the last good commit or reflog entry; do not rely on “apply” to restore.

---

## Summary

1. **Never** use “Apply worktree to current branch”.
2. **Always** move changes between worktrees with git: commit → push → pull/merge.
3. **Keep** `.cursor/` and `frontend/src/design-system/` tracked in git and committed.
4. **Checkpoint** with a commit before big or risky changes.

This file is the single source of truth for worktree and agent sync. Agents must follow it.
