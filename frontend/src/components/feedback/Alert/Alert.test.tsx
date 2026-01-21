import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils/testUtils';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('applies severity class', () => {
    const { container } = render(<Alert severity="error">Error</Alert>);
    const alert = container.querySelector('.feedback-alert--error');
    expect(alert).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Alert title="Error Title">Error message</Alert>);
    expect(screen.getByText('Error Title')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<Alert>Alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('shows close button when onClose provided', () => {
    const handleClose = vi.fn();
    render(<Alert onClose={handleClose}>Alert</Alert>);
    const closeButton = screen.getByLabelText('Close alert');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(<Alert onClose={handleClose}>Alert</Alert>);
    screen.getByLabelText('Close alert').click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(<Alert className="custom-class">Alert</Alert>);
    const alert = container.querySelector('.custom-class');
    expect(alert).toBeInTheDocument();
  });
});
