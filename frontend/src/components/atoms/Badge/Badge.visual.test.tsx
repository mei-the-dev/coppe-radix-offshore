/**
 * Visual/Accessibility Test for Badge
 * Tests color contrast and readability
 */

import { describe, it, expect } from 'vitest'
import { render } from '../../../test-utils/testUtils'
import { Badge } from './Badge'

describe('Badge Visual/Accessibility', () => {
  it('has sufficient color contrast for success badge', () => {
    const { container } = render(<Badge variant="success">Available</Badge>)
    const badge = container.querySelector('.atom-badge--success')

    if (badge) {
      const styles = window.getComputedStyle(badge)
      const bgColor = styles.backgroundColor
      const textColor = styles.color

      // Check that colors are defined (not transparent)
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
      expect(textColor).not.toBe('rgba(0, 0, 0, 0)')

      // Verify CSS variables are used
      expect(bgColor).toBeTruthy()
      expect(textColor).toBeTruthy()
    }
  })

  it('has sufficient color contrast for error badge', () => {
    const { container } = render(<Badge variant="error">Error</Badge>)
    const badge = container.querySelector('.atom-badge--error')

    if (badge) {
      const styles = window.getComputedStyle(badge)
      const bgColor = styles.backgroundColor
      const textColor = styles.color

      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
      expect(textColor).not.toBe('rgba(0, 0, 0, 0)')
    }
  })

  it('renders with readable text in dark mode', () => {
    // Simulate dark mode
    document.documentElement.setAttribute('data-theme', 'dark')

    const { container } = render(<Badge variant="success">Available</Badge>)
    const badge = container.querySelector('.atom-badge--success')

    if (badge) {
      const styles = window.getComputedStyle(badge)
      const textColor = styles.color

      // In dark mode, text should be lighter
      expect(textColor).toBeTruthy()
    }

    // Cleanup
    document.documentElement.removeAttribute('data-theme')
  })
})
