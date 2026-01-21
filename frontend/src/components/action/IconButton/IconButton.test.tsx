import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils/testUtils';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  const TestIcon = () => <svg data-testid="icon"><circle /></svg>;

  it('renders icon', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Test" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('requires aria-label', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Close" />);
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('applies variant class', () => {
    const { container } = render(
      <IconButton icon={<TestIcon />} aria-label="Test" variant="primary" />
    );
    const button = container.querySelector('.action-icon-button--primary');
    expect(button).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(
      <IconButton icon={<TestIcon />} aria-label="Test" size="lg" />
    );
    const button = container.querySelector('.action-icon-button--lg');
    expect(button).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(
      <IconButton icon={<TestIcon />} aria-label="Test" onClick={handleClick} />
    );
    screen.getByLabelText('Test').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<IconButton icon={<TestIcon />} aria-label="Test" disabled />);
    const button = screen.getByLabelText('Test');
    expect(button).toBeDisabled();
  });
});
