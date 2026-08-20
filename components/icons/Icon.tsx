import React from 'react'

export interface IconProps {
    /** Rendered size in px, applied to both axes. */
    size?: number
    /**
     * Accessible name. Omit for decorative icons sitting next to visible text —
     * the icon is then hidden from assistive tech. Supply it when the icon is
     * the only content of a control.
     */
    label?: string
    className?: string
}

/**
 * Shared SVG wrapper for every glyph in this directory. Colour comes from
 * `currentColor`, so icons inherit from their container and need no per-theme
 * handling.
 */
export const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({
    size = 24,
    label,
    className,
    children,
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...(label
            ? { role: 'img' as const }
            : { 'aria-hidden': 'true' as const, focusable: 'false' as const })}
    >
        {label ? <title>{label}</title> : null}
        {children}
    </svg>
)
