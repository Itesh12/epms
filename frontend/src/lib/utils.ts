import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names and handles Tailwind CSS conflicts.
 * Centralized for Astra UI consistency.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
