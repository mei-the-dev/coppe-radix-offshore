import { useEffect } from 'react';
import { cn } from '../../../lib/utils';
import './Toast.css';

export interface ToastProps {
  message: string;
  severity?: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
  className?: string;
}

/**
 * Toast Component
 *
 * Displays temporary notifications that appear and disappear automatically.
 */
export function Toast({
  message,
  severity = 'info',
  duration = 5000,
  onClose,
  className,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'feedback-toast',
        `feedback-toast--${severity}`,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="feedback-toast__message">{message}</div>
      <button
        type="button"
        className="feedback-toast__close"
        onClick={onClose}
        aria-label="Close toast"
      >
        ×
      </button>
    </div>
  );
}
