import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../../../test-utils/testUtils';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders message', () => {
    render(<Toast message="Toast message" onClose={vi.fn()} />);
    expect(screen.getByText('Toast message')).toBeInTheDocument();
  });

  it('applies severity class', () => {
    const { container } = render(
      <Toast message="Error" severity="error" onClose={vi.fn()} />
    );
    const toast = container.querySelector('.feedback-toast--error');
    expect(toast).toBeInTheDocument();
  });

  it('has role="status" and aria-live="polite"', () => {
    render(<Toast message="Toast" onClose={vi.fn()} />);
    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('auto-closes after duration', () => {
    const handleClose = vi.fn();
    render(<Toast message="Toast" duration={1000} onClose={handleClose} />);

    expect(handleClose).not.toHaveBeenCalled();

    // Advance timers - useEffect should trigger onClose
    vi.advanceTimersByTime(1000);

    // With fake timers, the callback should be called synchronously
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not auto-close when duration is 0', () => {
    const handleClose = vi.fn();
    render(<Toast message="Toast" duration={0} onClose={handleClose} />);

    vi.advanceTimersByTime(10000);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(<Toast message="Toast" onClose={handleClose} />);
    screen.getByLabelText('Close toast').click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
