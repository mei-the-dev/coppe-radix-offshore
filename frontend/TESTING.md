# Testing Guide

This document provides guidance on writing and running tests for the PRIO Offshore Logistics frontend.

## Test Structure

The project uses a multi-layered testing approach:

1. **Unit Tests** - Component-level tests using Vitest + React Testing Library
2. **Visual Regression Tests** - Screenshot comparison using Playwright
3. **Integration Tests** - Full data flow testing (future)

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in debug mode
npm run test:debug
```

### Visual Regression Tests

```bash
# Run all visual tests
npm run test:visual

# Run visual tests in UI mode
npx playwright test --ui

# Update visual baselines (after intentional changes)
npx playwright test --update-snapshots
```

## Writing Unit Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils/testUtils'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent prop="value" />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Using Test Utilities

The test utilities provide:

- **Custom render function** - Pre-configured with providers
- **Mock API client** - `mockAPI` for testing API interactions
- **Test data factories** - `createMockVessel()`, `createMockBerth()`, etc.

```typescript
import { render, createMockVessel } from '../../test-utils/testUtils'

const vessel = createMockVessel({ name: 'Custom Name' })
render(<VesselList vessels={[vessel]} />)
```

### Testing Best Practices

1. **Test user behavior, not implementation**
   - Test what users see and interact with
   - Avoid testing internal state or implementation details

2. **Use accessible queries**
   - Prefer `getByRole`, `getByLabelText`, `getByText`
   - Avoid `getByTestId` unless necessary

3. **Test edge cases**
   - Empty states
   - Loading states
   - Error states
   - Null/undefined props

4. **Keep tests focused**
   - One assertion per test (when possible)
   - Test one behavior at a time

## Writing Visual Regression Tests

### Visual Test Example

```typescript
import { test, expect } from '@playwright/test'

test('component renders correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('component.png')
})
```

### Visual Test Best Practices

1. **Wait for content to load**
   - Use `waitForSelector` before taking screenshots
   - Ensure animations/transitions complete

2. **Test specific sections**
   - Use `locator().toHaveScreenshot()` for component-level tests
   - Use full-page screenshots sparingly

3. **Handle dynamic content**
   - Mock timestamps, IDs, or other dynamic data
   - Use consistent test data

4. **Update baselines intentionally**
   - Review changes before updating
   - Document why baselines changed

## Test Coverage

Current test coverage:

- ✅ VesselList component
- ✅ BerthStatus component
- ✅ Card molecule
- ✅ Badge atom
- ✅ Planning tab visual tests
- ✅ Simulation tab visual tests
- ✅ Component styling tests

## Debugging Failed Tests

### Unit Tests

1. **Run tests in watch mode**
   ```bash
   npm test -- --watch
   ```

2. **Use debug mode**
   ```bash
   npm run test:debug
   ```

3. **Check test output**
   - Look for error messages
   - Check component render output
   - Verify mock data

### Visual Tests

1. **View test results**
   ```bash
   npx playwright show-report
   ```

2. **Compare screenshots**
   - Check `test-results/` directory
   - Compare actual vs expected

3. **Debug in browser**
   ```bash
   npx playwright test --debug
   ```

## Continuous Integration

Tests run automatically on:

- Pull requests
- Main branch commits
- Scheduled runs (nightly)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
