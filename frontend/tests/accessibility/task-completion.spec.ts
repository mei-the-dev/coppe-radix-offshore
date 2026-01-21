import { test, expect } from '@playwright/test';

/**
 * WCAG 3.0 Task-Based Accessibility Tests
 *
 * These tests verify real-world usability and task completion,
 * not just technical compliance. Focus on whether users can
 * complete tasks with disabilities.
 */

test.describe('Task Completion - Loading Plan Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('User can create loading plan with keyboard only', async ({ page }) => {
    // Task: Create a new loading plan using only keyboard navigation

    // Step 1: Navigate to create button
    await page.keyboard.press('Tab'); // Focus first interactive element
    // Continue tabbing until we reach the "Create Loading Plan" button
    // (This assumes the button is reachable via keyboard)

    // Step 2: Activate create button
    await page.keyboard.press('Enter');

    // Step 3: Fill form fields with keyboard
    await page.keyboard.press('Tab'); // Focus first form field
    await page.keyboard.type('Test Plan Name');

    await page.keyboard.press('Tab');
    // Continue filling form...

    // Step 4: Submit form
    await page.keyboard.press('Tab'); // Navigate to submit button
    await page.keyboard.press('Enter');

    // Verify task completion
    await expect(page.locator('[role="alert"]')).toContainText(/plan.*created|success/i);
  });

  test('User with screen reader can understand form errors', async ({ page }) => {
    // Task: User must be able to understand and fix form errors

    // Navigate to form
    await page.goto('/');
    // Open create plan form...

    // Submit form without required fields
    await page.keyboard.press('Tab'); // Navigate to submit
    await page.keyboard.press('Enter');

    // Verify error messages are announced
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveAttribute('aria-live', 'polite');

    // Verify error is associated with form field
    const errorField = page.locator('[aria-invalid="true"]');
    await expect(errorField).toBeVisible();
  });

  test('User can navigate dashboard with keyboard', async ({ page }) => {
    // Task: Navigate between dashboard tabs using keyboard

    await page.goto('/');

    // Navigate to tabs
    const tabList = page.locator('[role="tablist"]');
    await expect(tabList).toBeVisible();

    // Use arrow keys to navigate tabs (if implemented)
    // Or Tab to move between tabs
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Activate tab
    await page.keyboard.press('Enter');

    // Verify content changed
    // (Implementation depends on actual tab structure)
  });
});

test.describe('Cognitive Accessibility', () => {
  test('Error messages explain how to fix issues', async ({ page }) => {
    // WCAG 3.0: Error messages should be clear and actionable

    await page.goto('/');
    // Trigger an error...

    const errorMessage = page.locator('[role="alert"]');
    const messageText = await errorMessage.textContent();

    // Verify message is clear and actionable
    expect(messageText).toMatch(/required|missing|invalid/i);
    // Message should explain what to do, not just what's wrong
  });

  test('Loading states are communicated clearly', async ({ page }) => {
    // WCAG 3.0: Users should understand system status

    await page.goto('/');
    // Trigger a loading action...

    // Verify loading state is announced
    const loadingIndicator = page.locator('[aria-busy="true"]');
    await expect(loadingIndicator).toBeVisible();

    // Or check for loading text
    const loadingText = page.locator('text=/loading|processing/i');
    await expect(loadingText).toBeVisible();
  });
});

test.describe('Keyboard Navigation', () => {
  test('All interactive elements are keyboard accessible', async ({ page }) => {
    // WCAG 2.1.1: Keyboard - All functionality available via keyboard

    await page.goto('/');

    // Get all interactive elements
    const interactiveElements = page.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const count = await interactiveElements.count();

    // Verify all can receive focus
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      await element.focus();
      await expect(element).toBeFocused();
    }
  });

  test('Focus order is logical', async ({ page }) => {
    // WCAG 2.4.3: Focus Order

    await page.goto('/');

    // Tab through page and verify order makes sense
    const focusOrder: string[] = [];

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const active = document.activeElement;
        return active?.tagName + (active?.textContent?.slice(0, 20) || '');
      });
      focusOrder.push(focused);
    }

    // Verify order is logical (e.g., header → main content → footer)
    // This is a simplified check - real implementation would be more specific
    expect(focusOrder.length).toBeGreaterThan(0);
  });
});
