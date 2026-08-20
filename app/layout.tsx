import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import GoogleAnalytics from '@/components/shared/GoogleAnalytics'
import { BASE_URL, SITE } from '@/lib/seo'

/**
 * Self-hosted through next/font — the files are served from our own origin, so
 * the render-blocking request to fonts.googleapis.com and the font-swap layout
 * shift both disappear.
 *
 * One family, two roles. Splitting them at the token level means the
 * display/text distinction is real and independently adjustable, rather than
 * the previous config where both aliases resolved to the same stack.
 */
const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-text',
})

const interDisplay = Inter({
    subsets: ['latin'],
    display: 'swap',
    weight: ['600', '700', '800'],
    variable: '--font-display',
})

/**
 * Site-wide metadata defaults.
 *
 * `metadataBase` is the important line: without it Next emits relative Open
 * Graph and canonical URLs, which every crawler and every social scraper
 * ignores. With it, each page can declare `alternates.canonical: '/about'` and
 * get an absolute URL for free.
 *
 * The title template means a page sets only its own subject — "Properties for
 * sale in Abuja" — and the brand suffix is appended once, here. The home page
 * opts out through `title.default`, because "Mindfire Homes | Mindfire Homes"
 * is what a template without a default produces.
 */
export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: `${SITE.name} — premium property in Abuja`,
        template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
    applicationName: SITE.name,
    referrer: 'origin-when-cross-origin',
    authors: [{ name: SITE.name, url: BASE_URL }],
    creator: SITE.name,
    publisher: SITE.name,
    alternates: { canonical: '/' },
    /* No `keywords`. The previous value — "real estate, property, homes,
       apartments, houses, buy, rent" — is generic, has been ignored by Google
       since 2009, and described a business in no particular country. */
    openGraph: {
        type: 'website',
        siteName: SITE.name,
        locale: SITE.locale,
        url: BASE_URL,
        title: `${SITE.name} — premium property in Abuja`,
        description: SITE.description,
    },
    twitter: {
        card: 'summary_large_image',
        title: `${SITE.name} — premium property in Abuja`,
        description: SITE.description,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    },
    icons: {
        icon: '/logo.svg',
        apple: '/logo.svg',
    },
    formatDetection: { telephone: false },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${interDisplay.variable}`}
            suppressHydrationWarning
        >
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <GoogleAnalytics />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
