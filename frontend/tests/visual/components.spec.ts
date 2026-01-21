import { test, expect } from '@playwright/test'

test.describe('Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.dashboard', { timeout: 10000 })
  })

  test('badge components have correct colors', async ({ page }) => {
    await page.click('text=Planning')
    await page.waitForSelector('.atom-badge', { timeout: 5000 })

    const badges = page.locator('.atom-badge')
    const count = await badges.count()

    if (count > 0) {
      // Take screenshot of first badge
      await expect(badges.first()).toHaveScreenshot('badge-styling.png')

      // Check computed styles
      const backgroundColor = await badges.first().evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })

      // Should have a background color (not transparent)
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    }
  })

  test('cards have hover effects', async ({ page }) => {
    await page.click('text=Planning')
    await page.waitForSelector('.molecule-card--hoverable', { timeout: 5000 })

    const card = page.locator('.molecule-card--hoverable').first()

    // Hover over card
    await card.hover()

    // Wait for transition
    await page.waitForTimeout(200)

    // Check if transform is applied (hover effect)
    const transform = await card.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })

    // Transform should be applied on hover
    expect(transform).not.toBe('none')

    await expect(card).toHaveScreenshot('card-hover.png')
  })

  test('typography uses correct font', async ({ page }) => {
    await page.click('text=Planning')
    await page.waitForSelector('.dashboard', { timeout: 5000 })

    const heading = page.locator('h2, h3').first()

    const fontFamily = await heading.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily
    })

    // Should use Inter font (or fallback)
    expect(fontFamily.toLowerCase()).toContain('inter')
  })
})
