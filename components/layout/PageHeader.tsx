import React from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';

interface PageHeaderProps {
    eyebrow: string;
    title: string;
    lede?: React.ReactNode;
    /** Rendered under the lede — CTAs, a breadcrumb, a filter row. */
    children?: React.ReactNode;
    /** Centres the block. Off by default: listing and article pages read
        better left-aligned, where the eye has a single starting column. */
    align?: 'start' | 'center';
}

/**
 * The interior-page counterpart to the home hero.
 *
 * Every page below the home page used to open with either a darkened
 * photograph or a bare `<h1>` on the page background, and the two treatments
 * had drifted apart in spacing, eyebrow weight, and type scale. This is the
 * single opening: the same wash, the same ambient glow, the same clearance
 * under the floating nav.
 *
 * It cancels `main`'s `pt-nav` with `-mt-nav` and re-applies it inside, so the
 * wash runs behind the nav capsule rather than starting below it — the glass
 * needs something to be glass over.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
    eyebrow,
    title,
    lede,
    children,
    align = 'start',
}) => (
    <header className="hero-wash relative -mt-nav overflow-hidden pt-nav">
        <div
            aria-hidden="true"
            className="ambient-glow absolute -top-1/2 left-1/2 h-[40rem] w-[62rem] max-w-none -translate-x-1/2 rounded-full"
        />

        <div
            className={`relative mx-auto max-w-content px-gutter pb-section-sm pt-[clamp(2rem,5vh,3.5rem)] ${
                align === 'center' ? 'text-center' : ''
            }`}
        >
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1
                className={`mt-3 text-balance font-display text-[clamp(2.125rem,4.6vw,3.625rem)] font-bold leading-[1.04] tracking-[-0.03em] text-content ${
                    align === 'center' ? 'mx-auto max-w-[20ch]' : ''
                }`}
            >
                {title}
            </h1>
            {lede && (
                <p
                    className={`mt-4 max-w-[42rem] text-body-lg text-content-muted ${
                        align === 'center' ? 'mx-auto' : ''
                    }`}
                >
                    {lede}
                </p>
            )}
            {children}
        </div>
    </header>
);
