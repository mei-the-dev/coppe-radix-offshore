import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';
import './IconButton.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: React.ReactNode;
  'aria-label': string; // Required for icon-only buttons
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

/**
 * IconButton Component
 *
 * A separate component from Button per curriculum principles.
 * IconButton has different behavior (may trigger popovers) and structure (icon-only).
 * This is not a variant of Button but a distinct component.
 */
export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  className,
  'aria-label': ariaLabel,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'action-icon-button',
        `action-icon-button--${variant}`,
        `action-icon-button--${size}`,
        className
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
}
