import React from 'react';
import { supabase } from '@/lib/supabase';
import DashboardClient from '@/components/admin/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    // Fetch stats
    const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    const { count: propertiesCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
    const { count: blogCount } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });

    // Fetch recent activity (Leads & Blog Posts)
    const { data: recentLeads } = await supabase
        .from('leads')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(3);

    const { data: recentPosts } = await supabase
        .from('blog_posts')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(3);

    const activity = [
        ...(recentLeads?.map(l => ({
            icon: 'person_add',
            color: 'blue',
            title: 'New Lead Received',
            desc: `${l.name} is interested in ${l.propertyInterest}.`,
            time: new Date(l.createdAt).toLocaleDateString()
        })) || []),
        ...(recentPosts?.map(p => ({
            icon: 'edit_note',
            color: 'secondary',
            title: 'Blog Post Created',
            desc: `"${p.title}" was published.`,
            time: new Date(p.createdAt || '').toLocaleDateString()
        })) || [])
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    const stats = [
        { title: 'Total New Leads', value: (leadsCount || 0).toLocaleString(), change: '+12.5%', icon: 'person_add', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { title: 'Active Listings', value: (propertiesCount || 0).toString(), change: '+5.2%', icon: 'home', color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Blog posts', value: (blogCount || 0).toString(), change: '+2.4%', icon: 'article', color: 'text-secondary', bg: 'bg-secondary/10' },
        { title: 'Sales Volume', value: '$2.4M', change: '+8.1%', icon: 'payments', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];

    return (
        <DashboardClient stats={stats} activity={activity} />
    );
}
