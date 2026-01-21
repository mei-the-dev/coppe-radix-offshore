import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils/testUtils'
import { Card } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Test Content</Card>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies default variant class', () => {
    const { container } = render(<Card>Test</Card>)
    const card = container.querySelector('.molecule-card--default')
    expect(card).toBeInTheDocument()
  })

  it('applies padding variant', () => {
    const { container } = render(<Card padding="md">Test</Card>)
    const card = container.querySelector('.molecule-card--padding-md')
    expect(card).toBeInTheDocument()
  })

  it('applies hoverable class when hoverable', () => {
    const { container } = render(<Card hoverable>Test</Card>)
    const card = container.querySelector('.molecule-card--hoverable')
    expect(card).toBeInTheDocument()
  })

  it('renders as button when onClick provided', () => {
    const handleClick = () => {}
    const { container } = render(<Card onClick={handleClick}>Test</Card>)
    const button = container.querySelector('button.molecule-card--clickable')
    expect(button).toBeInTheDocument()
  })

  it('renders as article when no onClick', () => {
    const { container } = render(<Card>Test</Card>)
    const article = container.querySelector('article.molecule-card')
    expect(article).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Test</Card>)
    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })
})
