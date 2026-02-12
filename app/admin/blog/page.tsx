import React from 'react';
import { supabase } from '@/lib/supabase';
import BlogManagement from '@/components/admin/blog/BlogManagement';

export const dynamic = 'force-dynamic';

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
