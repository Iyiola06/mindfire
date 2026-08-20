import { MetadataRoute } from 'next';
import { absoluteUrl, BASE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                /**
                 * `/design-system` is an internal acceptance page; it also
                 * carries `robots: noindex`, and this stops it being crawled at
                 * all. The API routes return JSON, and `/admin` is behind a
                 * session — a crawler following a link there gets a redirect to
                 * a sign-in screen, which is wasted crawl budget either way.
                 */
                disallow: ['/admin', '/api/', '/design-system'],
            },
        ],
        sitemap: absoluteUrl('/sitemap.xml'),
        host: BASE_URL,
    };
}
