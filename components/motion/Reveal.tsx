'use client';

import React, { useEffect, useRef, useState } from 'react';

type RevealProps<T extends React.ElementType> = {
    /** Element to render. Defaults to a div; pass `section`, `li`, `article`. */
    as?: T;
    /** Stagger within a group, in milliseconds. Kept small — this is emphasis. */
    delay?: number;
    children: React.ReactNode;
    className?: string;
};

/**
 * Settles its children up from 30px as they cross into view.
 *
 * Three deliberate properties:
 *
 * 1. It reveals once and then stops observing. Content that re-hides on scroll
 *    up is disorienting, and re-running the transition on every pass is work
 *    for no gain.
 * 2. The initial hidden state is applied *after* mount, not during render. A
 *    server-rendered `opacity: 0` that never receives its observer callback —
 *    JS disabled, an error earlier in the bundle, a crawler — would leave the
 *    page permanently blank. Rendering visible first means the worst failure
 *    is a missing animation.
 * 3. `prefers-reduced-motion` short-circuits the whole mechanism rather than
 *    just shortening the duration, so no transform runs at all.
 */
export function Reveal<T extends React.ElementType = 'div'>({
    as,
    delay = 0,
    children,
    className = '',
}: RevealProps<T>) {
    const Tag = (as ?? 'div') as React.ElementType;
    const ref = useRef<HTMLElement>(null);
    const [armed, setArmed] = useState(false);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const reduced =
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduced || typeof IntersectionObserver === 'undefined') {
            setRevealed(true);
            return;
        }

        // Already on screen at mount — above the fold. Arm and release in the
        // same frame pair so the entrance still plays rather than being
        // skipped, but nothing is ever left hidden.
        setArmed(true);

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    setRevealed(true);
                    observer.disconnect();
                }
            },
            // Fires a little before the element's top edge arrives, matching
            // the 0.88 viewport threshold the design uses.
            { rootMargin: '0px 0px -12% 0px', threshold: 0 },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const state = armed ? `reveal ${revealed ? 'is-revealed' : ''}` : '';

    return (
        <Tag
            ref={ref}
            className={`${state} ${className}`.trim()}
            style={delay && armed ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </Tag>
    );
}
