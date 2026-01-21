import { cn } from '../../../lib/utils';
import './Alert.css';

export interface AlertProps {
  severity?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

/**
 * Alert Component
 *
 * Displays important messages to the user about the state of the application.
 */
export function Alert({
  severity = 'info',
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  return (
    <div
      className={cn(
        'feedback-alert',
        `feedback-alert--${severity}`,
        className
      )}
      role="alert"
    >
      <div className="feedback-alert__content">
        {title && (
          <div className="feedback-alert__title">{title}</div>
        )}
        <div className="feedback-alert__message">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="feedback-alert__close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}
