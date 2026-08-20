'use client';

import React from 'react';
import Link from 'next/link';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { SafeChart } from '@/components/shared/SafeChart';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconFileText, IconUsers } from '@/components/icons';

export interface StatTile {
    title: string;
    value: string;
    note: string;
    tone: 'brand' | 'accent' | 'neutral';
}

export interface ActivityItem {
    kind: 'lead' | 'post';
    title: string;
    body: string;
    at: string;
}

export interface SeriesPoint {
    date: string;
    label: string;
    leads: number;
}

/**
 * Static class strings, looked up by key.
 *
 * The previous version built them at runtime — `bg-${stat.color}-50`,
 * `text-${item.color}-600`. Tailwind scans source text for complete class
 * names, so none of those were ever emitted into the stylesheet: every stat
 * chip and every activity marker on this page rendered unstyled.
 */
const TONES: Record<StatTile['tone'], string> = {
    brand: 'text-brand-600',
    accent: 'text-accent-500',
    neutral: 'text-content',
};

const relative = (iso: string) => {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const mins = Math.round((Date.now() - then) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.round(hours / 24);
    if (days < 31) return `${days} day${days === 1 ? '' : 's'} ago`;
    return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function DashboardClient({
    stats,
    activity,
    series,
    days,
}: {
    stats: StatTile[];
    activity: ActivityItem[];
    series: SeriesPoint[];
    days: number;
}) {
    const hasLeads = series.some((d) => d.leads > 0);

    return (
        <div className="mx-auto max-w-content">
            <header className="mb-8">
                <Eyebrow>Overview</Eyebrow>
                <h1 className="mt-3 font-display text-display-md font-bold tracking-tight text-content">
                    Dashboard
                </h1>
                <p className="mt-2 max-w-[42rem] text-body text-content-muted">
                    Everything on this page is read from the database at request time. No figure here
                    is illustrative.
                </p>
            </header>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className="rounded-surface border border-hairline/10 bg-surface p-6 shadow-soft"
                    >
                        <p className="text-label font-semibold uppercase text-content-muted">{stat.title}</p>
                        <p
                            className={`mt-3 font-display text-display-sm font-bold tracking-tight ${TONES[stat.tone]}`}
                        >
                            {stat.value}
                        </p>
                        <p className="mt-1 text-body-sm text-content-muted">{stat.note}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="flex flex-col rounded-panel border border-hairline/10 bg-surface p-6 shadow-soft lg:col-span-2">
                    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
                        <h2 className="font-display text-body-lg font-bold text-content">
                            Enquiries per day
                        </h2>
                        <p className="text-body-sm text-content-muted">Last {days} days</p>
                    </div>

                    <div className="h-[300px] min-h-[300px] w-full flex-1">
                        {hasLeads ? (
                            <SafeChart>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                                        <defs>
                                            <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="rgb(0 137 123)" stopOpacity={0.28} />
                                                <stop offset="100%" stopColor="rgb(0 137 123)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-content-muted" opacity={0.15} />
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: 'currentColor' }}
                                            className="text-content-muted"
                                            interval="preserveStartEnd"
                                            minTickGap={16}
                                            dy={8}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: 'currentColor' }}
                                            className="text-content-muted"
                                            width={40}
                                        />
                                        <Tooltip
                                            cursor={{ stroke: 'rgb(0 137 123)', strokeOpacity: 0.35 }}
                                            contentStyle={{
                                                background: 'rgb(var(--surface))',
                                                border: '1px solid rgb(var(--hairline) / 0.15)',
                                                borderRadius: '0.75rem',
                                                color: 'rgb(var(--text))',
                                                fontSize: '0.8125rem',
                                            }}
                                            labelStyle={{ color: 'rgb(var(--text-muted))' }}
                                            formatter={(value) => [value ?? 0, 'Enquiries']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="leads"
                                            stroke="rgb(0 105 96)"
                                            strokeWidth={2.5}
                                            fill="url(#leadFill)"
                                            dot={false}
                                            activeDot={{ r: 5 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </SafeChart>
                        ) : (
                            /* An empty window is a real state. Drawing a flat
                               line at zero reads as a broken chart. */
                            <div className="flex h-full flex-col items-center justify-center rounded-surface bg-surface-2 text-center">
                                <p className="font-display font-semibold text-content">
                                    No enquiries in the last {days} days
                                </p>
                                <p className="mt-1 max-w-xs text-body-sm text-content-muted">
                                    New submissions from the contact and property forms appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="flex h-full flex-col rounded-panel border border-hairline/10 bg-surface shadow-soft">
                    <div className="shrink-0 border-b border-hairline/10 p-6">
                        <h2 className="font-display text-body-lg font-bold text-content">Recent activity</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {activity.length > 0 ? (
                            <ol className="space-y-6">
                                {activity.map((item, i) => {
                                    const Glyph = item.kind === 'lead' ? IconUsers : IconFileText;
                                    return (
                                        <li key={`${item.at}-${i}`} className="flex gap-4">
                                            <span
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-pill ${
                                                    item.kind === 'lead'
                                                        ? 'bg-brand-600/10 text-brand-600'
                                                        : 'bg-accent-500/15 text-accent-500'
                                                }`}
                                            >
                                                <Glyph size={18} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-body-sm font-semibold text-content">{item.title}</p>
                                                <p className="mt-1 text-body-sm text-content-muted">{item.body}</p>
                                                <p className="mt-1.5 text-[0.75rem] text-content-muted">
                                                    {relative(item.at)}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        ) : (
                            <p className="py-10 text-center text-body-sm text-content-muted">
                                Nothing has happened yet.
                            </p>
                        )}
                    </div>

                    <div className="shrink-0 border-t border-hairline/10 p-4">
                        <Link
                            href="/admin/leads"
                            className="flex min-h-[44px] items-center justify-center rounded-pill text-body-sm font-semibold text-brand-600 transition-colors duration-short ease-standard hover:bg-brand-600/5"
                        >
                            Open the leads table
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
