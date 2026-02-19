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

    // Calculate Sales Volume
    const { data: soldProperties } = await supabase
        .from('properties')
        .select('price, currency')
        .eq('status', 'Sold');

    const volumeUSD = soldProperties?.filter(p => p.currency === 'USD').reduce((sum, p) => sum + p.price, 0) || 0;
    const volumeNGN = soldProperties?.filter(p => p.currency === 'NGN').reduce((sum, p) => sum + p.price, 0) || 0;

    // Format volume string (e.g. "$1.2M + ₦500M")
    const formatVolume = (val: number, symbol: string) => {
        if (val >= 1_000_000) return `${symbol}${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `${symbol}${(val / 1_000).toFixed(1)}K`;
        return `${symbol}${val}`;
    };

    const volumeString = [
        volumeUSD > 0 ? formatVolume(volumeUSD, '$') : null,
        volumeNGN > 0 ? formatVolume(volumeNGN, '₦') : null
    ].filter(Boolean).join(' + ') || '$0';

    const stats = [
        { title: 'Total New Leads', value: (leadsCount || 0).toLocaleString(), change: 'All time', icon: 'person_add', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { title: 'Active Listings', value: (propertiesCount || 0).toString(), change: 'Live', icon: 'home', color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Blog posts', value: (blogCount || 0).toString(), change: 'Published', icon: 'article', color: 'text-secondary', bg: 'bg-secondary/10' },
        { title: 'Sales Volume', value: volumeString, change: 'Total', icon: 'payments', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];

    return (
        <DashboardClient stats={stats} activity={activity} />
    );
}
