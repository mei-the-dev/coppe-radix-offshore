import { test, expect } from '@playwright/test'

test.describe('Simulation Tab Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.dashboard', { timeout: 10000 })
  })

  test('simulation tab renders correctly', async ({ page }) => {
    await page.click('text=Simulation')

    await page.waitForSelector('.dashboard-section', { timeout: 5000 })

    await expect(page).toHaveScreenshot('simulation-tab.png', {
      fullPage: true,
    })
  })

  test('simulation controls are visible', async ({ page }) => {
    await page.click('text=Simulation')

    // Check for simulation controls
    const startButton = page.locator('text=/Start|Play/i').first()
    await expect(startButton).toBeVisible({ timeout: 5000 })

    await expect(page.locator('.dashboard-section').first()).toHaveScreenshot('simulation-controls.png')
  })
})
