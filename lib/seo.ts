import { OFFICE, SOCIAL_LINKS } from '@/lib/contact'

/**
 * Single source of truth for everything a search engine or a social card
 * reads: the canonical origin, the site name, the default share image, and the
 * structured data describing the business.
 *
 * Before this file existed the base URL was re-declared in `sitemap.ts` and
 * `robots.ts` and nowhere else, so no page emitted a canonical link, no page
 * emitted an Open Graph image, and the only structured data on the site was
 * per-listing.
 */

/**
 * The canonical origin, without a trailing slash.
 *
 * `NEXT_PUBLIC_SITE_URL` is the deployment's own address. Vercel exposes
 * `VERCEL_PROJECT_PRODUCTION_URL` for the production domain, which is a useful
 * fallback on preview builds; the literal is the last resort.
 */
const rawBase =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : 'https://mindfirehomes.com')

export const BASE_URL = rawBase.replace(/\/+$/, '')

export const SITE = {
    name: 'Mindfire Homes',
    /** Used as the `%s | Mindfire Homes` suffix in the title template. */
    shortName: 'Mindfire Homes',
    locale: 'en_NG',
    description:
        'Legally verified homes and investment property in Abuja — documented titles, inspected construction, and payment terms agreed in writing before you commit.',
    /** Rendered by app/opengraph-image.tsx. */
    ogImage: '/opengraph-image',
} as const

/** Joins a site-relative path onto the canonical origin. */
export const absoluteUrl = (path = '/') =>
    `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

/**
 * Truncates at a word boundary for `<meta name="description">`.
 *
 * Google renders roughly 155–160 characters. Cutting mid-word — which a plain
 * `slice` does — produces a visible fragment in the result snippet.
 */
export const metaDescription = (text: string | null | undefined, max = 155) => {
    const clean = (text ?? '').replace(/\s+/g, ' ').trim()
    if (clean.length <= max) return clean
    const cut = clean.slice(0, max)
    const lastSpace = cut.lastIndexOf(' ')
    return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:—-]$/, '')}…`
}

/**
 * The business itself, emitted once on the home page.
 *
 * `RealEstateAgent` rather than the generic `Organization`: it is the specific
 * type for this business and carries `areaServed`. Only fields the codebase can
 * actually evidence are included — there is no aggregate rating, no founding
 * date, and no telephone until `OFFICE.phoneE164` is filled in.
 */
export const ORGANISATION_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${BASE_URL}/#organisation`,
    name: SITE.name,
    url: BASE_URL,
    logo: absoluteUrl('/logo.svg'),
    image: absoluteUrl(SITE.ogImage),
    description: SITE.description,
    email: OFFICE.email,
    ...(OFFICE.phoneE164 ? { telephone: OFFICE.phoneE164 } : {}),
    address: {
        '@type': 'PostalAddress',
        ...(OFFICE.streetLine ? { streetAddress: OFFICE.streetLine } : {}),
        addressLocality: 'Abuja',
        addressCountry: 'NG',
    },
    areaServed: { '@type': 'City', name: 'Abuja' },
    ...(SOCIAL_LINKS.length > 0 ? { sameAs: SOCIAL_LINKS.map((s) => s.href) } : {}),
}

/**
 * Breadcrumb structured data. Search results show the trail instead of a bare
 * URL, and it tells a crawler how a deep page relates to its section.
 */
export const breadcrumbJsonLd = (trail: { name: string; path: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: absoluteUrl(item.path),
    })),
})
