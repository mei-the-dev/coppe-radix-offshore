import { Button } from '../../atoms';
import './TabButton.css';

interface TabButtonProps {
  active?: boolean;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
  'aria-controls'?: string;
  'aria-selected'?: boolean;
}

export function TabButton({
  active = false,
  onClick,
  onKeyDown,
  children,
  className = '',
  id,
  'aria-controls': ariaControls,
  'aria-selected': ariaSelected,
}: TabButtonProps) {
  const classes = [
    'molecule-tab-button',
    active && 'molecule-tab-button--active',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // WCAG: Tab buttons should have proper ARIA attributes
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={classes}
      id={id}
      role="tab"
      aria-selected={ariaSelected !== undefined ? ariaSelected : active}
      aria-controls={ariaControls}
      tabIndex={active ? 0 : -1}
    >
      {children}
    </Button>
  );
}
