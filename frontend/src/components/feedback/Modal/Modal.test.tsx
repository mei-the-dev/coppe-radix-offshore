import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils/testUtils';
import { Modal } from './Modal';

describe('Modal', () => {
  it('does not render when open is false', () => {
    render(
      <Modal.Root open={false} onOpenChange={vi.fn()}>
        <Modal.Content>Content</Modal.Content>
      </Modal.Root>
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(
      <Modal.Root open={true} onOpenChange={vi.fn()}>
        <Modal.Content>Content</Modal.Content>
      </Modal.Root>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders header with title and close button', () => {
    const handleClose = vi.fn();
    render(
      <Modal.Root open={true} onOpenChange={handleClose}>
        <Modal.Header>
          <Modal.Title>Modal Title</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Content>Content</Modal.Content>
      </Modal.Root>
    );

    expect(screen.getByText('Modal Title')).toBeInTheDocument();
    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toBeInTheDocument();

    closeButton.click();
    expect(handleClose).toHaveBeenCalledWith(false);
  });

  it('renders footer', () => {
    render(
      <Modal.Root open={true} onOpenChange={vi.fn()}>
        <Modal.Content>Content</Modal.Content>
        <Modal.Footer>Footer</Modal.Footer>
      </Modal.Root>
    );
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('closes when overlay is clicked', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Modal.Root open={true} onOpenChange={handleClose}>
        <Modal.Content>Content</Modal.Content>
      </Modal.Root>
    );

    const overlay = container.querySelector('.feedback-modal__overlay');
    overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handleClose).toHaveBeenCalledWith(false);
  });

  it('has role="dialog" and aria-modal="true"', () => {
    const { container } = render(
      <Modal.Root open={true} onOpenChange={vi.fn()}>
        <Modal.Content>Content</Modal.Content>
      </Modal.Root>
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
