import { useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Button } from '../Button';
import { cn } from '../../../lib/utils';
import './SplitButton.css';

export interface SplitButtonProps extends Omit<ButtonHTMLAttributes<HTMLDivElement>, 'onClick'> {
  label: string;
  onClick: () => void;
  onMenuClick?: () => void;
  menuItems?: Array<{ label: string; onClick: () => void }>;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

/**
 * SplitButton Component
 *
 * A separate component from Button per curriculum principles.
 * SplitButton has different behavior (dropdown menu) and structure (two-part button).
 * This is not a variant of Button but a distinct component.
 */
export function SplitButton({
  label,
  onClick,
  onMenuClick,
  menuItems,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  ...props
}: SplitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('action-split-button', className)} {...props}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onClick}
        className="action-split-button__main"
      >
        {label}
      </Button>
      <button
        type="button"
        className={cn(
          'action-split-button__menu',
          `action-split-button__menu--${variant}`,
          `action-split-button__menu--${size}`,
          isOpen && 'action-split-button__menu--open'
        )}
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          onMenuClick?.();
        }}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && menuItems && menuItems.length > 0 && (
        <div className="action-split-button__dropdown" role="menu">
          {menuItems.map((item, index) => (
            <button
              key={index}
              type="button"
              className="action-split-button__dropdown-item"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              role="menuitem"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
