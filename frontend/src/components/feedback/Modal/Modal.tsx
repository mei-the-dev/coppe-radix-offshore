import { createContext, useContext, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { modalBackdrop, modalContent } from '../../../design-system/animations';
import './Modal.css';

interface ModalContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within Modal.Root');
  }
  return context;
}

/**
 * Modal.Root
 *
 * Root container for modal. Uses composition pattern instead of configuration.
 */
function ModalRoot({
  open,
  onOpenChange,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <ModalContext.Provider value={{ open, onOpenChange }}>
          <motion.div
            className={cn('feedback-modal__overlay', className)}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onOpenChange(false);
              }
            }}
            role="dialog"
            aria-modal="true"
            {...modalBackdrop}
          >
            <motion.div
              className="feedback-modal__container"
              {...modalContent}
            >
              {children}
            </motion.div>
          </motion.div>
        </ModalContext.Provider>
      )}
    </AnimatePresence>
  );
}

/**
 * Modal.Header
 *
 * Header section of the modal.
 */
function ModalHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('feedback-modal__header', className)}>
      {children}
    </header>
  );
}

/**
 * Modal.Title
 *
 * Title of the modal.
 */
function ModalTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn('feedback-modal__title', className)}>
      {children}
    </h2>
  );
}

/**
 * Modal.CloseButton
 *
 * Close button for the modal.
 */
function ModalCloseButton({
  className,
  'aria-label': ariaLabel = 'Close modal',
}: {
  className?: string;
  'aria-label'?: string;
}) {
  const { onOpenChange } = useModalContext();

  return (
    <button
      type="button"
      className={cn('feedback-modal__close', className)}
      onClick={() => onOpenChange(false)}
      aria-label={ariaLabel}
    >
      ×
    </button>
  );
}

/**
 * Modal.Content
 *
 * Main content area of the modal.
 */
function ModalContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('feedback-modal__content', className)}>
      {children}
    </div>
  );
}

/**
 * Modal.Footer
 *
 * Footer section of the modal.
 */
function ModalFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <footer className={cn('feedback-modal__footer', className)}>
      {children}
    </footer>
  );
}

/**
 * Modal Component (Composition Pattern)
 *
 * Uses composition instead of configuration. Build modals by composing
 * Modal.Root, Modal.Header, Modal.Content, Modal.Footer, etc.
 *
 * Example:
 * ```tsx
 * <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
 *   <Modal.Header>
 *     <Modal.Title>Title</Modal.Title>
 *     <Modal.CloseButton />
 *   </Modal.Header>
 *   <Modal.Content>Content</Modal.Content>
 *   <Modal.Footer>
 *     <Button>Cancel</Button>
 *     <Button variant="primary">Confirm</Button>
 *   </Modal.Footer>
 * </Modal.Root>
 * ```
 */
export const Modal = {
  Root: ModalRoot,
  Header: ModalHeader,
  Title: ModalTitle,
  CloseButton: ModalCloseButton,
  Content: ModalContent,
  Footer: ModalFooter,
};
