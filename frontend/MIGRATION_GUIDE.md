# Migration Guide
## From Legacy Architecture to Modern Architecture

This guide helps developers understand the migration from the old architecture to the new one.

## State Management Migration

### Before (useState/useEffect)
```typescript
const [vessels, setVessels] = useState<Vessel[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.getVessels().then(setVessels).finally(() => setLoading(false));
}, []);
```

### After (React Query + Zustand)
```typescript
const { data: vessels = [], isLoading } = useVessels();
// Zustand store automatically updated by hook
```

## Component Migration

### Before (Atomic Design)
```typescript
import { Card } from '../molecules/Card';
import { Badge } from '../atoms/Badge';
```

### After (Intent-Based)
```typescript
import { Card } from '../display/Card';
import { Badge } from '../display/Badge';
```

### Compound Components

**Before:**
```typescript
<Card>
  <div className="vessel-header">
    <h4>{vessel.name}</h4>
    <Badge>{vessel.status}</Badge>
  </div>
  <div className="vessel-details">
    {/* ... */}
  </div>
</Card>
```

**After:**
```typescript
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

## Routing Migration

### Before (Tab-based)
```typescript
<Tabs
  items={tabItems}
  activeId={activeTab}
  onChange={setActiveTab}
/>
```

### After (React Router)
```typescript
// Navigation handled by React Router
<NavLink to="/dashboard">Dashboard</NavLink>
<NavLink to="/planning">Planning</NavLink>
```

## Performance Optimizations

### Virtual Scrolling
For long lists, use virtual scrolling:
```typescript
import { VirtualVesselList } from '../organisms/VirtualVesselList';

<VirtualVesselList vessels={vessels} height={600} />
```

### Memoization
Components are memoized for performance:
```typescript
export default memo(VesselListComponent);
```

## Testing Updates

### React Query Testing
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

renderHook(() => useVessels(), { wrapper });
```

## Common Patterns

### Optimistic Updates
React Query mutations automatically handle optimistic updates:
```typescript
const mutation = useUpdateVessel();
mutation.mutate({ id: '1', data: { status: 'in_port' } });
// UI updates immediately, rolls back on error
```

### Error Handling
Error boundaries catch component errors:
```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Loading States
Use skeleton loaders:
```typescript
{isLoading ? (
  <SkeletonCard />
) : (
  <YourContent />
)}
```
