import type { Config } from 'tailwindcss'

/**
 * Colours are bridged to the CSS custom properties in app/globals.css rather
 * than hardcoded here. Each token stores space-separated RGB channels, so
 * `rgb(var(--brand-600) / <alpha-value>)` keeps Tailwind's opacity modifiers
 * (`bg-brand-600/60`) working, and `.dark` rethemes the whole palette without
 * a second set of values in this file.
 */
const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    700: 'rgb(var(--brand-700) / <alpha-value>)',
                    600: 'rgb(var(--brand-600) / <alpha-value>)',
                    500: 'rgb(var(--brand-500) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--brand-600) / <alpha-value>)',
                },
                /* Fills, borders, and icons >=24px only. Below 24px this is
                   2.9:1 on white and fails AA — use content-muted there. */
                accent: {
                    500: 'rgb(var(--accent-500) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--accent-500) / <alpha-value>)',
                },
                bg: 'rgb(var(--bg) / <alpha-value>)',
                surface: 'rgb(var(--surface) / <alpha-value>)',
                'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
                content: 'rgb(var(--text) / <alpha-value>)',
                'content-muted': 'rgb(var(--text-muted) / <alpha-value>)',
                hairline: 'rgb(var(--hairline) / <alpha-value>)',

                /* Legacy aliases — kept so unmigrated pages keep rendering.
                   `PropertiesList`, about, contact, blog, and every admin
                   component still reference bg-primary, text-secondary,
                   bg-surface-light, and text-text-muted-dark. These names are
                   removed page-by-page in sub-projects 3-5.

                   The -light/-dark suffixes are flat keys rather than nested
                   objects so the semantic `surface` and `bg` above stay plain
                   strings, which is what the token bridge test asserts. Both
                   suffixes resolve to the same var: `.dark` already swaps the
                   underlying value, so the old explicit dark: variants become
                   harmless no-ops instead of hardcoded overrides. */
                primary: {
                    DEFAULT: 'rgb(var(--brand-600) / <alpha-value>)',
                    dark: 'rgb(var(--brand-700) / <alpha-value>)',
                    hover: 'rgb(var(--brand-700) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'rgb(var(--accent-500) / <alpha-value>)',
                    hover: 'rgb(var(--accent-500) / <alpha-value>)',
                },
                'background-light': 'rgb(var(--bg) / <alpha-value>)',
                'background-dark': 'rgb(var(--bg) / <alpha-value>)',
                'surface-light': 'rgb(var(--surface) / <alpha-value>)',
                'surface-dark': 'rgb(var(--surface) / <alpha-value>)',
                'text-main-light': 'rgb(var(--text) / <alpha-value>)',
                'text-main-dark': 'rgb(var(--text) / <alpha-value>)',
                'text-muted-light': 'rgb(var(--text-muted) / <alpha-value>)',
                'text-muted-dark': 'rgb(var(--text-muted) / <alpha-value>)',
                sidebar: {
                    dark: '#0A0A0A',
                },
            },
            fontFamily: {
                /* Both resolve to Inter today, but they are separate variables
                   so display can diverge from body copy by editing layout.tsx
                   rather than every heading in the codebase. */
                display: ['var(--font-display)', 'system-ui', 'sans-serif'],
                sans: ['var(--font-text)', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'display-xl': ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
                'display-lg': ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
                'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
                'display-sm': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
                'body-lg': ['1.125rem', { lineHeight: '1.65' }],
                'body': ['1rem', { lineHeight: '1.6' }],
                'body-sm': ['0.875rem', { lineHeight: '1.55' }],
                'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.06em' }],
                /* Section eyebrows only. The wide tracking is the loudest
                   single signal in the new design language, and it is wrong
                   for form labels — those keep `label`. */
                'eyebrow': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.3em' }],
                'eyebrow-sm': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.22em' }],
            },
            spacing: {
                /* Only additions. Overriding Tailwind's numeric scale would
                   silently resize every existing p-4 in the codebase. */
                'nav': 'var(--nav-h)',
                'nav-inset': 'var(--nav-inset)',
                'nav-cap': 'var(--nav-cap-h)',
                'section': 'clamp(5rem, 11vw, 9.375rem)',
                'section-sm': 'clamp(2.25rem, 5vw, 3.5rem)',
                'gutter': 'clamp(1.5rem, 5vw, 3rem)',
            },
            maxWidth: {
                content: 'var(--content-max)',
            },
            borderRadius: {
                /* Semantic names rather than sm/md/lg, which would double the
                   radius of every existing `rounded-lg`. */
                control: '0.75rem',
                surface: '1.25rem',
                panel: '1.5rem',
                /* The largest container radius — featured panels and the hero
                   stage plates. Below `showcase` the long shadows read as a
                   drop shadow on a box; at this radius they read as lift. */
                showcase: '1.875rem',
                /* Every button, chip, and the nav capsule. */
                pill: '999px',
            },
            boxShadow: {
                soft: '0 2px 8px rgb(0 0 0 / 0.08)',
                hover: '0 8px 24px rgb(0 0 0 / 0.12)',
                elevated: '0 24px 48px -12px rgb(0 0 0 / 0.18)',
                /* Long-throw shadows. The negative spread is what keeps them
                   from darkening the ground directly under the element — the
                   shadow is cast well below and to no side, which is what
                   makes a 30px-radius panel look like it is floating. */
                lift: '0 24px 60px -20px rgb(15 25 25 / 0.4)',
                ambient: '0 40px 90px -50px rgb(15 25 25 / 0.35)',
                stage: '0 50px 90px -35px rgb(15 25 25 / 0.45)',
                'stage-front': '0 80px 140px -45px rgb(15 25 25 / 0.55)',
                /* Brand-tinted, for the primary call to action only. */
                cta: '0 14px 30px -12px rgb(var(--brand-600) / 0.55)',
            },
            transitionDuration: {
                short: 'var(--dur-short)',
                spatial: 'var(--dur-spatial)',
            },
            transitionTimingFunction: {
                standard: 'var(--ease-standard)',
                spring: 'var(--ease-spring)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}

export default config
