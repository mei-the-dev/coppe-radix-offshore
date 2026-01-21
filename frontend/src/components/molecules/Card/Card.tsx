import type { CardProps } from '../../../design-system/components/interfaces';
import { cn } from '../../../lib/utils';
import './Card.css';

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className,
  onClick,
  hoverable = false,
}: CardProps) {
  // WCAG: If clickable, use button with proper ARIA
  if (onClick) {
    return (
      <button
        className={cn(
          'molecule-card',
          `molecule-card--${variant}`,
          `molecule-card--padding-${padding}`,
          hoverable && 'molecule-card--hoverable',
          'molecule-card--clickable',
          className
        )}
        onClick={onClick}
        type="button"
        aria-label={typeof children === 'string' ? children : undefined}
      >
        {children}
      </button>
    );
  }

  return (
    <article className={cn(
      'molecule-card',
      `molecule-card--${variant}`,
      `molecule-card--padding-${padding}`,
      hoverable && 'molecule-card--hoverable',
      className
    )}>
      {children}
    </article>
  );
}
