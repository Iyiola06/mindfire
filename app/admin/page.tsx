import React from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import DashboardClient, { type ActivityItem, type StatTile } from '@/components/admin/DashboardClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Dashboard | Mindfire Homes Admin',
    robots: { index: false, follow: false },
};

const DAYS = 14;

/** Naira and dollar totals are kept apart. Adding them together would invent
    an exchange rate the business has not stated. */
const formatVolume = (val: number, symbol: string) => {
    if (val >= 1_000_000_000) return `${symbol}${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `${symbol}${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${symbol}${(val / 1_000).toFixed(1)}K`;
    return `${symbol}${val.toLocaleString('en-NG')}`;
};

export default async function AdminDashboard() {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (DAYS - 1));

    const [
        { count: leadsCount },
        { count: propertiesCount },
        { count: blogCount },
        { data: recentLeads },
        { data: recentPosts },
        { data: soldProperties },
        { data: windowLeads },
    ] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*').order('createdAt', { ascending: false }).limit(5),
        supabase.from('blog_posts').select('*').order('createdAt', { ascending: false }).limit(5),
        supabase.from('properties').select('price, currency').eq('status', 'Sold'),
        supabase.from('leads').select('createdAt').gte('createdAt', since.toISOString()),
    ]);

    /**
     * Real enquiries per day for the last fortnight.
     *
     * The chart previously rendered a hardcoded seven-point array — Mon 12,
     * Tue 19, and so on — under the heading "Lead Generation Overview". It
     * looked like reporting and was decoration, which is worse than no chart
     * at all on a page someone makes decisions from.
     */
    const buckets = new Map<string, number>();
    for (let i = 0; i < DAYS; i += 1) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const lead of windowLeads ?? []) {
        const key = String(lead.createdAt).slice(0, 10);
        if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const series = Array.from(buckets, ([date, leads]) => ({
        date,
        label: new Date(`${date}T00:00:00Z`).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
        leads,
    }));

    // Sorted on the raw timestamp. The previous version sorted on an
    // already-localised date string, which `new Date()` cannot reliably parse,
    // so the "recent activity" order was effectively arbitrary.
    const activity: ActivityItem[] = [
        ...(recentLeads ?? []).map((l) => ({
            kind: 'lead' as const,
            title: 'New enquiry received',
            body: `${l.name} is interested in ${l.propertyInterest}.`,
            at: l.createdAt as string,
        })),
        ...(recentPosts ?? []).map((p) => ({
            kind: 'post' as const,
            title: p.published ? 'Article published' : 'Draft created',
            body: `“${p.title}”`,
            at: (p.createdAt ?? p.publishedAt ?? '') as string,
        })),
    ]
        .filter((a) => a.at)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 6);

    const volumeUSD = (soldProperties ?? [])
        .filter((p) => p.currency === 'USD')
        .reduce((sum, p) => sum + (p.price ?? 0), 0);
    const volumeNGN = (soldProperties ?? [])
        .filter((p) => p.currency !== 'USD')
        .reduce((sum, p) => sum + (p.price ?? 0), 0);

    const volumeString =
        [
            volumeNGN > 0 ? formatVolume(volumeNGN, '₦') : null,
            volumeUSD > 0 ? formatVolume(volumeUSD, '$') : null,
        ]
            .filter(Boolean)
            .join(' + ') || '—';

    const leadsThisWindow = series.reduce((sum, d) => sum + d.leads, 0);

    const stats: StatTile[] = [
        { title: 'Total enquiries', value: (leadsCount ?? 0).toLocaleString('en-NG'), note: 'All time', tone: 'brand' },
        { title: `Enquiries, ${DAYS} days`, value: leadsThisWindow.toLocaleString('en-NG'), note: 'Rolling window', tone: 'accent' },
        { title: 'Listings', value: (propertiesCount ?? 0).toLocaleString('en-NG'), note: 'In the database', tone: 'brand' },
        { title: 'Journal articles', value: (blogCount ?? 0).toLocaleString('en-NG'), note: 'Published and draft', tone: 'neutral' },
        { title: 'Sold volume', value: volumeString, note: 'Status “Sold”', tone: 'accent' },
    ];

    return <DashboardClient stats={stats} activity={activity} series={series} days={DAYS} />;
}
