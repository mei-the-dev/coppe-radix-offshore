import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils/testUtils'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('applies default variant class', () => {
    const { container } = render(<Badge>Test</Badge>)
    const badge = container.querySelector('.atom-badge--default')
    expect(badge).toBeInTheDocument()
  })

  it('applies variant class', () => {
    const { container } = render(<Badge variant="success">Test</Badge>)
    const badge = container.querySelector('.atom-badge--success')
    expect(badge).toBeInTheDocument()
  })

  it('applies size class', () => {
    const { container } = render(<Badge size="sm">Test</Badge>)
    const badge = container.querySelector('.atom-badge--sm')
    expect(badge).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>)
    const badge = container.querySelector('.custom-class')
    expect(badge).toBeInTheDocument()
  })

  it('renders as span element', () => {
    const { container } = render(<Badge>Test</Badge>)
    const span = container.querySelector('span.atom-badge')
    expect(span).toBeInTheDocument()
  })
})
