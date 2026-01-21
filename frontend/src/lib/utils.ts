/**
 * Utility functions for class management
 * Inspired by shadcn/ui
 */
import { type ClassValue, clsx } from 'clsx';

/**
 * Merges class names with tailwind-merge for conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  // For now, use clsx. If Tailwind is added later, use tailwind-merge
  return clsx(inputs);
}
