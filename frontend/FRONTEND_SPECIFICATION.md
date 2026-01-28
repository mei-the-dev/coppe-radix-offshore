# Frontend Specification
## Porto do Açu Loading Dashboard - Offshore Logistics Platform

**Version:** 1.0.0
**Last Updated:** 2025-01-XX
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Design System](#design-system)
6. [Component Library](#component-library)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Routing and Pages](#routing-and-pages)
10. [Styling and Theming](#styling-and-theming)
11. [Accessibility](#accessibility)
12. [Testing Strategy](#testing-strategy)
13. [Build and Deployment](#build-and-deployment)
14. [Development Workflow](#development-workflow)

---

## 1. Overview

### 1.1 Purpose
The frontend is a React-based single-page application (SPA) for managing offshore logistics operations, specifically platform supply vessel (PSV) loading planning for PRIO Offshore Logistics. The application provides real-time monitoring, planning, and simulation capabilities for vessel fleet management and berth operations.

### 1.2 Key Features
- **Dashboard**: Real-time overview of vessels, berths, and loading plans
- **Planning**: Create and manage loading plans with cargo allocation
- **Simulation**: Visual simulation of vessel movements and operations
- **Data Structure**: Interactive visualization of system data models
- **Model Management**: Configuration and management of simulation models

### 1.3 Design Principles
- **Intent-Based Component Architecture**: Components organized by purpose (Action, Display, Navigation, Feedback, Layout)
- **3-Tier Token System**: Reference → Semantic → Component token hierarchy
- **Composition Over Configuration**: Flexible component composition patterns
- **Context-Aware Theming**: Automatic theme detection and switching
- **WCAG 3.0 Compliance**: Usability-first accessibility approach

---

## 2. Architecture

### 2.1 Application Architecture
```
┌─────────────────────────────────────────┐
│           React Application             │
│  ┌───────────────────────────────────┐  │
│  │      ThemeProvider (Context)      │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │         App Component        │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │    DashboardPage       │  │  │  │
│  │  │  │  ┌─────────────────┐   │  │  │  │
│  │  │  │  │   Dashboard     │   │  │  │  │
│  │  │  │  │   (Template)    │   │  │  │  │
│  │  │  │  └─────────────────┘   │  │  │  │
│  │  │  └───────────────────────┘  │  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         API Client Layer                │
│    (REST API Integration)               │
└─────────────────────────────────────────┘
```

### 2.2 Component Architecture

#### Intent-Based Organization
Components are organized by their functional intent rather than visual complexity:

- **Action Components** (`/components/action/`): Trigger behaviors
  - Button, IconButton, SplitButton, Input

- **Display Components** (`/components/display/`): Present information
  - Card, Badge

- **Navigation Components** (`/components/navigation/`): Guide users
  - Tabs, TabButton

- **Feedback Components** (`/components/feedback/`): Communicate status
  - Alert, Toast, Modal, Tooltip

- **Layout Components** (`/components/layout/`): Define structure
  - Stack, Grid

#### Legacy Atomic Design (Deprecated)
Maintained for backward compatibility:
- `/components/atoms/`: Basic building blocks
- `/components/molecules/`: Composite components
- `/components/organisms/`: Complex feature components
- `/components/templates/`: Page-level layouts

### 2.3 Data Flow
```
User Interaction
    ↓
Component Event Handler
    ↓
State Update (useState/useEffect)
    ↓
API Client Call
    ↓
Backend API
    ↓
Response Processing
    ↓
State Update
    ↓
Component Re-render
```

---

## 3. Technology Stack

### 3.1 Core Technologies
- **React 19.2.0**: UI library
- **TypeScript 5.9.3**: Type safety
- **Vite 7.2.4**: Build tool and dev server

### 3.2 Key Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "clsx": "^2.1.1",
  "lucide-react": "^0.562.0",
  "tailwind-merge": "^3.4.0"
}
```

### 3.3 Development Tools
- **Vitest 2.1.8**: Unit testing framework
- **@testing-library/react**: Component testing utilities
- **Playwright 1.48.0**: End-to-end and visual testing
- **ESLint**: Code linting
- **TypeScript ESLint**: TypeScript-specific linting

### 3.4 Build Tools
- **Vite**: Fast build tool with HMR
- **TypeScript Compiler**: Type checking and compilation
- **CSS**: Native CSS with custom properties (no CSS-in-JS)

---

## 4. Project Structure

```
frontend/
├── src/
│   ├── api/                    # API client and integration
│   │   └── client.ts           # REST API client
│   │
│   ├── assets/                 # Static assets
│   │   ├── icons.tsx           # SVG icon components
│   │   └── react.svg
│   │
│   ├── components/             # Component library
│   │   ├── action/             # Action components (Button, Input, etc.)
│   │   ├── display/            # Display components (Card, Badge)
│   │   ├── navigation/         # Navigation components (Tabs)
│   │   ├── feedback/           # Feedback components (Alert, Modal, Toast)
│   │   ├── layout/             # Layout components (Stack, Grid)
│   │   ├── atoms/              # Legacy atomic components
│   │   ├── molecules/          # Legacy molecular components
│   │   ├── organisms/          # Complex feature components
│   │   ├── templates/          # Page-level templates
│   │   └── index.ts            # Central component exports
│   │
│   ├── contexts/               # React contexts
│   │   ├── ThemeContext.tsx    # Theme management
│   │   └── AuthContext.tsx     # Authentication (future)
│   │
│   ├── design-system/          # Design system
│   │   ├── tokens/             # Design tokens
│   │   │   ├── reference.ts   # Primitive values
│   │   │   ├── semantic.ts     # Contextual tokens
│   │   │   ├── components.ts   # Component-specific tokens
│   │   │   └── legacy.ts       # Legacy token structure
│   │   ├── tokens.css          # CSS custom properties
│   │   ├── themes.css          # Theme definitions
│   │   ├── components/         # Component interfaces
│   │   └── index.ts            # Design system exports
│   │
│   ├── lib/                    # Utility libraries
│   │   └── utils.ts            # General utilities (cn, etc.)
│   │
│   ├── pages/                  # Page components
│   │   ├── DashboardPage.tsx   # Main dashboard page
│   │   └── index.ts
│   │
│   ├── styles/                 # Global styles
│   │   └── accessibility.css   # Accessibility utilities
│   │
│   ├── test-utils/             # Testing utilities
│   │   ├── testUtils.tsx       # Test render helpers
│   │   └── setup.ts            # Test configuration
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts            # Core types
│   │   └── simulation.ts       # Simulation-specific types
│   │
│   ├── utils/                  # Utility functions
│   │   ├── accessibility.ts    # Accessibility helpers
│   │   ├── apiValidator.ts     # API response validation
│   │   ├── dataInspector.ts    # Data flow tracking
│   │   ├── debugMode.ts        # Debug utilities
│   │   └── renderLogger.ts     # Render tracking
│   │
│   ├── App.tsx                 # Root application component
│   ├── App.css                 # Application styles
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
│
├── tests/                      # Test files (co-located with components)
├── dist/                       # Build output
├── node_modules/               # Dependencies
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── FRONTEND_SPECIFICATION.md   # This document
```

---

## 5. Design System

### 5.1 3-Tier Token Architecture

#### Tier 1: Reference Tokens
Primitive, raw design values (colors, spacing, typography).

**Location:** `src/design-system/tokens/reference.ts`

```typescript
export const referenceTokens = {
  colors: {
    purple: { 50: '#faf5ff', 100: '#f3e8ff', ..., 900: '#581c87' },
    pink: { 50: '#fdf2f8', ..., 900: '#831843' },
    gray: { 50: '#f9fafb', ..., 950: '#030712' },
    // ... status colors
  },
  spacing: { 0: '0', 1: '0.25rem', ..., 24: '6rem' },
  typography: { /* font families, sizes, weights */ },
  // ...
}
```

#### Tier 2: Semantic Tokens
Contextual, purpose-driven names that map to reference tokens.

**Location:** `src/design-system/tokens/semantic.ts`

```typescript
export const semanticTokens = {
  colors: {
    primary: referenceTokens.colors.purple[500],
    onPrimary: referenceTokens.colors.white,
    text: {
      primary: referenceTokens.colors.gray[900],
      secondary: referenceTokens.colors.gray[600],
      // ...
    },
    surface: {
      default: referenceTokens.colors.white,
      raised: referenceTokens.colors.white,
      // ...
    },
    // ...
  }
}
```

#### Tier 3: Component Tokens
Component-specific property mappings.

**Location:** `src/design-system/tokens/components.ts`

```typescript
export const componentTokens = {
  button: {
    background: semanticTokens.colors.interactive.default,
    text: semanticTokens.colors.onPrimary,
    hoverBackground: semanticTokens.colors.interactive.hover,
    // ...
  },
  card: {
    background: semanticTokens.colors.surface.default,
    borderColor: semanticTokens.colors.border.default,
    // ...
  }
}
```

### 5.2 CSS Custom Properties

All tokens are exposed as CSS custom properties in `tokens.css`:

```css
:root {
  --color-primary-500: #a855f7;
  --text-primary: var(--color-gray-900);
  --surface-default: var(--color-white);
  --spacing-4: 1rem;
  /* ... */
}
```

### 5.3 Theme System

#### Light Mode (Default)
```css
:root,
[data-theme="light"] {
  --bg-primary: var(--color-white);
  --bg-secondary: var(--color-gray-50);
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-600);
  --surface-default: var(--color-white);
  --border-default: var(--color-gray-200);
  /* ... */
}
```

#### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-primary: var(--color-gray-950);
    --bg-secondary: var(--color-gray-900);
    --text-primary: var(--color-gray-50);
    --text-secondary: var(--color-gray-300);
    --surface-default: var(--color-gray-900);
    --border-default: var(--color-gray-700);
    /* ... */
  }
}

[data-theme="dark"] {
  /* Same as above */
}
```

#### Theme Context
**Location:** `src/contexts/ThemeContext.tsx`

Provides React context for theme management:
- Automatic system theme detection
- Manual theme switching (light/dark/system)
- Persistent theme preference (localStorage)
- Real-time theme updates

### 5.4 Typography Scale
- **Font Families**: Inter (sans), JetBrains Mono (mono)
- **Font Sizes**: xs (0.75rem) → 5xl (3rem)
- **Font Weights**: 300 (light) → 800 (extrabold)
- **Line Heights**: none (1) → loose (2)
- **Letter Spacing**: tighter (-0.05em) → wider (0.05em)

### 5.5 Spacing Scale
4px base unit: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), etc.

### 5.6 Color Palette
- **Primary**: Purple (#a855f7) - Primary actions and branding
- **Secondary**: Pink (#ec4899) - Secondary actions
- **Status Colors**: Success (green), Warning (yellow), Error (red), Info (blue)
- **Neutral**: Gray scale (50-950) for text, backgrounds, borders

### 5.7 Motion System
- **Durations**: instant (0ms), fast (150ms), normal (300ms), slow (500ms)
- **Easing**: ease, ease-in, ease-out, ease-in-out, bounce, smooth
- **Framer Motion**: Animation library for component transitions
- **Animation Presets**: Reusable variants (fadeIn, slideUp, scaleIn, etc.)
- **Location**: `src/design-system/animations/presets.ts`

---

## 6. Component Library

### 6.1 Action Components

#### Button
**Location:** `src/components/action/Button/`

**Variants:**
- `primary`: Main actions (purple background)
- `secondary`: Secondary actions (gray background)
- `ghost`: Subtle actions (transparent)
- `danger`: Destructive actions (red)
- `success`: Positive actions (green)
- `warning`: Caution actions (yellow)

**Sizes:** `sm`, `md`, `lg`

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
}
```

#### IconButton
Icon-only button variant for compact actions.

#### SplitButton
Button with dropdown menu for multiple related actions.

#### Input
Text input with label, error states, and help text.

### 6.1.1 Compound Components

#### VesselCard
**Location:** `src/components/display/VesselCard/`

Compound component pattern:
```tsx
<VesselCard.Root vessel={vessel}>
  <VesselCard.Header>
    <VesselCard.Title />
    <VesselCard.Status />
  </VesselCard.Header>
  <VesselCard.Details>
    <VesselCard.Type />
    <VesselCard.Location />
    <VesselCard.Capacity />
  </VesselCard.Details>
</VesselCard.Root>
```

#### BerthCard
**Location:** `src/components/display/BerthCard/`

Similar compound pattern for berth information.

### 6.2 Display Components

#### Card
**Location:** `src/components/display/Card/`

**Variants:**
- `default`: Standard card with subtle shadow
- `elevated`: Higher elevation shadow
- `outlined`: Border-only styling
- `glass`: Glassmorphism effect
- `muted`: Subtle background

**Padding Options:** `none`, `sm`, `md`, `lg`, `xl`

**Features:**
- `hoverable`: Adds hover elevation effect
- `clickable`: Makes card interactive

#### Badge
Status indicators with color-coded variants (success, warning, error, info, primary).

### 6.3 Navigation Components

#### Tabs
**Location:** `src/components/navigation/Tabs/`

Tab navigation component with keyboard support:
- Arrow keys for navigation
- Home/End for first/last tab
- Proper ARIA attributes

**Variants:**
- `default`: Standard tabs
- `pills`: Rounded pill style
- `underline`: Underline indicator

**Props:**
```typescript
interface TabsProps {
  items: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultActiveId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
  'aria-label'?: string;
}
```

### 6.4 Feedback Components

#### Alert
**Location:** `src/components/feedback/Alert/`

Status messages with severity levels:
- `info`: Informational messages
- `success`: Success confirmations
- `warning`: Warning messages
- `error`: Error messages

#### Toast
Temporary notifications that auto-dismiss.

#### Modal
**Location:** `src/components/feedback/Modal/`

Composition-based modal using compound components with Framer Motion animations:
```tsx
<Modal.Root open={isOpen} onOpenChange={setIsOpen}>
  <Modal.Header>
    <Modal.Title>Title</Modal.Title>
    <Modal.CloseButton />
  </Modal.Header>
  <Modal.Content>
    Content here
  </Modal.Content>
  <Modal.Footer>
    Actions here
  </Modal.Footer>
</Modal.Root>
```

#### Tooltip
Contextual help text on hover/focus.

#### ErrorBoundary
**Location:** `src/components/feedback/ErrorBoundary/`

React error boundary for graceful error handling:
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### Skeleton
**Location:** `src/components/feedback/Skeleton/`

Loading placeholders:
- `Skeleton`: Basic skeleton with customizable size/variant
- `SkeletonText`: Multi-line text skeleton
- `SkeletonCard`: Card-shaped skeleton

### 6.5 Layout Components

#### Stack
**Location:** `src/components/layout/Stack/`

Flexbox-based stacking component:
- `direction`: `row` | `column`
- `justify`: `start` | `center` | `end` | `space-between` | `space-around`
- `align`: `start` | `center` | `end` | `stretch`
- `gap`: `xs` | `sm` | `md` | `lg` | `xl`

#### Grid
**Location:** `src/components/layout/Grid/`

CSS Grid-based layout:
- Responsive column configuration
- Gap spacing options
- Breakpoint-aware columns

### 6.6 Organisms (Complex Components)

#### VesselList
Displays fleet of vessels with status badges and capacity information.

#### BerthStatus
Shows berth availability and current vessel assignments.

#### LoadingPlanTimeline
Visual timeline of loading operations.

#### Simulation
Interactive vessel movement simulation with map visualization.

#### CreateLoadingPlan
Form for creating new loading plans with cargo selection.

---

## 7. State Management

### 7.1 Zustand Stores
Global state management using Zustand:

- **useVesselStore**: Vessel state, filters, selection
- **useBerthStore**: Berth state, filters, selection
- **useLoadingPlanStore**: Loading plan state, CRUD operations
- **useSimulationStore**: Simulation state and controls
- **useUIStore**: UI preferences (sidebar, active view)

**Location:** `frontend/src/stores/`

### 7.2 React Query
Server state management with React Query:

- **useVessels**: Vessel data fetching with auto-refetch
- **useBerths**: Berth data fetching
- **useLoadingPlans**: Loading plan queries
- **useCreateLoadingPlan**: Mutation with optimistic updates
- **useUpdateLoadingPlan**: Update mutation
- **useDeleteLoadingPlan**: Delete mutation

**Location:** `frontend/src/hooks/`

### 7.3 Local State
React hooks (`useState`, `useEffect`) for component-level UI state only.

### 7.4 State Patterns
- **Optimistic Updates**: Immediate UI updates before API confirmation
- **Automatic Refetching**: React Query handles background updates
- **State Persistence**: Zustand stores persist to localStorage
- **Derived State**: Computed values from queries/stores

---

## 8. API Integration

### 8.1 API Client
**Location:** `src/api/client.ts`

Centralized API client with:
- Base URL configuration
- Request/response interceptors
- Error handling
- Type-safe endpoints

### 8.2 API Methods
```typescript
api.getVessels(): Promise<Vessel[]>
api.getBerths(): Promise<Berth[]>
api.getLoadingPlans(): Promise<LoadingPlan[]>
api.createLoadingPlan(data): Promise<LoadingPlan>
api.getCargoCatalog(): Promise<CargoItem[]>
api.getInstallations(): Promise<Installation[]>
```

### 8.3 Error Handling
- Try-catch blocks in async functions
- User-friendly error messages
- Error state management
- Retry mechanisms (future)

### 8.4 Data Validation
**Location:** `src/utils/apiValidator.ts`

Runtime validation of API responses:
- Type checking
- Required field validation
- Data structure validation
- Development-mode warnings

---

## 9. Routing and Pages

### 9.1 React Router Implementation
Multi-page application with React Router v6:

- **Route Structure:**
  - `/` → Redirects to `/dashboard`
  - `/dashboard` → Dashboard page (planning view)
  - `/planning` → Planning page (same as dashboard)
  - `/simulation` → Simulation page
  - `/model` → Model configuration page
  - `/data` → Data structure visualization

### 9.2 Route Components
**Location:** `src/routes/`

- `AppLayout.tsx`: Main layout with navigation
- `DashboardRoute.tsx`: Dashboard page route
- `PlanningRoute.tsx`: Planning page route
- `SimulationRoute.tsx`: Simulation page route
- `ModelRoute.tsx`: Model page route
- `DataStructureRoute.tsx`: Data structure route

### 9.3 Code Splitting
Routes are lazy-loaded for optimal bundle size:
- Each route is a separate chunk
- Reduces initial load time
- Improves performance

### 9.4 Navigation
- Tab-based navigation in `AppLayout`
- Active route highlighting
- Breadcrumb support (future)

---

## 10. Styling and Theming

### 10.1 CSS Architecture
- **Global Styles**: `index.css`, `App.css`
- **Component Styles**: Co-located `.css` files
- **Design System**: `design-system/tokens.css`, `themes.css`
- **Utility Styles**: `styles/accessibility.css`

### 10.2 CSS Methodology
- **BEM-like Naming**: Component-scoped classes
- **CSS Custom Properties**: Theme tokens
- **No CSS-in-JS**: Pure CSS for better performance
- **Scoped Styles**: Component-specific CSS files

### 10.3 Theme Implementation
1. **System Detection**: `prefers-color-scheme` media query
2. **Manual Override**: `data-theme` attribute
3. **Context Provider**: React context for theme state
4. **CSS Variables**: Dynamic token values

### 10.4 Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Flexible grid system
- Touch-friendly targets (min 44px)

### 10.5 Animation and Transitions
- CSS transitions for state changes
- Motion tokens for consistent timing
- Reduced motion support
- Performance-optimized animations

---

## 11. Accessibility

### 11.1 WCAG 3.0 Compliance
- **Task-Based Testing**: Focus on task completion, not just technical compliance
- **Cognitive Accessibility**: Clear language, consistent patterns
- **Motor Accessibility**: Large touch targets, keyboard navigation

### 11.2 ARIA Implementation
- Semantic HTML elements
- ARIA labels and descriptions
- ARIA live regions for dynamic content
- Proper role attributes

### 11.3 Keyboard Navigation
- Tab order management
- Focus indicators
- Keyboard shortcuts
- Skip links

### 11.4 Screen Reader Support
- Descriptive labels
- Status announcements
- Form error messages
- Contextual help

### 11.5 Accessibility Utilities
**Location:** `src/utils/accessibility.ts`

Helper functions for:
- Focus management
- ARIA attribute management
- Keyboard event handling
- Screen reader announcements

### 11.6 Testing
**Location:** `tests/accessibility/`

- Task-based accessibility tests
- Keyboard navigation tests
- Screen reader compatibility
- Color contrast validation

---

## 12. Testing Strategy

### 12.1 Unit Testing
**Framework:** Vitest
**Location:** Co-located with components (`*.test.tsx`)

**Coverage:**
- Component rendering
- User interactions
- State management
- Props validation

**Example:**
```typescript
describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('atom-button--primary');
  });
});
```

### 12.2 Integration Testing
**Framework:** Vitest + Testing Library

**Coverage:**
- Component interactions
- Form submissions
- API integration
- State updates

### 12.3 Visual Testing
**Framework:** Playwright

**Coverage:**
- Visual regression testing
- Cross-browser compatibility
- Responsive design validation

### 12.4 E2E Testing
**Framework:** Playwright

**Coverage:**
- User workflows
- Critical paths
- Error scenarios

### 12.5 Test Utilities
**Location:** `src/test-utils/`

- Custom render functions
- Mock providers
- Test data factories
- Accessibility helpers

---

## 13. Build and Deployment

### 13.1 Build Process
```bash
npm run build
```

**Steps:**
1. TypeScript compilation (`tsc -b`)
2. Vite build (bundling, minification)
3. Asset optimization
4. Output to `dist/` directory

### 13.2 Build Output
```
dist/
├── index.html          # Entry HTML
├── assets/
│   ├── index-*.css    # Bundled styles
│   └── index-*.js     # Bundled JavaScript
```

### 13.3 Development Server
```bash
npm run dev
```

- Vite dev server with HMR
- Fast refresh
- Source maps
- Environment variables

### 13.4 Environment Variables
- `VITE_API_URL`: Backend API URL
- `VITE_DEBUG`: Debug mode flag
- `import.meta.env.DEV`: Development mode

### 13.5 Production Optimizations
- Code splitting
- Tree shaking
- Minification
- Asset compression
- Source map generation (optional)

### 13.6 Deployment
- Static file hosting (CDN, S3, etc.)
- Environment-specific builds
- Cache headers configuration
- Error tracking integration (future)

---

## 14. Development Workflow

### 14.1 Development Scripts
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run tests
npm run test:ui      # Test UI
npm run test:visual  # Visual tests
npm run lint         # Lint code
```

### 14.2 Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting (if configured)
- **Pre-commit Hooks**: Lint and test before commit (future)

### 14.3 Debugging
- **React DevTools**: Component inspection
- **Browser DevTools**: Network, console, performance
- **Debug Mode**: `VITE_DEBUG=true` for verbose logging
- **Render Logger**: Component render tracking

### 14.4 Component Development
1. Create component in appropriate intent directory
2. Add TypeScript interface
3. Implement component logic
4. Add CSS styles with semantic tokens
5. Write unit tests
6. Add to component exports
7. Document usage

### 14.5 Design System Updates
1. Update reference tokens if needed
2. Map to semantic tokens
3. Update component tokens
4. Generate CSS variables
5. Update component styles
6. Test theme switching

### 14.6 Git Workflow
- Feature branches
- Pull request reviews
- Automated testing
- Semantic versioning

---

## 15. Performance Considerations

### 15.1 Bundle Size
- Code splitting by route (future)
- Dynamic imports for heavy components
- Tree shaking unused code
- Asset optimization

### 15.2 Runtime Performance
- React.memo for expensive components
- useMemo/useCallback for expensive computations
- Virtual scrolling for long lists (future)
- Debounced API calls

### 15.3 Loading Performance
- Lazy loading images
- Progressive enhancement
- Skeleton screens
- Optimistic UI updates

### 15.4 Monitoring
- Performance metrics (future)
- Error tracking (future)
- User analytics (future)

---

## 16. Security

### 16.1 Current Measures
- Input validation
- XSS prevention (React's built-in escaping)
- HTTPS enforcement (deployment)
- Secure API communication

### 16.2 Future Enhancements
- Authentication/authorization
- CSRF protection
- Content Security Policy
- Security headers

---

## 17. Browser Support

### 17.1 Supported Browsers
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

### 17.2 Polyfills
- Modern JavaScript features via Vite
- CSS custom properties (native support)
- Fetch API (native support)

---

## 18. Future Enhancements

### 18.1 Planned Features
- React Router for multi-page navigation
- State management library (Zustand/Redux) if needed
- Real-time updates (WebSocket)
- Offline support (Service Workers)
- Progressive Web App (PWA) features

### 18.2 Design System Enhancements
- Spring physics for animations
- Spatial computing tokens
- Advanced glassmorphism effects
- More component variants

### 18.3 Developer Experience
- Storybook for component documentation
- Component playground
- Design tokens visualization
- Automated accessibility testing

---

## 19. Maintenance

### 19.1 Dependencies
- Regular security updates
- Major version migrations
- Deprecation handling

### 19.2 Documentation
- Keep this specification updated
- Component usage examples
- API documentation
- Changelog maintenance

### 19.3 Code Health
- Regular refactoring
- Technical debt management
- Performance monitoring
- Accessibility audits

---

## Appendix A: Component Decision Matrix

See `COMPONENT_DECISION_MATRIX.md` for guidelines on:
- When to create new components
- Component categorization
- Composition patterns
- Reusability criteria

---

## Appendix B: Type Definitions

### Core Types
**Location:** `src/types/index.ts`

```typescript
interface Vessel {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'in_port' | 'in_transit' | 'at_platform' | 'maintenance';
  currentLocation?: string;
  deckCargoCapacity: number;
  liquidMudCapacity: number;
  operationalSpeed: number;
}

interface Berth {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  maxDraught: number;
  maxLength: number;
  maxDeadweight: number;
  currentVesselId?: string;
}

interface LoadingPlan {
  id: string;
  vesselId: string;
  berthId: string;
  scheduledStart: string;
  cargoItems: CargoItem[];
  // ...
}
```

---

## Appendix C: Design Tokens Reference

### Color Tokens
- Primary: `--color-primary-{50-900}`
- Secondary: `--color-secondary-{50-900}`
- Status: `--color-success`, `--color-warning`, `--color-error`, `--color-info`
- Neutral: `--color-gray-{50-950}`

### Semantic Color Tokens
- Text: `--text-primary`, `--text-secondary`, `--text-tertiary`
- Surface: `--surface-default`, `--surface-raised`, `--surface-sunken`
- Border: `--border-default`, `--border-strong`, `--border-subtle`
- Interactive: `--interactive-default`, `--interactive-hover`, `--interactive-active`

### Spacing Tokens
- `--spacing-{0-24}`: 4px base unit

### Typography Tokens
- Font sizes: `--font-size-{xs-5xl}`
- Font weights: `--font-weight-{light-extrabold}`
- Line heights: `--line-height-{none-loose}`
- Letter spacing: `--letter-spacing-{tighter-wider}`

### Motion Tokens
- Durations: `--duration-{instant-slower}`
- Timing: `--timing-{linear-bounce}`

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-XX | AI Assistant | Initial specification |

---

**End of Specification**
