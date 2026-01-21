import { cn } from '../../../lib/utils';
import './Stack.css';

export interface StackProps {
  direction?: 'row' | 'column';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  children: React.ReactNode;
  className?: string;
}

/**
 * Stack Component
 *
 * A layout component that arranges children in a stack (row or column) with consistent spacing.
 */
export function Stack({
  direction = 'column',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  children,
  className,
}: StackProps) {
  return (
    <div
      className={cn(
        'layout-stack',
        `layout-stack--${direction}`,
        `layout-stack--gap-${gap}`,
        `layout-stack--align-${align}`,
        `layout-stack--justify-${justify}`,
        className
      )}
    >
      {children}
    </div>
  );
}
