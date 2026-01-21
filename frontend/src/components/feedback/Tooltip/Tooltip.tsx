import type { ReactNode } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({ content, children, position = 'top', className = '' }: TooltipProps) {
  return (
    <div className={`tooltip-wrapper ${className}`}>
      {children}
      <div className={`tooltip tooltip-${position}`}>
        <div className="tooltip-content">
          {content}
        </div>
        <div className="tooltip-arrow" />
      </div>
    </div>
  );
}
