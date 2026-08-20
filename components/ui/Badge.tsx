import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'overlay';
  className?: string;
}

const COLOURS = {
  /* brand-600 behind white is 6.4:1 and passes. White on accent-500 is
     2.90:1 and does not, so the secondary badge takes near-black text. */
  primary: 'bg-brand-600 text-white',
  secondary: 'bg-accent-500 text-[rgb(26_26_26)]',
  /* For badges laid over photography, where neither theme's surface tokens
     describe the ground. Fixed dark tint, white label, blurred behind. */
  overlay: 'bg-[rgb(20_24_23)]/75 text-white backdrop-blur-md',
  gray: 'bg-surface-2 text-content-muted',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
} as const;

/**
 * The small uppercase status marker — "Sold", "Featured", "New".
 *
 * Distinct from `Chip`, which is body-sized and carries a fact rather than a
 * state. Badges are always uppercase and always short enough not to wrap.
 */
export const Badge: React.FC<BadgeProps> = ({ children, color = 'primary', className = '' }) => (
  <span
    className={`inline-flex items-center rounded-pill px-3 py-1.5 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.1em] ${COLOURS[color]} ${className}`}
  >
    {children}
  </span>
);
