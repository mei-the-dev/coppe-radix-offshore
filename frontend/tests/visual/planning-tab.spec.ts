import { test, expect } from '@playwright/test'

test.describe('Planning Tab Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for data to load
    await page.waitForSelector('.dashboard', { timeout: 10000 })
  })

  test('planning tab renders correctly', async ({ page }) => {
    // Click on Planning tab
    await page.click('text=Planning')

    // Wait for content to render
    await page.waitForSelector('.dashboard-grid', { timeout: 5000 })

    // Take screenshot
    await expect(page).toHaveScreenshot('planning-tab.png', {
      fullPage: true,
    })
  })

  test('vessel list renders with cards', async ({ page }) => {
    await page.click('text=Planning')
    await page.waitForSelector('.vessel-list', { timeout: 5000 })

    // Check if vessels are rendered
    const vesselList = page.locator('.vessel-list')
    await expect(vesselList).toBeVisible()

    // Take screenshot of vessel list section
    await expect(vesselList).toHaveScreenshot('vessel-list.png')
  })

  test('berth status renders with cards', async ({ page }) => {
    await page.click('text=Planning')
    await page.waitForSelector('.berth-status', { timeout: 5000 })

    const berthStatus = page.locator('.berth-status')
    await expect(berthStatus).toBeVisible()

    await expect(berthStatus).toHaveScreenshot('berth-status.png')
  })

  test('cards have correct styling (shadow, no border)', async ({ page }) => {
    await page.click('text=Planning')
    await page.waitForSelector('.molecule-card', { timeout: 5000 })

    const card = page.locator('.molecule-card').first()

    // Check computed styles
    const boxShadow = await card.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow
    })

    const border = await card.evaluate((el) => {
      return window.getComputedStyle(el).border
    })

    // Should have shadow
    expect(boxShadow).not.toBe('none')

    // Should not have border (or border should be 0px)
    expect(border).toMatch(/0px|none/)

    await expect(card).toHaveScreenshot('card-styling.png')
  })
})
