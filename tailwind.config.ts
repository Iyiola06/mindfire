import type { Config } from 'tailwindcss'

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
                primary: {
                    DEFAULT: '#00897B',
                    dark: '#00796B',
                    hover: '#00695C',
                },
                secondary: {
                    DEFAULT: '#F7B32B',
                    hover: '#E8A520',
                },
                background: {
                    light: '#FAFAFA',
                    dark: '#0F0F0F',
                },
                surface: {
                    light: '#FFFFFF',
                    dark: '#1A1A1A',
                },
                sidebar: {
                    dark: '#0A0A0A',
                },
                text: {
                    main: {
                        light: '#1A1A1A',
                        dark: '#F5F5F5',
                    },
                    muted: {
                        light: '#6B7280',
                        dark: '#9CA3AF',
                    },
                },
            },
            fontFamily: {
                display: ['Inter', 'system-ui', 'sans-serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
                hover: '0 8px 24px rgba(0, 0, 0, 0.12)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}

export default config
