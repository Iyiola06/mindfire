import React from 'react';

interface EyebrowProps {
    children: React.ReactNode;
    /**
     * `muted` is the default and the only one safe at any size. `brand` is for
     * eyebrows that need to carry the section — it sits on brand-500, which
     * clears AA at this weight on both themes' page backgrounds. `inverse` is
     * for eyebrows over dark photography or the dark footer.
     */
    tone?: 'muted' | 'brand' | 'inverse';
    /** Rendered element. `p` by default; pass `span` inside a heading block. */
    as?: 'p' | 'span' | 'div';
    className?: string;
}

const TONES = {
    muted: 'text-content-muted',
    brand: 'text-brand-500',
    inverse: 'text-white/75',
} as const;

/**
 * The wide-tracked uppercase label above a section heading.
 *
 * Extracted because the tracking, weight, and size travel together — every
 * page had its own hand-rolled copy of the same four utilities, and they had
 * already drifted (`font-bold` on contact, `font-semibold` everywhere else).
 */
export const Eyebrow: React.FC<EyebrowProps> = ({
    children,
    tone = 'muted',
    as: Tag = 'p',
    className = '',
}) => (
    <Tag className={`text-eyebrow font-semibold uppercase ${TONES[tone]} ${className}`}>
        {children}
    </Tag>
);
