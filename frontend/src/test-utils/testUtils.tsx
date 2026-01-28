/**
 * Test Utilities
 * Custom render function, mock API client, test data factories
 */

import * as RTL from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

// screen and waitFor from RTL (re-exported from @testing-library/dom at runtime; types may not be declared in RTL)
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- RTL re-exports from dom; use any so tests type-check
export const screen = (RTL as Record<string, unknown>).screen as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const waitFor = (RTL as Record<string, unknown>).waitFor as any

/**
 * Custom render function with providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return RTL.render(ui, {
    ...options,
  })
}

/**
 * Mock API client for testing
 */
export const mockAPI = {
  getVessels: async () => [
    {
      id: 'vessel-001',
      name: 'Test Vessel',
      type: 'Standard PSV',
      status: 'available',
      deckCargoCapacity: 2450,
      liquidMudCapacity: 2500,
      currentLocation: 'Porto do Açu',
    },
  ],
  getBerths: async () => [
    {
      id: 'berth-001',
      name: 'Test Berth',
      status: 'available',
      maxDraught: 6.5,
      maxLength: 100,
      maxDeadweight: 5000,
    },
  ],
  getLoadingPlans: async () => [],
}

/**
 * Test data factories
 */
export const createMockVessel = (overrides = {}) => ({
  id: 'vessel-001',
  name: 'PSV Standard Alpha',
  type: 'Standard PSV' as const,
  lengthOverall: 71.9,
  beam: 16,
  draughtLoaded: 5.7,
  deckCargoCapacity: 2450,
  clearDeckArea: 950,
  totalDeadweight: 4500,
  fuelOilCapacity: 994,
  freshWaterCapacity: 812,
  liquidMudCapacity: 2500,
  dryBulkCapacity: 600,
  serviceSpeed: 15.1,
  operationalSpeed: 13,
  dpClass: 'DP-2' as const,
  status: 'available' as const,
  currentLocation: 'Porto do Açu',
  ...overrides,
})

export const createMockBerth = (overrides = {}) => ({
  id: 'berth-001',
  name: 'Berth 1',
  port: 'Porto do Açu' as const,
  status: 'available' as const,
  maxDraught: 6.5,
  maxLength: 100,
  maxDeadweight: 5000,
  ...overrides,
})

export const createMockLoadingPlan = (overrides = {}) => ({
  id: 'plan-001',
  vesselId: 'vessel-001',
  berthId: 'berth-001',
  scheduledStart: new Date().toISOString(),
  estimatedDuration: 24,
  status: 'scheduled' as const,
  cargoItems: [],
  isValid: true,
  validationErrors: [],
  ...overrides,
})

export * from '@testing-library/react'
export { customRender as render }
