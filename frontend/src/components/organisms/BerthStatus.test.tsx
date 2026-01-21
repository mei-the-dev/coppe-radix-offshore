import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils/testUtils'
import BerthStatus from './BerthStatus'
import { createMockBerth } from '../../test-utils/testUtils'
import type { Berth } from '../../types'

describe('BerthStatus', () => {
  it('renders empty state when no berths', () => {
    render(<BerthStatus berths={[]} />)
    expect(screen.getByText('No berths available')).toBeInTheDocument()
  })

  it('renders berths when data is provided', () => {
    const berths: Berth[] = [
      createMockBerth({ id: 'berth-1', name: 'Berth 1' }),
      createMockBerth({ id: 'berth-2', name: 'Berth 2' }),
    ]

    render(<BerthStatus berths={berths} />)

    expect(screen.getByText('Berth 1')).toBeInTheDocument()
    expect(screen.getByText('Berth 2')).toBeInTheDocument()
  })

  it('displays berth status badge', () => {
    const berths: Berth[] = [
      createMockBerth({ id: 'berth-1', name: 'Berth 1', status: 'available' }),
    ]

    render(<BerthStatus berths={berths} />)

    expect(screen.getByText('available')).toBeInTheDocument()
  })

  it('displays berth specifications', () => {
    const berths: Berth[] = [
      createMockBerth({
        id: 'berth-1',
        name: 'Test Berth',
        maxDraught: 6.5,
        maxLength: 100,
        maxDeadweight: 5000,
      }),
    ]

    render(<BerthStatus berths={berths} />)

    expect(screen.getByText('Test Berth')).toBeInTheDocument()
    expect(screen.getByText('Max Draught:')).toBeInTheDocument()
    expect(screen.getByText('6.5m')).toBeInTheDocument()
    expect(screen.getByText('Max Length:')).toBeInTheDocument()
    expect(screen.getByText('100m')).toBeInTheDocument()
    expect(screen.getByText('Max DWT:')).toBeInTheDocument()
    expect(screen.getByText('5000t')).toBeInTheDocument()
  })

  it('displays current vessel if assigned', () => {
    const berths: Berth[] = [
      createMockBerth({
        id: 'berth-1',
        name: 'Test Berth',
        currentVesselId: 'vessel-001',
      }),
    ]

    render(<BerthStatus berths={berths} />)

    expect(screen.getByText('Current Vessel:')).toBeInTheDocument()
    expect(screen.getByText('vessel-001')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const berths: Berth[] = [createMockBerth()]
    const { container } = render(<BerthStatus berths={berths} />)

    const berthStatus = container.querySelector('.berth-status')
    expect(berthStatus).toBeInTheDocument()

    const card = container.querySelector('.molecule-card')
    expect(card).toBeInTheDocument()
  })
})
