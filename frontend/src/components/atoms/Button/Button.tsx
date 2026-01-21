import type { ButtonHTMLAttributes } from 'react';
import type { ButtonProps } from '../../../design-system/components/interfaces';
import { cn } from '../../../lib/utils';
import './Button.css';

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  className,
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  // WCAG: Provide accessible name if children are only icons
  const hasAccessibleName = ariaLabel || (typeof children === 'string' && children.trim().length > 0);

  // WCAG: Loading state should be announced
  const buttonAriaLabel = loading
    ? ariaLabel || (typeof children === 'string' ? `${children} (loading)` : 'Loading')
    : ariaLabel;

  return (
    <button
      type={type}
      className={cn(
        'atom-button',
        `atom-button--${variant}`,
        `atom-button--${size}`,
        fullWidth && 'atom-button--full-width',
        disabled && 'atom-button--disabled',
        loading && 'atom-button--loading',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={buttonAriaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="atom-button__spinner"
          aria-hidden="true"
          role="status"
          aria-live="polite"
        />
      )}
      <span className="atom-button__content" aria-hidden={loading}>
        {children}
      </span>
      {loading && !hasAccessibleName && (
        <span className="sr-only">Loading</span>
      )}
    </button>
  );
}
