import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../test-utils/testUtils';
import { SplitButton } from './SplitButton';

describe('SplitButton', () => {
  it('renders label', () => {
    render(<SplitButton label="Actions" onClick={vi.fn()} />);
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('handles main button click', () => {
    const handleClick = vi.fn();
    render(<SplitButton label="Actions" onClick={handleClick} />);
    screen.getByText('Actions').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('opens dropdown when menu button clicked', async () => {
    render(
      <SplitButton
        label="Actions"
        onClick={vi.fn()}
        menuItems={[
          { label: 'Option 1', onClick: vi.fn() },
          { label: 'Option 2', onClick: vi.fn() },
        ]}
      />
    );

    const menuButton = screen.getByLabelText('Open menu');
    menuButton.click();

    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  it('applies variant class', () => {
    const { container } = render(
      <SplitButton label="Actions" onClick={vi.fn()} variant="secondary" />
    );
    const menuButton = container.querySelector('.action-split-button__menu--secondary');
    expect(menuButton).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<SplitButton label="Actions" onClick={vi.fn()} disabled />);
    const button = screen.getByRole('button', { name: /actions/i });
    expect(button).toBeDisabled();
  });
});
