import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils/testUtils';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    const { container } = render(<Button>Test</Button>);
    const button = container.querySelector('.atom-button--primary');
    expect(button).toBeInTheDocument();
  });

  it('applies variant class', () => {
    const { container } = render(<Button variant="secondary">Test</Button>);
    const button = container.querySelector('.atom-button--secondary');
    expect(button).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<Button size="sm">Test</Button>);
    const button = container.querySelector('.atom-button--sm');
    expect(button).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it('shows loading state', () => {
    const { container } = render(<Button loading>Loading</Button>);
    const spinner = container.querySelector('.atom-button__spinner');
    expect(spinner).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Button fullWidth>Full</Button>);
    const button = container.querySelector('.atom-button--full-width');
    expect(button).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Test</Button>);
    const button = container.querySelector('.custom-class');
    expect(button).toBeInTheDocument();
  });

  it('has accessible name when aria-label provided', () => {
    render(<Button aria-label="Close dialog">×</Button>);
    const button = screen.getByLabelText('Close dialog');
    expect(button).toBeInTheDocument();
  });
});
