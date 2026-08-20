'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateLeadStatus, deleteLead } from '@/lib/actions';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconMail, IconPhone, IconSearchOff, IconSpinner, IconTrash } from '@/components/icons';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    propertyInterest: string;
    propertyDetails?: string;
    budget?: string;
    message?: string;
    status: string;
    createdAt: string;
    contactedAt?: string;
}

const STATUSES = ['New', 'Contacted', 'Pending Review', 'Scheduled Viewing', 'Closed'] as const;

/**
 * Static class strings per status. Built at runtime before —
 * `text-${stat.color}-600`, `bg-${stat.color}-50` — which Tailwind cannot see,
 * so every status pill and every stat chip on this page rendered with no
 * colour at all. `primary` was also interpolated into `bg-primary-50`, a class
 * that has never existed in this config.
 */
const STATUS_CLASSES: Record<string, string> = {
    New: 'border-brand-600/30 text-brand-600',
    Contacted: 'border-hairline/20 text-content-muted',
    'Pending Review': 'border-accent-500/40 text-accent-500',
    'Scheduled Viewing': 'border-blue-500/30 text-blue-600 dark:text-blue-400',
    Closed: 'border-hairline/20 text-content-muted',
};

export default function LeadsManagement({ initialLeads }: { initialLeads: Lead[] }) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'All' | (typeof STATUSES)[number]>('All');

    const leads = useMemo(
        () => (filter === 'All' ? initialLeads : initialLeads.filter((l) => l.status === filter)),
        [initialLeads, filter],
    );

    const handleStatusChange = async (id: string, newStatus: string) => {
        setIsUpdating(id);
        setError('');
        const res = await updateLeadStatus(id, newStatus);
        setIsUpdating(null);
        if (res.success) router.refresh();
        else setError(res.error ?? 'Could not update that enquiry.');
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete the enquiry from ${name}? This cannot be undone.`)) return;
        setIsUpdating(id);
        setError('');
        const res = await deleteLead(id);
        setIsUpdating(null);
        if (res.success) router.refresh();
        else setError(res.error ?? 'Could not delete that enquiry.');
    };

    const counts = {
        total: initialLeads.length,
        uncontacted: initialLeads.filter((l) => l.status === 'New').length,
        viewings: initialLeads.filter((l) => l.status === 'Scheduled Viewing').length,
        closed: initialLeads.filter((l) => l.status === 'Closed').length,
    };

    const stats = [
        { label: 'Total enquiries', value: counts.total, tone: 'text-content' },
        { label: 'Awaiting contact', value: counts.uncontacted, tone: counts.uncontacted > 0 ? 'text-brand-600' : 'text-content' },
        { label: 'Viewings booked', value: counts.viewings, tone: 'text-accent-500' },
        { label: 'Closed', value: counts.closed, tone: 'text-content' },
    ];

    return (
        <div className="mx-auto max-w-content">
            <header className="mb-8">
                <Eyebrow>Enquiries</Eyebrow>
                <h1 className="mt-3 font-display text-display-md font-bold tracking-tight text-content">Leads</h1>
                <p className="mt-2 max-w-[42rem] text-body text-content-muted">
                    Every enquiry submitted through the contact form and the property pages, newest first.
                </p>
            </header>

            {error && (
                <p role="alert" className="mb-6 rounded-control border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-surface border border-hairline/10 bg-surface p-5 shadow-soft">
                        <p className="text-label font-semibold uppercase text-content-muted">{stat.label}</p>
                        <p className={`mt-2 font-display text-display-sm font-bold tracking-tight ${stat.tone}`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
                {(['All', ...STATUSES] as const).map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setFilter(s)}
                        aria-pressed={filter === s}
                        className={`min-h-[40px] rounded-pill px-4 text-body-sm font-medium transition-colors duration-short ease-standard ${
                            filter === s
                                ? 'bg-brand-600 text-white'
                                : 'border border-hairline/15 text-content-muted hover:text-content'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-panel border border-hairline/10 bg-surface shadow-soft">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <caption className="sr-only">Property enquiries and their current status</caption>
                        <thead className="border-b border-hairline/10 bg-surface-2">
                            <tr>
                                {['Enquirer', 'Interest', 'Budget', 'Received', 'Status', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        scope="col"
                                        className={`whitespace-nowrap px-6 py-4 text-label font-semibold uppercase text-content-muted ${
                                            h === 'Actions' ? 'text-right' : 'text-left'
                                        }`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline/10">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="transition-colors hover:bg-surface-2/60">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-brand-600/10 font-display font-bold text-brand-600">
                                                {lead.name.charAt(0).toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-body-sm font-semibold text-content">{lead.name}</p>
                                                {/* Contactable, not just displayed. Reading an
                                                    address off the screen and retyping it is how
                                                    replies go to the wrong person. */}
                                                <a
                                                    href={`mailto:${lead.email}`}
                                                    className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-content-muted hover:text-brand-600"
                                                >
                                                    <IconMail size={13} />
                                                    {lead.email}
                                                </a>
                                                {lead.phone && (
                                                    <a
                                                        href={`tel:${lead.phone}`}
                                                        className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-content-muted hover:text-brand-600"
                                                    >
                                                        <IconPhone size={13} />
                                                        {lead.phone}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-body-sm font-medium text-content">{lead.propertyInterest}</p>
                                        {lead.propertyDetails && (
                                            <p className="mt-0.5 text-[0.8125rem] text-content-muted">{lead.propertyDetails}</p>
                                        )}
                                        {lead.message && (
                                            <p className="mt-1 max-w-sm text-[0.8125rem] italic text-content-muted">
                                                “{lead.message}”
                                            </p>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-body-sm font-medium text-content">
                                        {lead.budget || '—'}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-body-sm text-content-muted">
                                        {new Date(lead.createdAt).toLocaleDateString('en-NG', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <label className="sr-only" htmlFor={`status-${lead.id}`}>
                                            Status for {lead.name}
                                        </label>
                                        <select
                                            id={`status-${lead.id}`}
                                            value={lead.status}
                                            disabled={isUpdating === lead.id}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                            className={`min-h-[40px] cursor-pointer rounded-pill border bg-transparent px-4 text-body-sm font-medium outline-none disabled:opacity-50 ${
                                                STATUS_CLASSES[lead.status] ?? 'border-hairline/20 text-content-muted'
                                            }`}
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(lead.id, lead.name)}
                                            disabled={isUpdating === lead.id}
                                            aria-label={`Delete the enquiry from ${lead.name}`}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-pill text-content-muted transition-colors duration-short ease-standard hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
                                        >
                                            {isUpdating === lead.id ? (
                                                <IconSpinner size={18} className="animate-spin" />
                                            ) : (
                                                <IconTrash size={18} />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {leads.length === 0 && (
                    <div className="px-6 py-20 text-center">
                        <IconSearchOff size={40} className="mx-auto mb-4 text-content-muted" />
                        <p className="font-display text-body-lg font-semibold text-content">
                            {initialLeads.length === 0 ? 'No enquiries yet' : `No enquiries marked “${filter}”`}
                        </p>
                        <p className="mx-auto mt-2 max-w-sm text-body-sm text-content-muted">
                            {initialLeads.length === 0
                                ? 'Submissions from the contact form and the property pages land here.'
                                : 'Choose a different status to see the rest.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
