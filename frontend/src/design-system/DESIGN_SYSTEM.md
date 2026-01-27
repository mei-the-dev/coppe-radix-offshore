# Offshore Logistics App – Design System

This folder is the **in-repo design system** for the Offshore Logistics App. All assets live in this project; **no external design-system package is used**.

## Location

- **Path:** `frontend/src/design-system/`
- **Entry:** `index.ts` (re-exports tokens, CSS, utilities)

## Contents

| File / folder | Purpose |
|---------------|---------|
| `tokens.css` | CSS custom properties (colors, spacing, radius, shadows, etc.) |
| `themes.css` | Light/dark/high-contrast theme variables |
| `glass.css` | Glassmorphism utilities (`.glass`, `.glass-card`, `.glass-nav`, `.glass-panel`, `.glass-surface`) and tokens for `--bg-canvas`, `--glass-bg`, etc. |
| `tokens/` | Token source (reference, semantic, components, motion, legacy); used to generate or document `tokens.css` |
| `animations/` | Animation presets and helpers |
| `components/interfaces.ts` | Shared TypeScript interfaces for components |

## Usage

- **CSS:** Import once in app entry (e.g. `main.tsx`: `import './design-system'`). That pulls in `tokens.css`, `themes.css`, and `glass.css`.
- **Tokens in code:** `import { tokens } from './design-system'` or `from './design-system/tokens'`.
- **Components:** Use `var(--color-primary-500)`, `var(--spacing-4)`, `var(--glass-bg)`, etc. in your CSS.

## Glassmorphism

Glass styles rely on tokens defined in `tokens.css` (`--glass-bg`, `--glass-border`, `--glass-shadow`, `--glass-radius`, `--bg-canvas`, etc.). Use them from `glass.css` or in component CSS. See `references/glass/glassmorphism-instructions.md` for patterns.

## No external dependency

The design system is part of this repo. Do not add an npm dependency for tokens or themes; keep everything under `frontend/src/design-system/`.

## Worktrees

If a worktree reports a missing `glass.css`, that worktree’s branch likely doesn’t include it yet. Merge or rebase from the branch that adds `frontend/src/design-system/glass.css` (and the rest of the design-system) so every worktree has the same in-repo files.
