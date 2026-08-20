import React from 'react';

interface ChipProps {
    children: React.ReactNode;
    /**
     * `outline` is the specification chip — "2 bedrooms", "4,200 sq ft" — a
     * hairline pill that states a fact. `solid` fills with the page surface
     * for chips that sit over photography. `accent` is the featured marker.
     * `dark` is the status marker over photography.
     */
    variant?: 'outline' | 'solid' | 'accent' | 'dark';
    className?: string;
}

const VARIANTS = {
    outline: 'border border-hairline/15 text-content',
    solid: 'bg-surface text-content shadow-soft',
    accent: 'bg-accent-500 text-[rgb(26_26_26)]',
    /* Fixed dark tint rather than a theme token: this one always sits over a
       photograph, where the page theme says nothing about the ground. */
    dark: 'bg-[rgb(20_24_23)]/75 text-white backdrop-blur-md',
} as const;

/**
 * The pill that carries a single fact — a property spec, a status, a category.
 *
 * Distinct from `Badge`, which is the small uppercase status marker inherited
 * from the admin tables. This one is body-sized and reads as content.
 */
export const Chip: React.FC<ChipProps> = ({ children, variant = 'outline', className = '' }) => (
    <span
        className={`inline-flex items-center whitespace-nowrap rounded-pill px-4 py-2 text-body-sm font-medium ${VARIANTS[variant]} ${className}`}
    >
        {children}
    </span>
);
