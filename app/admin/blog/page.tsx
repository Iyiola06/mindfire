import React from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import BlogManagement from '@/components/admin/blog/BlogManagement';

export const dynamic = 'force-dynamic';

/* Never indexable. robots.txt already disallows /admin and the middleware
   redirects an unauthenticated request, but a page-level directive is the one
   signal that survives both being misconfigured. */
export const metadata: Metadata = {
    title: 'Journal | Mindfire Homes Admin',
    robots: { index: false, follow: false },
};

export default async function AdminBlog() {
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Error fetching blog posts:', error);
    }

    return (
        <BlogManagement initialPosts={posts || []} />
    );
}
