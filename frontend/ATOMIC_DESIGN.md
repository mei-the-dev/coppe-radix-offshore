# Atomic Design Pattern Implementation

This frontend follows the **Atomic Design** methodology, organizing components into five distinct levels of complexity.

## Structure

```
src/
├── components/
│   ├── atoms/          # Basic building blocks
│   │   ├── Button/
│   │   ├── Label/
│   │   ├── Badge/
│   │   └── index.ts
│   │
│   ├── molecules/      # Simple combinations of atoms
│   │   ├── Card/
│   │   ├── TabButton/
│   │   └── index.ts
│   │
│   ├── organisms/      # Complex UI components
│   │   ├── VesselList/
│   │   ├── BerthStatus/
│   │   ├── LoadingPlanTimeline/
│   │   ├── CreateLoadingPlan/
│   │   ├── Simulation/
│   │   ├── SimulationModel/
│   │   ├── DataStructure/
│   │   └── index.ts
│   │
│   ├── templates/      # Page-level layouts
│   │   ├── Dashboard/
│   │   └── index.ts
│   │
│   └── index.ts        # Central export
│
└── pages/              # Specific page instances
    ├── DashboardPage.tsx
    └── index.ts
```

## Component Levels

### 1. Atoms
**Basic building blocks** that cannot be broken down further.

- `Button` - Interactive button element
- `Label` - Form label with optional required indicator
- `Badge` - Status indicator badge

**Characteristics:**
- Single responsibility
- No dependencies on other components
- Highly reusable
- Styled using design tokens

### 2. Molecules
**Simple combinations** of atoms that form a functional unit.

- `Card` - Container component with variants
- `TabButton` - Tab navigation button (uses Button atom)

**Characteristics:**
- Combine 2-3 atoms
- Have a specific purpose
- Still relatively simple
- Reusable across different contexts

### 3. Organisms
**Complex components** that form distinct sections of the interface.

- `VesselList` - List of vessels with status
- `BerthStatus` - Berth availability display
- `LoadingPlanTimeline` - Timeline visualization
- `CreateLoadingPlan` - Form for creating plans
- `Simulation` - Simulation interface
- `SimulationModel` - Model visualization
- `DataStructure` - Data structure display

**Characteristics:**
- Combine molecules and atoms
- Form distinct sections of UI
- May have internal state
- Domain-specific

### 4. Templates
**Page-level layouts** that define the structure of pages.

- `Dashboard` - Main dashboard layout with tabs and content areas

**Characteristics:**
- Define page structure
- Place organisms in layout
- No real content, just wireframes
- Show content relationships

### 5. Pages
**Specific instances** of templates with real content.

- `DashboardPage` - Dashboard page with data loading and state management

**Characteristics:**
- Real content and data
- Connect to API/data sources
- Handle loading/error states
- Specific use cases

## Usage Examples

### Using Atoms
```tsx
import { Button, Badge, Label } from '../components/atoms';

<Button variant="primary" size="md" onClick={handleClick}>
  Submit
</Button>

<Badge variant="success">Active</Badge>

<Label required>Email Address</Label>
```

### Using Molecules
```tsx
import { Card, TabButton } from '../components/molecules';

<Card variant="elevated" padding="md">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

<TabButton active={isActive} onClick={handleTabClick}>
  Tab Label
</TabButton>
```

### Using Organisms
```tsx
import { VesselList, BerthStatus } from '../components/organisms';

<VesselList vessels={vessels} />
<BerthStatus berths={berths} />
```

### Using Templates
```tsx
import { Dashboard } from '../components/templates';

<Dashboard
  vessels={vessels}
  berths={berths}
  loadingPlans={plans}
  onPlansChange={setPlans}
/>
```

### Using Pages
```tsx
import { DashboardPage } from '../pages';

function App() {
  return <DashboardPage />;
}
```

## Design System Integration

All components use the design system tokens:

```tsx
import { tokens } from '../design-system';

// Components automatically use CSS variables
// defined in tokens.css
```

## Benefits

1. **Reusability** - Atoms and molecules can be reused anywhere
2. **Consistency** - Design system ensures visual consistency
3. **Maintainability** - Clear hierarchy makes code easier to maintain
4. **Scalability** - Easy to add new components at any level
5. **Testing** - Each level can be tested independently
6. **Documentation** - Clear structure makes onboarding easier

## Adding New Components

### Adding an Atom
1. Create folder: `components/atoms/ComponentName/`
2. Create `ComponentName.tsx` and `ComponentName.css`
3. Create `index.ts` with exports
4. Add to `components/atoms/index.ts`

### Adding a Molecule
1. Create folder: `components/molecules/ComponentName/`
2. Use atoms as building blocks
3. Follow same structure as atoms

### Adding an Organism
1. Create folder: `components/organisms/ComponentName/`
2. Combine molecules and atoms
3. May have internal state and API calls

### Adding a Template
1. Create folder: `components/templates/TemplateName/`
2. Define layout structure
3. Accept props for organisms

### Adding a Page
1. Create file: `pages/PageName.tsx`
2. Handle data loading and state
3. Use templates and organisms

## Best Practices

1. **Start Small** - Build atoms first, then combine them
2. **Single Responsibility** - Each component should do one thing
3. **Props Interface** - Use TypeScript interfaces from design system
4. **Design Tokens** - Always use CSS variables from tokens
5. **Composition** - Prefer composition over complex props
6. **Documentation** - Add JSDoc comments for complex components
