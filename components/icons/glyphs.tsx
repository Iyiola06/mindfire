import React from 'react'
import { Icon } from './Icon'
import type { IconProps } from './Icon'

export const IconHeart: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Icon>
)

export const IconMapPin: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </Icon>
)

export const IconBed: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M2 4v16" />
        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
        <path d="M2 17h20" />
        <path d="M6 8v9" />
    </Icon>
)

export const IconBath: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1Z" />
        <path d="M6 12V5a2 2 0 0 1 2-2h1.5" />
        <path d="M9 5h2" />
        <path d="M7 20l-1 2" />
        <path d="M17 20l1 2" />
    </Icon>
)

export const IconArea: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z" />
        <path d="m7.5 10.5 2 2" />
        <path d="m10.5 7.5 2 2" />
        <path d="m13.5 4.5 2 2" />
    </Icon>
)

export const IconMenu: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
    </Icon>
)

export const IconClose: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </Icon>
)

export const IconSun: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </Icon>
)

export const IconMoon: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Icon>
)

export const IconSend: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M22 2 11 13" />
        <path d="M22 2 15 22l-4-9-9-4Z" />
    </Icon>
)

export const IconCheck: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M20 6 9 17l-5-5" />
    </Icon>
)

export const IconSpinner: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </Icon>
)

export const IconBuilding: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
    </Icon>
)

export const IconSearch: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </Icon>
)

export const IconArrowRight: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </Icon>
)

/** Capital growth. Used at 28px in the investment section — above the 24px
    floor that lets it carry the accent colour. */
export const IconTrendingUp: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M3 17 9.5 10.5l4 4L21 7" />
        <path d="M15 7h6v6" />
    </Icon>
)

export const IconShieldCheck: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
    </Icon>
)

export const IconRuler: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M3 15.5 15.5 3l5.5 5.5L8.5 21Z" />
        <path d="m7 12 2 2" />
        <path d="m10 9 2 2" />
        <path d="m13 6 2 2" />
    </Icon>
)

export const IconFileText: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
    </Icon>
)

export const IconCreditCard: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
    </Icon>
)

export const IconCalendarCheck: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="m9 15 2 2 4-4" />
    </Icon>
)

export const IconFilter: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M3 5h18" />
        <path d="M6 12h12" />
        <path d="M10 19h4" />
    </Icon>
)

export const IconChevronLeft: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="m15 6-6 6 6 6" />
    </Icon>
)

export const IconChevronRight: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="m9 6 6 6-6 6" />
    </Icon>
)

export const IconSearchOff: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
        <path d="m8.5 8.5 5 5" />
    </Icon>
)

export const IconPhone: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M16.5 21A13.5 13.5 0 0 1 3 7.5 2.5 2.5 0 0 1 5.5 5h2a1 1 0 0 1 1 .82l.7 3.1a1 1 0 0 1-.45 1.05l-1.4.9a10.5 10.5 0 0 0 5.28 5.28l.9-1.4a1 1 0 0 1 1.05-.45l3.1.7a1 1 0 0 1 .82 1v2A2.5 2.5 0 0 1 16.5 21Z" />
    </Icon>
)

export const IconMail: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2.5 6.5 8.4 6a2 2 0 0 0 2.2 0l8.4-6" />
    </Icon>
)

export const IconClock: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5V12l3 2" />
    </Icon>
)

export const IconWhatsApp: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.6-4.8A8.5 8.5 0 1 1 21 11.5Z" />
        <path d="M8.8 8.4c-.3.7-.1 1.7.6 2.7a8 8 0 0 0 2.9 2.6c1 .5 2 .6 2.6.2" />
    </Icon>
)

/* ==========================================================================
   Admin glyphs
   --------------------------------------------------------------------------
   The admin surface rendered Material Icons ligatures — `<span
   class="material-icons-outlined">delete_outline</span>` — which meant a
   render-blocking request to fonts.googleapis.com, a flash of the literal word
   "delete_outline" before the font loaded, and glyphs that could not inherit
   `currentColor` reliably at small sizes. These are the replacements.
   ========================================================================== */

export const IconGrid: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </Icon>
)

export const IconUsers: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M15 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
        <circle cx="8.5" cy="7" r="3.5" />
        <path d="M22 20v-1.5a4 4 0 0 0-3-3.87" />
        <path d="M16 3.6a3.5 3.5 0 0 1 0 6.8" />
    </Icon>
)

export const IconEdit: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M4 20h4l10.5-10.5a2.83 2.83 0 0 0-4-4L4 16v4Z" />
        <path d="m14.5 5.5 4 4" />
    </Icon>
)

export const IconTrash: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M4 6h16" />
        <path d="M9.5 6V4.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V6" />
        <path d="M6.5 6.5 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9l.9-12.5" />
        <path d="M10.5 10.5v6M13.5 10.5v6" />
    </Icon>
)

export const IconPlus: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M12 5v14M5 12h14" />
    </Icon>
)

export const IconLogout: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M14 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8" />
        <path d="m16 15 3.5-3-3.5-3" />
        <path d="M19 12H9.5" />
    </Icon>
)

export const IconImage: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <circle cx="8.5" cy="9.5" r="1.75" />
        <path d="m3.5 17.5 4.6-4.2a2 2 0 0 1 2.7 0l3.2 3 1.9-1.7a2 2 0 0 1 2.7 0l1.9 1.7" />
    </Icon>
)

export const IconAlert: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M12 4.5 2.8 19a1.5 1.5 0 0 0 1.3 2.2h15.8A1.5 1.5 0 0 0 21.2 19L12 4.5Z" />
        <path d="M12 10v4" />
        <path d="M12 17.5h.01" />
    </Icon>
)

export const IconStar: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z" />
    </Icon>
)

export const IconChart: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M4 20V4" />
        <path d="M4 20h16" />
        <path d="m7.5 15.5 3.5-4 3 2.5 4.5-6" />
    </Icon>
)

export const IconTag: React.FC<IconProps> = (p) => (
    <Icon {...p}>
        <path d="M3 11.6V4.5A1.5 1.5 0 0 1 4.5 3h7.1a2 2 0 0 1 1.4.6l7.4 7.4a2 2 0 0 1 0 2.8l-6.6 6.6a2 2 0 0 1-2.8 0L3.6 13a2 2 0 0 1-.6-1.4Z" />
        <path d="M7.5 7.5h.01" />
    </Icon>
)
