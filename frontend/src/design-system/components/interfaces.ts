/**
 * Standard Component Interface Definitions
 *
 * Defines standard prop interfaces for components organized by intent:
 * - Action: Components that trigger behaviors
 * - Display: Components that present information
 * - Navigation: Components that guide users
 * - Feedback: Components that communicate status
 * - Layout: Components that define structure
 *
 * Legacy atomic design categorization is maintained for backward compatibility.
 */

import React from 'react';

// ===== Action Components =====
// Components that trigger behaviors and allow users to manipulate data

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  helpText?: string;
  errorMessage?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export interface TextareaProps {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  showCount?: boolean;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  errorMessage?: string;
  label?: string;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  labelPosition?: 'left' | 'right';
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  value?: string;
  'aria-label'?: string;
}

export interface RadioProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  name: string;
  value: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  icon?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square' | 'rounded';
  className?: string;
}

export interface LinkProps {
  href: string;
  variant?: 'default' | 'primary' | 'secondary';
  external?: boolean;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

// ===== Display Components =====
// Components that present information to the user without direct interaction

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  'aria-label'?: string;
}

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  helpText?: string;
  error?: boolean;
  errorMessage?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  onSearch?: (query: string) => void;
  showClearButton?: boolean;
  className?: string;
  'aria-label'?: string;
}

export interface TabsProps {
  items: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultActiveId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

// ===== Navigation Components =====
// Components that guide users through the application or a set of content

// ===== Feedback Components =====
// Components that communicate the status of the system or the result of a user action

// ===== Layout Components =====
// Components that define the structure and arrangement of other components

// ===== Legacy Organisms =====
// Complex components (maintained for backward compatibility)

export interface SidebarProps {
  items: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    badge?: number | string;
    active?: boolean;
  }>;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
    sortable?: boolean;
  }>;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}

// All interfaces are already exported above




