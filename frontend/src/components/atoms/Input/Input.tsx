import { forwardRef } from 'react';
import type { InputProps as DesignSystemInputProps } from '../../../design-system/components/interfaces';
import { Label } from '../Label';
import { cn } from '../../../lib/utils';
import './Input.css';

interface InputProps extends DesignSystemInputProps {
  id?: string;
  name?: string;
  errorMessage?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  error = false,
  disabled = false,
  required = false,
  readOnly = false,
  helpText,
  errorMessage,
  label,
  size = 'md',
  className = '',
  id,
  name,
  autoComplete,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
  const helpTextId = helpText ? `${inputId}-help` : undefined;
  const errorId = error && errorMessage ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, helpTextId, errorId].filter(Boolean).join(' ') || undefined;

  const classes = cn(
    'atom-input',
    `atom-input--${size}`,
    error && 'atom-input--error',
    disabled && 'atom-input--disabled',
    readOnly && 'atom-input--readonly',
    className
  );

  return (
    <div className="atom-input-wrapper">
      {label && (
        <Label
          htmlFor={inputId}
          required={required}
          error={error}
        >
          {label}
        </Label>
      )}
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        className={classes}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        autoComplete={autoComplete}
        aria-label={ariaLabel || (label ? undefined : placeholder)}
        aria-describedby={describedBy}
        aria-invalid={error}
        aria-required={required}
        aria-disabled={disabled}
        {...props}
      />
      {helpText && !error && (
        <div id={helpTextId} className="atom-input__help-text">
          {helpText}
        </div>
      )}
      {error && errorMessage && (
        <div
          id={errorId}
          className="atom-input__error-message"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
