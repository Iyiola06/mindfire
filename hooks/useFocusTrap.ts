'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Keeps keyboard focus inside an open dialog or sheet.
 *
 * A full-screen mobile nav that does not trap focus is broken for keyboard and
 * screen-reader users in a specific way: Tab walks straight out of the panel
 * and into the page behind it, which is visually covered, so the focus ring
 * disappears and the user is navigating a page they cannot see.
 *
 * This handles the three obligations of a modal surface:
 *   - move focus into the panel when it opens
 *   - cycle Tab / Shift+Tab within it
 *   - return focus to whatever opened it on close
 *
 * Escape is handled by the caller via `onEscape`, because closing is the
 * caller's state to own.
 */
const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useFocusTrap(
    ref: RefObject<HTMLElement | null>,
    active: boolean,
    onEscape?: () => void,
) {
    useEffect(() => {
        if (!active) return;
        const node = ref.current;
        if (!node) return;

        // Remember the trigger so focus can go home on close. Without this the
        // user is dumped at the top of the document every time they dismiss.
        const previouslyFocused = document.activeElement as HTMLElement | null;

        const visibleFocusable = () =>
            Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
                (el) => el.offsetParent !== null || el === document.activeElement,
            );

        // Focus the panel itself rather than its first link: the first thing
        // announced should be the dialog, not "Home, link".
        const initial = visibleFocusable()[0];
        (node.tabIndex === -1 ? node : initial ?? node).focus({ preventScroll: true });

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onEscape?.();
                return;
            }
            if (e.key !== 'Tab') return;

            const items = visibleFocusable();
            if (items.length === 0) {
                e.preventDefault();
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];
            const current = document.activeElement;

            if (e.shiftKey && (current === first || current === node)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && current === last) {
                e.preventDefault();
                first.focus();
            } else if (current instanceof HTMLElement && !node.contains(current)) {
                // Focus escaped some other way (autofocus, programmatic move).
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            previouslyFocused?.focus?.({ preventScroll: true });
        };
    }, [ref, active, onEscape]);
}
