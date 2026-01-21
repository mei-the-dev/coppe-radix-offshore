import type { BadgeProps } from '../../../design-system/components/interfaces';
import { cn } from '../../../lib/utils';
import './Badge.css';

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  return (
    <span className={cn(
      'atom-badge',
      `atom-badge--${variant}`,
      `atom-badge--${size}`,
      className
    )}>
      {children}
    </span>
  );
}
