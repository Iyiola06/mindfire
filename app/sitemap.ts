import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { absoluteUrl, BASE_URL } from '@/lib/seo';

/**
 * The sitemap is regenerated hourly rather than at build time, so a property
 * added through the admin appears without a redeploy.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    /**
     * `/design-system` is deliberately absent — it is an internal acceptance
     * page and carries `robots: noindex`. Listing a noindexed URL in a sitemap
     * is a conflicting signal that Search Console reports as an error.
     */
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
        { url: absoluteUrl('/properties'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: absoluteUrl('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: absoluteUrl('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: absoluteUrl('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
        { url: absoluteUrl('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    ];

    let propertyRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: properties } = await supabase
            .from('properties')
            .select('id, updatedAt, status');

        propertyRoutes = (properties ?? []).map(
            (property: { id: string; updatedAt: string | null; status: string | null }) => ({
                url: absoluteUrl(`/properties/${property.id}`),
                lastModified: property.updatedAt ? new Date(property.updatedAt) : now,
                changeFrequency: 'weekly' as const,
                // A sold listing stays in the index — it is evidence of track
                // record — but it should not compete with what is available.
                priority: property.status === 'Sold' ? 0.4 : 0.8,
            }),
        );
    } catch (error) {
        console.error('Sitemap: Failed to fetch properties', error);
    }

    let blogRoutes: MetadataRoute.Sitemap = [];
    try {
        // Published only. The previous version listed every row, so each draft
        // was advertised to crawlers as a URL that then returned a 404.
        const { data: posts } = await supabase
            .from('blog_posts')
            .select('id, updatedAt, publishedAt')
            .eq('published', true);

        blogRoutes = (posts ?? []).map(
            (post: { id: string; updatedAt: string | null; publishedAt: string | null }) => ({
                url: absoluteUrl(`/blog/${post.id}`),
                lastModified: new Date(post.updatedAt ?? post.publishedAt ?? now),
                changeFrequency: 'monthly' as const,
                priority: 0.7,
            }),
        );
    } catch (error) {
        console.error('Sitemap: Failed to fetch blog posts', error);
    }

    return [...staticRoutes, ...propertyRoutes, ...blogRoutes];
}
