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
| `sea-canvas.css` | Sea-themed animated background (gradient drift, radial pulse, wave band) for `.app-layout.sea-canvas`; uses `--sea-pulse-from`, `--sea-pulse-mid`, `--sea-wave-mid`; respects `prefers-reduced-motion` |
| `tokens/` | Token source (reference, semantic, components, motion, legacy); used to generate or document `tokens.css` |
| `animations/` | Animation presets and helpers |
| `components/interfaces.ts` | Shared TypeScript interfaces for components |

## Usage

- **CSS:** Import once in app entry (e.g. `main.tsx`: `import './design-system'`). That pulls in `tokens.css`, `themes.css`, and `glass.css`.
- **Tokens in code:** `import { tokens } from './design-system'` or `from './design-system/tokens'`.
- **Components:** Use `var(--color-primary-500)`, `var(--spacing-4)`, `var(--glass-bg)`, etc. in your CSS.

## Glassmorphism

Glass styles rely on tokens defined in `tokens.css` (`--glass-bg`, `--glass-border`, `--glass-shadow`, `--glass-radius`, `--bg-canvas`, etc.). Use them from `glass.css` or in component CSS. See `references/glass/glassmorphism-instructions.md` for patterns.

**Text on glass:** Use `--text-on-glass`, `--text-on-glass-muted`, `--text-on-glass-subtle`, `--text-on-glass-strong` for light text over the sea canvas. Classes: `.text-on-glass`, `.text-on-glass-secondary`, `.text-on-glass-subtle`.

**Liquid glass (readable content):** Use `--glass-content-bg` and `--glass-content-border` for panels that contain lots of dark text (e.g. /model, /data, /metrics, forms). Class: `.liquid-glass`. Keeps color harmony and WCAG contrast.

## Sea-themed background (UX)

The app layout can use an animated sea canvas: add `sea-canvas` to the layout root (`className="app-layout sea-canvas"`). `sea-canvas.css` provides:

- **Gradient drift** – slow shift of primary/secondary sea colors (`--color-primary-700`, `--color-secondary-600`, `--color-primary-800`) so the background feels like moving water.
- **Radial pulse** – subtle “light from below” overlay for depth.
- **Wave band** – very soft horizon-style band for a calm offshore look.

Animations respect `prefers-reduced-motion: reduce`. The sea canvas sits behind glass UI; keep it subtle so glassmorphism stays readable.

## UX color choices (sea / offshore)

Tokens are tuned for **offshore logistics** and **state-of-the-art UX**:

- **Primary (navy)** – `--color-primary-*`: deep sea, authority, trust. Use for headers, primary actions, key data.
- **Secondary (teal)** – `--color-secondary-*`: water, flow, logistics. Use for accents, links, secondary actions, progress.
- **Semantic** – `--color-success`, `--color-warning`, `--color-error`, `--color-info`: WCAG-aligned; use for status, alerts, feedback.
- **Glass** – `--glass-bg`, `--glass-border`, `--text-on-glass`: light-on-dark over the sea canvas for headers/nav; dark text on `--glass-panel-bg` in the main content area for readability.

## No external dependency

The design system is part of this repo. Do not add an npm dependency for tokens or themes; keep everything under `frontend/src/design-system/`.

## Worktrees

If a worktree reports a missing `glass.css`, that worktree’s branch likely doesn’t include it yet. Merge or rebase from the branch that adds `frontend/src/design-system/glass.css` (and the rest of the design-system) so every worktree has the same in-repo files.
