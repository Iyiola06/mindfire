import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'glass' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Every control in the system is a pill. The height is fixed per size rather
 * than derived from padding so a button, a link-button, and an input-adjacent
 * submit all line up on the same baseline — the old padding-only sizing drifted
 * by a couple of pixels wherever the font metrics differed.
 *
 * `sm` is 40px, below the 44px touch floor, and is for pointer-dense admin
 * tables only. Anything a visitor taps on the public site uses `md` or larger.
 */
const SIZES: Record<ButtonSize, string> = {
    sm: 'h-10 px-4 text-body-sm',
    md: 'h-12 px-6 text-body-sm',
    lg: 'h-[52px] px-8 text-body',
};

const VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-brand-600 text-white shadow-cta hover:bg-brand-700',
    /* Near-black label, not white: white on accent-500 is 2.9:1 and fails AA,
       and a 14px button is nowhere near the large-text exemption. Same
       correction the Badge secondary variant takes. */
    secondary: 'bg-accent-500 text-[rgb(26_26_26)] shadow-soft hover:brightness-95',
    outline: 'border border-hairline/15 text-content hover:border-brand-600 hover:text-brand-600',
    /* The hero's second action: frosted rather than outlined, so it reads as a
       peer of the filled button instead of a weaker one. */
    glass: 'glass-capsule text-content hover:brightness-[0.98]',
    ghost: 'text-content-muted hover:bg-content/5 hover:text-brand-600',
};

const BASE =
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-pill font-semibold transition-all duration-short ease-standard focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50';

const classesFor = (variant: ButtonVariant, size: ButtonSize, fullWidth?: boolean, extra = '') =>
    `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${extra}`.trim();

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /**
     * Rendered as-is, so callers pass a glyph component from components/icons
     * rather than a Material ligature name.
     */
    icon?: React.ReactNode;
    /** Places the glyph after the label — for "continue"-style affordances. */
    iconPosition?: 'start' | 'end';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'start',
    fullWidth,
    className = '',
    ...props
}) => (
    <button className={classesFor(variant, size, fullWidth, className)} {...props}>
        {icon && iconPosition === 'start' && icon}
        {children}
        {icon && iconPosition === 'end' && icon}
    </button>
);

interface ButtonLinkProps extends Omit<React.ComponentProps<typeof Link>, 'className'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    iconPosition?: 'start' | 'end';
    fullWidth?: boolean;
    className?: string;
}

/**
 * The same control as a navigation target.
 *
 * Before this existed, twelve call-and-response copies of the primary-button
 * utility string lived across the page files, and they had already drifted in
 * radius, height, and shadow. A CTA that navigates is an anchor — it is not a
 * button with an onClick that calls router.push.
 */
export const ButtonLink: React.FC<ButtonLinkProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'start',
    fullWidth,
    className = '',
    ...props
}) => (
    <Link className={classesFor(variant, size, fullWidth, className)} {...props}>
        {icon && iconPosition === 'start' && icon}
        {children}
        {icon && iconPosition === 'end' && icon}
    </Link>
);
