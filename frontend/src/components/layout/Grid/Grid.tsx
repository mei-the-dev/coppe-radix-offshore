import { cn } from '../../../lib/utils';
import './Grid.css';

export interface GridProps {
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
}

/**
 * Grid Component
 *
 * A layout component that arranges children in a responsive grid.
 */
export function Grid({
  columns = 12,
  gap = 'md',
  children,
  className,
}: GridProps) {
  const columnsClass = typeof columns === 'number'
    ? `layout-grid--cols-${columns}`
    : Object.entries(columns)
        .map(([breakpoint, cols]) => `layout-grid--cols-${breakpoint}-${cols}`)
        .join(' ');

  return (
    <div
      className={cn(
        'layout-grid',
        columnsClass,
        `layout-grid--gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
}
