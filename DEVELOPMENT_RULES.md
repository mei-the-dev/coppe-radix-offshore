# Development Rules

## Production & Deployment (push = deploy)

This app is **deployed to production** at https://sea-lion-app-8l7y7.ondigitalocean.app/. **Every push to `main` triggers a new deployment.**

- **Run tests before pushing to `main`:** `cd backend && npm test` and `cd frontend && npm test`.
- **Do not put production secrets in the repo.** Use DigitalOcean App Platform env vars and local `.env` (gitignored).
- **Full instructions:** See [DEVOPS_README.md](./DEVOPS_README.md) and the **devops-production-workflow** subagent (`.cursor/agents/devops-production-workflow.md`).

## Rendering Verification Rule

**ALWAYS verify frontend rendering before completing tasks**

### Checklist Before Finishing Frontend Work:
1. ✅ Build the frontend: `cd frontend && npm run build`
2. ✅ Check for TypeScript/compilation errors (must be 0 errors)
3. ✅ Verify the app loads in browser (check console for runtime errors)
4. ✅ Test key user interactions
5. ✅ Verify API connectivity (backend must be running)

### If Rendering Fails:
- Fix all TypeScript errors first
- Check browser console for runtime errors
- Verify all imports are correct
- Ensure design system CSS is imported
- Do NOT mark tasks complete until rendering works

## Server Execution Rule

**ALWAYS run frontend and backend dev servers in background mode**

- Use `is_background: true` when starting servers
- Never block the console with interactive processes
- Example: `npm run dev` should always run in background

## Design System Integration

**Use Kira Design System from @/run/media/mei/neo/kira-design-system**

### Importing Tokens:
```typescript
import { tokens } from '../design-system';
// Use CSS variables: var(--color-primary-500), var(--spacing-4)
```

### Using Component Interfaces:
```typescript
import type { ButtonProps } from '../../../../kira-design-system/components/interfaces';
```

### CSS Variables Available:
- Colors: `var(--color-primary-500)`, `var(--color-success)`, etc.
- Spacing: `var(--spacing-4)`, `var(--spacing-8)`, etc.
- Typography: `var(--font-size-base)`, `var(--font-family-sans)`, etc.
- Shadows: `var(--shadow-md)`, `var(--shadow-lg)`, etc.
- Border Radius: `var(--radius-md)`, `var(--radius-lg)`, etc.

## Icons Rule

**Use SVG icons instead of emojis**

- Create reusable icon components in `frontend/src/assets/icons.tsx`
- Icons should accept `className` and `size` props
- Use proper SVG with `currentColor` for theming
- Example: `<IconVessel size={24} className="my-class" />`

## Code Quality

- Fix all TypeScript errors before completing tasks
- Use `import type` for type-only imports
- Follow project conventions from `openspec/project.md`
- Write clean, maintainable code
