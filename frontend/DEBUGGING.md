# Debugging Guide

This guide explains how to use the debugging utilities to diagnose frontend rendering issues.

## Enabling Debug Mode

Debug mode is automatically enabled in development (`import.meta.env.DEV`). You can also enable it manually:

### Method 1: Environment Variable

```bash
VITE_DEBUG=true npm run dev
```

### Method 2: LocalStorage

Open browser console and run:

```javascript
localStorage.setItem('debug', 'true')
location.reload()
```

To disable:

```javascript
localStorage.removeItem('debug')
location.reload()
```

## Debug Utilities

### 1. Component Render Tracking

Tracks when components render and prop changes:

```typescript
import { trackRender } from './utils/debug'

// In your component
trackRender('ComponentName', { prop1: value1, prop2: value2 })
```

**Console Output:**
```
[RENDER] ComponentName rendered (1) { prop1: value1, prop2: value2 }
[RENDER] ComponentName re-rendered (2) { propChanges: [...] }
```

### 2. Data Flow Inspector

Logs API responses and data transformations:

```typescript
import { logAPIResponse, trackDataFlow } from './utils/dataInspector'

// Log API response
logAPIResponse('/api/vessels', responseData)

// Track data transformation
trackDataFlow('DashboardPage: Data loaded', { vessels: 5, berths: 3 })
```

**Console Output:**
```
[API] Response from /api/vessels { response: {...}, structure: "array[5]" }
[API] Data flow: DashboardPage: Data loaded { vessels: 5, berths: 3 }
```

### 3. Render Logger

React hook to automatically track renders:

```typescript
import { useRenderLogger } from './utils/renderLogger'

function MyComponent({ props }) {
  useRenderLogger('MyComponent', props)
  // ... component code
}
```

### 4. API Response Validator

Validates API response structure:

```typescript
import { validateAPIResponse, validateVesselData } from './utils/apiValidator'

const result = validateAPIResponse('/api/vessels', response, rules)
if (!result.valid) {
  console.error('Validation errors:', result.errors)
}
```

### 5. Style Inspector

Checks computed styles and CSS variables:

```typescript
import { checkComputedStyles, verifyCardStyling } from './utils/styleInspector'

const element = document.querySelector('.molecule-card')
const checks = verifyCardStyling(element)
```

**Console Output:**
```
[STYLE] Style mismatch: box-shadow { expected: "...", actual: "none" }
```

### 6. Style Tests

Runs comprehensive style tests:

```typescript
import { testCardStyling, runAllStyleTests } from './utils/styleTests'

const element = document.querySelector('.molecule-card')
testCardStyling(element)
runAllStyleTests(element, 'card')
```

## Common Debugging Scenarios

### Scenario 1: Component Not Rendering

**Symptoms:** Component shows empty state even with data

**Debug Steps:**

1. Check if data is loaded:
   ```javascript
   // In browser console
   window.__DEBUG__?.printDataFlowSummary()
   ```

2. Check component props:
   ```javascript
   // Component should log props on render
   // Look for [RENDER] logs in console
   ```

3. Check API response:
   ```javascript
   // Look for [API] logs showing response structure
   ```

### Scenario 2: Styling Not Applied

**Symptoms:** Components don't have expected styling

**Debug Steps:**

1. Check computed styles:
   ```typescript
   import { printStyleSummary } from './utils/styleInspector'

   const element = document.querySelector('.molecule-card')
   printStyleSummary(element)
   ```

2. Check CSS variables:
   ```typescript
   import { verifyCSSVariables } from './utils/styleInspector'

   const vars = verifyCSSVariables(element, ['--color-primary-500'])
   console.log('CSS Variables:', vars)
   ```

3. Check for conflicts:
   ```typescript
   import { checkStyleConflicts } from './utils/styleInspector'

   const conflicts = checkStyleConflicts(element)
   if (conflicts.length > 0) {
     console.warn('Style conflicts:', conflicts)
   }
   ```

### Scenario 3: Data Structure Mismatch

**Symptoms:** Components receive wrong data format

**Debug Steps:**

1. Validate API response:
   ```typescript
   import { validateVesselData, validateArray } from './utils/apiValidator'

   const result = validateArray(vessels, validateVesselData, 'vessels')
   if (!result.valid) {
     console.error('Validation errors:', result.errors)
   }
   ```

2. Check data flow:
   ```javascript
   // In browser console
   window.__DEBUG__?.printDataFlowSummary()
   ```

### Scenario 4: Unnecessary Re-renders

**Symptoms:** Component renders too frequently

**Debug Steps:**

1. Check render history:
   ```typescript
   import { getRenderHistory, printRenderSummary } from './utils/renderLogger'

   const history = getRenderHistory('ComponentName')
   printRenderSummary()
   ```

2. Check prop changes:
   ```javascript
   // Look for [RENDER] logs showing prop changes
   // Components should log when props change
   ```

## Debug Console Commands

When debug mode is enabled, you can use these commands in the browser console:

```javascript
// Print data flow summary
window.__DEBUG__?.printDataFlowSummary()

// Print render summary
window.__DEBUG__?.printRenderSummary()

// Get component debug info
window.__DEBUG__?.getComponentDebugInfo('ComponentName')

// Clear debug logs
window.__DEBUG__?.clearDebugInfo()
window.__DEBUG__?.clearDataFlowLog()
window.__DEBUG__?.clearRenderHistory()
```

## Interpreting Debug Output

### Component Render Logs

```
[RENDER] VesselList rendered (1) { vessels: 5 }
```

- Component name: `VesselList`
- Render count: `1` (first render)
- Props: `{ vessels: 5 }`

### API Response Logs

```
[API] Response from /api/vessels { response: {...}, structure: "array[5]" }
```

- Endpoint: `/api/vessels`
- Response structure: `array[5]` (array with 5 items)
- Full response object available in console

### Style Mismatch Logs

```
[STYLE] Style mismatch: box-shadow { expected: "...", actual: "none" }
```

- Property: `box-shadow`
- Expected: shadow value
- Actual: `none` (no shadow applied)

## Performance Monitoring

Debug mode includes performance monitoring:

```typescript
import { measureRender } from './utils/debug'

measureRender('ComponentName', () => {
  // Component render code
})
```

Slow renders (>16ms) are automatically logged.

## Production Builds

Debug utilities are automatically excluded from production builds. They only run when:

- `import.meta.env.DEV === true`
- `VITE_DEBUG === 'true'`
- `localStorage.getItem('debug') === 'true'`

## Troubleshooting

### Debug logs not appearing

1. Check if debug mode is enabled
2. Check browser console filters
3. Verify `import.meta.env.DEV` is true

### Too many debug logs

1. Filter by category in console
2. Use `debugGroup()` for organized output
3. Disable specific debug utilities if needed

### Performance impact

Debug mode has minimal performance impact, but you can:
1. Disable specific debug utilities
2. Use conditional logging
3. Only enable when needed

## Resources

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Firefox DevTools](https://firefox-source-docs.mozilla.org/devtools-user/)
