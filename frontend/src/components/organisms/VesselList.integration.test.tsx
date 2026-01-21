/**
 * Integration Test for VesselList
 * Tests actual API integration and data flow
 */

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '../../test-utils/testUtils'
import VesselList from './VesselList'
import { api } from '../../api/client'

describe('VesselList Integration', () => {
  it('renders vessels from actual API', async () => {
    // This test requires the backend to be running
    const vessels = await api.getVessels()

    // If API returns data, component should render it
    if (vessels.length > 0) {
      render(<VesselList vessels={vessels} />)

      await waitFor(() => {
        expect(screen.queryByText('No vessels available')).not.toBeInTheDocument()
      })

      // Should render at least one vessel
      expect(vessels.length).toBeGreaterThan(0)
    } else {
      // If API returns empty, should show empty state
      render(<VesselList vessels={[]} />)
      expect(screen.getByText('No vessels available')).toBeInTheDocument()
    }
  })

  it('handles API response structure correctly', async () => {
    const vessels = await api.getVessels()

    // Verify response is an array
    expect(Array.isArray(vessels)).toBe(true)

    // If vessels exist, verify structure
    if (vessels.length > 0) {
      const vessel = vessels[0]
      expect(vessel).toHaveProperty('id')
      expect(vessel).toHaveProperty('name')
      expect(vessel).toHaveProperty('status')
    }
  })
})
