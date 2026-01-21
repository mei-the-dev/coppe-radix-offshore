import type { LabelHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';
import './Label.css';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}

export function Label({
  required = false,
  error = false,
  children,
  className = '',
  htmlFor,
  ...props
}: LabelProps) {
  const classes = cn(
    'atom-label',
    required && 'atom-label--required',
    error && 'atom-label--error',
    className
  );

  // WCAG: Properly associate label with form control
  return (
    <label
      className={classes}
      htmlFor={htmlFor}
      aria-required={required}
      {...props}
    >
      {children}
      {required && (
        <span
          className="atom-label__asterisk"
          aria-label="required field"
          aria-hidden="false"
        >
          *
        </span>
      )}
      {error && (
        <span className="sr-only" role="alert">
          Error: This field has an error
        </span>
      )}
    </label>
  );
}
