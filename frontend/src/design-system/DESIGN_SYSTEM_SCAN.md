# Design System Scan – Webapp Components

Scan date: 2025-01. All component CSS and key app CSS checked for use of design tokens (`var(--*)`) vs hardcoded values.

## Summary

| Category | Uses tokens | Needs cleanup | Notes |
|----------|-------------|---------------|--------|
| **App entry** | ✅ main.tsx imports design-system | — | Tokens/themes/glass loaded globally |
| **Routes** | ✅ AppLayout.css | — | Uses `var(--bg-canvas)`, `var(--glass-*)`, `var(--text-on-glass)`, `var(--glass-panel-bg)`; sea-canvas animation on `.app-layout.sea-canvas` |
| **Pages** | ✅ LoginPage.css | — | Uses `var(--bg-primary)`, `var(--spacing-*)`, `var(--text-primary)`, etc. |
| **Atoms** | ✅ All 5 | — | Badge, Button, Input, Label, SkipLink use tokens |
| **Action** | ✅ All 4 | — | Button, IconButton, Input, SplitButton use tokens |
| **Display** | ✅ All 4 | ⚠️ Card | Card had wrong fallbacks `#a5925b` → fixed to use design-system colors |
| **Molecules** | ✅ All 4 | — | Card, TabButton, Tabs use tokens |
| **Navigation** | ✅ TabButton, Tabs | — | — |
| **Layout** | ✅ Stack, Grid | — | — |
| **Feedback** | ✅ All 6 | — | Alert, Modal, Skeleton, Toast, Tooltip use tokens |
| **Templates** | ✅ Dashboard | — | Uses `var(--surface-default)`, `var(--border-*)`, etc. |
| **Organisms** | ✅ All 12 | ⚠️ Visualization | Most use tokens/glass; Visualization had many hardcoded colors → aligned with tokens |

## Token Usage Conventions

Components should:

1. **Colors** – Use `var(--color-*)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--surface-default)`, `var(--border-default)`, `var(--glass-bg)`, etc., not raw hex/rgb.
2. **Spacing** – Use `var(--spacing-*)` (e.g. `--spacing-2`, `--spacing-4`), not raw `px`/`rem` for layout.
3. **Typography** – Use `var(--font-size-*)`, `var(--font-weight-*)`, `var(--font-family-mono)`, etc.
4. **Radius / shadow** – Use `var(--radius-*)`, `var(--shadow-*)`, `var(--glass-radius)`, `var(--glass-shadow)`.
5. **Motion** – Use `var(--duration-fast)`, `var(--timing-ease)` for transitions.

Semantic tokens (`--text-primary`, `--surface-default`, `--border-default`) come from `themes.css` and respect light/dark/high-contrast.

## Files Updated in This Scan

- **display/Card/Card.css** – Replaced incorrect fallbacks `#a5925b` with design-system whites/grays; padding variants use `var(--spacing-*)` where applicable; removed gold comment.
- **organisms/Visualization.css** – Map ocean gradient uses `var(--color-primary-*)` / `var(--color-secondary-*)`; pin/waypoint/legend and UI panels use design tokens instead of hardcoded hex/rgba where possible.

## Components With No Design-System Gaps

These use tokens consistently (no changes made):

- action/Button, IconButton, Input, SplitButton  
- atoms/Badge, Button, Input, Label, SkipLink  
- display/Badge, BerthCard, VesselCard  
- molecules/Card, TabButton, Tabs  
- navigation/TabButton, Tabs  
- layout/Stack, Grid  
- feedback/Alert, Modal, Skeleton, Toast, Tooltip  
- templates/Dashboard  
- organisms/BerthStatus, CreateLoadingPlan, DataStructure, LoadingPlanTimeline, MetricsReport, Simulation, SimulationModel, Tooltip, VesselList, VirtualBerthList, VirtualVesselList  
- routes/AppLayout.css, pages/LoginPage.css  

## UX color choices (sea / offshore)

Tokens follow a **sea-themed**, **state-of-the-art** UX palette:

- **Primary (navy)** – trust, depth; use for headers, primary actions.
- **Secondary (teal)** – flow, logistics; use for accents, links, progress.
- **Semantic** – success/warning/error/info kept WCAG-aligned for status and alerts.
- **Text on glass** – `--text-on-glass`, `--text-on-glass-muted`, etc. for light text over the sea canvas; `--glass-panel-bg` for the main content panel.

## Sea canvas animation

`sea-canvas.css` adds a sea-themed animated background when `.app-layout.sea-canvas` is used: gradient drift, radial pulse, and a soft wave band. Respects `prefers-reduced-motion`. See `DESIGN_SYSTEM.md` for details.

## Token standardization (completed)

- **Visualization.css** – Map surface, waypoint, legend, toggle, filter, analytics use `var(--surface-*)`, `var(--border-*)`, `var(--shadow-drop-sm)`, `var(--text-shadow-on-dark)`, `var(--focus-ring-glow-primary)`; no hex fallbacks.
- **MetricsReport.css** – Status and code blocks use `var(--color-*-light)`, `var(--color-gray-*)`; info-box uses `var(--color-info-light)`.
- **DataStructure.css** – Table header/content/list use `var(--glass-bg)`; primary color uses tokens.
- **Card (display & molecules)** – Default/elevated/muted use `var(--shadow-base)`, `var(--shadow-md)`, `var(--spacing-*)`, `var(--focus-ring-color)`; no gold/hex fallbacks.
- **Simulation.css** – Uses `var(--shadow-sm)`, `var(--shadow-md)`, `var(--border-default)`, `var(--color-surface-interactive)`.
- **themes.css** – `--status-success-bg` etc. use `var(--color-*-light)`; `--border-hover`, `--surface-hover` added for light/dark.
- **sea-canvas.css** – Overlays use `var(--sea-pulse-from)`, `var(--sea-pulse-mid)`, `var(--sea-wave-mid)` from tokens.css.

## Optional Follow-ups

- **MetricsReport.css** – Any remaining `var(--color-*, #hex)` fallbacks can be trimmed to tokens-only where themes provide values.
- **Button/Input/TabButton** – Fallbacks like `var(--color-primary-700, #334e68)` are safe; consider removing hex when all themes define the var.
