import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://mindfirehomes.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // --- Static routes ---
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/properties`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // --- Dynamic property routes ---
    let propertyRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: properties } = await supabase
            .from('properties')
            .select('id, updatedAt');

        if (properties) {
            propertyRoutes = properties.map((property: { id: string; updatedAt: string | null }) => ({
                url: `${BASE_URL}/properties/${property.id}`,
                lastModified: property.updatedAt ? new Date(property.updatedAt) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            }));
        }
    } catch (error) {
        console.error('Sitemap: Failed to fetch properties', error);
    }

    // --- Dynamic blog routes ---
    let blogRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: posts } = await supabase
            .from('blog_posts')
            .select('id, updatedAt');

        if (posts) {
            blogRoutes = posts.map((post: { id: string; updatedAt: string | null }) => ({
                url: `${BASE_URL}/blog/${post.id}`,
                lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
            }));
        }
    } catch (error) {
        console.error('Sitemap: Failed to fetch blog posts', error);
    }

    return [...staticRoutes, ...propertyRoutes, ...blogRoutes];
}
