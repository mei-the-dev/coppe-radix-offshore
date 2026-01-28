import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils/testUtils'
import VesselList from './VesselList'
import { createMockVessel } from '../../test-utils/testUtils'
import type { Vessel } from '../../types'

describe('VesselList', () => {
  it('renders empty state when no vessels', () => {
    render(<VesselList vessels={[]} />)
    expect(screen.getByText('No vessels available')).toBeInTheDocument()
  })

  it('renders vessels when data is provided', () => {
    const vessels: Vessel[] = [
      createMockVessel({ id: 'vessel-1', name: 'Vessel 1' }),
      createMockVessel({ id: 'vessel-2', name: 'Vessel 2' }),
    ]

    render(<VesselList vessels={vessels} />)

    expect(screen.getByText('Vessel 1')).toBeInTheDocument()
    expect(screen.getByText('Vessel 2')).toBeInTheDocument()
  })

  it('displays vessel status badge', () => {
    const vessels: Vessel[] = [
      createMockVessel({ id: 'vessel-1', name: 'Vessel 1', status: 'available' }),
    ]

    render(<VesselList vessels={vessels} />)

    expect(screen.getByText('available')).toBeInTheDocument()
  })

  it('displays vessel details', () => {
    const vessels: Vessel[] = [
      createMockVessel({
        id: 'vessel-1',
        name: 'Test Vessel',
        type: 'Standard PSV',
        currentLocation: 'Porto do Açu',
        deckCargoCapacity: 2450,
        liquidMudCapacity: 2500,
      }),
    ]

    render(<VesselList vessels={vessels} />)

    expect(screen.getByText('Test Vessel')).toBeInTheDocument()
    expect(screen.getByText('Standard PSV')).toBeInTheDocument()
    expect(screen.getByText('Porto do Açu')).toBeInTheDocument()
    expect(screen.getByText('Deck: 2450t')).toBeInTheDocument()
    expect(screen.getByText('Liquid: 2500m³')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const vessels: Vessel[] = [createMockVessel()]
    const { container } = render(<VesselList vessels={vessels} />)

    const vesselList = container.querySelector('.vessel-list')
    expect(vesselList).toBeInTheDocument()

    const card = container.querySelector('.molecule-card')
    expect(card).toBeInTheDocument()
  })

  it('handles null/undefined vessels gracefully', () => {
    render(<VesselList vessels={[]} />)
    expect(screen.getByText('No vessels available')).toBeInTheDocument()
  })
})
