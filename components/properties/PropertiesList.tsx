'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyCard } from '@/components/shared/PropertyCard';
import { Property } from '@/types';
import {
    IconClose,
    IconFilter,
    IconSearch,
    IconSearchOff,
} from '@/components/icons';

const SORTS = ['Newest', 'Price: Low to High', 'Price: High to Low'] as const;
type Sort = (typeof SORTS)[number];

/** Seed data contains both `For Sale` and `For sale`. Comparing on a normalised
    key stops a casing difference from silently emptying the grid. */
const norm = (v: string) => v.trim().toLowerCase();

/** The listing has no `type` column — property type lives in the name and tags,
    which is where a search for "Duplex" has to look. */
const matchesType = (p: Property, type: string) => {
    const q = norm(type);
    return (
        norm(p.name).includes(q) ||
        p.tags.some((t) => norm(t) === q)
    );
};

function PropertiesListContent({ initialProperties }: { initialProperties: Property[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<Sort>('Newest');

    // The URL is the single source of truth for every filter, so a shared link,
    // a reload, and the back button all reproduce the same grid.
    const search = searchParams.get('search') ?? '';
    const location = searchParams.get('location') ?? '';
    const type = searchParams.get('type') ?? '';
    const minPrice = searchParams.get('minPrice') ?? '';
    const maxPrice = searchParams.get('maxPrice') ?? '';
    const statusFilter = searchParams.get('status') ?? 'All';

    const setParams = useCallback(
        (changes: Record<string, string>) => {
            const next = new URLSearchParams(searchParams.toString());
            for (const [key, value] of Object.entries(changes)) {
                if (value) next.set(key, value);
                else next.delete(key);
            }
            // scroll: false — replacing a filter should not throw the reader
            // back to the top of the results they are reading.
            router.replace(next.toString() ? `/properties?${next}` : '/properties', {
                scroll: false,
            });
        },
        [router, searchParams],
    );

    // Saves and restores the previous value rather than hardcoding 'unset', so
    // this and PublicLayout — which writes the same property — cannot fight.
    useEffect(() => {
        if (!showFilters) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [showFilters]);

    // Escape closes the sheet, matching every other dismissible surface.
    useEffect(() => {
        if (!showFilters) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowFilters(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showFilters]);

    const statuses = useMemo(() => {
        const seen = new Map<string, string>();
        for (const p of initialProperties) {
            if (!seen.has(norm(p.status))) seen.set(norm(p.status), p.status);
        }
        return ['All', ...Array.from(seen.values())];
    }, [initialProperties]);

    const filtered = useMemo(() => {
        let list = [...initialProperties];

        if (search.trim()) {
            const q = norm(search);
            list = list.filter(
                (p) => norm(p.name).includes(q) || norm(p.address).includes(q),
            );
        }

        if (location) {
            const q = norm(location);
            list = list.filter((p) => norm(p.address).includes(q));
        }

        if (type) list = list.filter((p) => matchesType(p, type));

        if (statusFilter !== 'All') {
            list = list.filter((p) => norm(p.status) === norm(statusFilter));
        }

        if (minPrice !== '') list = list.filter((p) => p.price >= Number(minPrice));
        if (maxPrice !== '') list = list.filter((p) => p.price <= Number(maxPrice));

        if (sortBy === 'Price: Low to High') list.sort((a, b) => a.price - b.price);
        if (sortBy === 'Price: High to Low') list.sort((a, b) => b.price - a.price);

        return list;
    }, [initialProperties, search, location, type, statusFilter, minPrice, maxPrice, sortBy]);

    const naira = (v: string) => `₦${Number(v).toLocaleString('en-NG')}`;

    // Each chip carries the param it clears, so removal needs no second lookup.
    const chips = [
        search && { key: 'search', label: `“${search}”` },
        location && { key: 'location', label: location },
        type && { key: 'type', label: type },
        statusFilter !== 'All' && { key: 'status', label: statusFilter },
        minPrice && { key: 'minPrice', label: `From ${naira(minPrice)}` },
        maxPrice && { key: 'maxPrice', label: `Up to ${naira(maxPrice)}` },
    ].filter(Boolean) as { key: string; label: string }[];

    const clearFilters = () => router.replace('/properties', { scroll: false });

    const FIELD =
        'block w-full rounded-control border border-hairline/15 bg-surface-2 px-3 py-2.5 text-body-sm text-content outline-none transition-colors duration-short ease-standard placeholder:text-content-muted focus-visible:border-brand-600';

    const filterPanel = (
        <div className="space-y-6">
            <div>
                <label htmlFor="filter-search" className="mb-2 block text-label font-semibold uppercase text-content-muted">
                    Search
                </label>
                <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-content-muted">
                        <IconSearch size={18} />
                    </span>
                    <input
                        id="filter-search"
                        type="search"
                        defaultValue={search}
                        onChange={(e) => setParams({ search: e.target.value })}
                        placeholder="Name, district, or address"
                        className={`${FIELD} pl-10`}
                    />
                </div>
            </div>

            <div>
                <span id="filter-status" className="mb-2 block text-label font-semibold uppercase text-content-muted">
                    Listing status
                </span>
                <div role="group" aria-labelledby="filter-status" className="flex flex-wrap gap-2">
                    {statuses.map((s) => {
                        const active = norm(s) === norm(statusFilter);
                        return (
                            <button
                                key={s}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setParams({ status: s === 'All' ? '' : s })}
                                className={`min-h-[44px] rounded-pill border px-3 text-body-sm font-semibold transition-colors duration-short ease-standard ${
                                    active
                                        ? 'border-brand-600 bg-brand-600 text-white'
                                        : 'border-hairline/15 text-content-muted hover:border-brand-600 hover:text-content'
                                }`}
                            >
                                {s}
                            </button>
                        );
                    })}
                </div>
            </div>

            <fieldset>
                <legend className="mb-2 text-label font-semibold uppercase text-content-muted">
                    Price range (₦)
                </legend>
                <div className="flex gap-3">
                    <input
                        type="number"
                        inputMode="numeric"
                        aria-label="Minimum price in naira"
                        defaultValue={minPrice}
                        onChange={(e) => setParams({ minPrice: e.target.value })}
                        placeholder="Min"
                        className={FIELD}
                    />
                    <input
                        type="number"
                        inputMode="numeric"
                        aria-label="Maximum price in naira"
                        defaultValue={maxPrice}
                        onChange={(e) => setParams({ maxPrice: e.target.value })}
                        placeholder="Max"
                        className={FIELD}
                    />
                </div>
            </fieldset>
        </div>
    );

    return (
        <div className="relative flex flex-col gap-8 lg:flex-row">
            {/* Mobile filter trigger */}
            <div className="flex items-center justify-between lg:hidden">
                <button
                    type="button"
                    onClick={() => setShowFilters(true)}
                    className="flex min-h-[44px] items-center gap-2 rounded-pill border border-hairline/15 bg-surface px-4 text-body-sm font-semibold text-content"
                >
                    <IconFilter size={18} />
                    Filters
                    {chips.length > 0 && (
                        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-label font-bold text-white">
                            {chips.length}
                        </span>
                    )}
                </button>
                <p className="text-body-sm text-content-muted">
                    {filtered.length} of {initialProperties.length}
                </p>
            </div>

            {showFilters && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setShowFilters(false)}
                    aria-hidden="true"
                />
            )}

            {/* The sheet is glass on mobile where it floats over content, and a
                plain panel on desktop where it sits in the page flow — glass
                over an opaque background would only muddy it. */}
            <aside
                role="dialog"
                aria-modal={showFilters ? true : undefined}
                aria-label="Filter properties"
                className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto p-6 transition-transform duration-spatial ease-standard sm:w-80 lg:static lg:z-auto lg:w-1/4 lg:translate-x-0 lg:overflow-visible lg:p-0 ${
                    showFilters ? 'glass-elevated translate-x-0' : 'translate-x-full lg:transform-none'
                }`}
            >
                <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:rounded-showcase lg:border lg:border-hairline/[0.06] lg:bg-surface lg:p-6 lg:shadow-ambient">
                    <div className="mb-6 flex items-center justify-between border-b border-hairline/10 pb-4 lg:border-0 lg:pb-0">
                        <h2 className="font-display text-display-sm font-semibold text-content">Filters</h2>
                        <div className="flex items-center gap-2">
                            {chips.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-body-sm font-semibold text-brand-600 hover:underline"
                                >
                                    Clear all
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowFilters(false)}
                                aria-label="Close filters"
                                className="flex h-11 w-11 items-center justify-center text-content-muted lg:hidden"
                            >
                                <IconClose size={22} />
                            </button>
                        </div>
                    </div>

                    {filterPanel}

                    <button
                        type="button"
                        onClick={() => setShowFilters(false)}
                        className="mt-6 min-h-[44px] w-full rounded-pill bg-brand-600 py-3 font-semibold text-white shadow-cta transition-colors duration-short ease-standard hover:bg-brand-700 lg:hidden"
                    >
                        Show {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                    </button>
                </div>
            </aside>

            <div className="w-full flex-1">
                <div className="mb-6 hidden items-center justify-between lg:flex">
                    {/* aria-live so filtering announces the new count to a screen
                        reader instead of changing the grid silently. */}
                    <p aria-live="polite" className="text-body-sm text-content-muted">
                        Showing <span className="font-semibold text-content">{filtered.length}</span> of{' '}
                        {initialProperties.length} properties
                    </p>
                    <label className="flex items-center gap-2 text-body-sm text-content-muted">
                        Sort
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as Sort)}
                            className="cursor-pointer border-none bg-transparent font-semibold text-content outline-none focus:ring-0"
                        >
                            {SORTS.map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                    </label>
                </div>

                {chips.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {chips.map((chip) => (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={() => setParams({ [chip.key]: '' })}
                                aria-label={`Remove filter ${chip.label}`}
                                className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-hairline/15 bg-surface-2 px-3 text-body-sm text-content transition-colors duration-short ease-standard hover:border-brand-600"
                            >
                                {chip.label}
                                <IconClose size={14} />
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 text-center">
                        <IconSearchOff size={48} className="mx-auto mb-4 text-content-muted" />
                        <p className="font-display text-display-sm font-semibold text-content">
                            No properties match these filters
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-body text-content-muted">
                            Try widening the price range, or clear the filters to see everything currently
                            available.
                        </p>
                        {chips.length > 0 && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-6 min-h-[44px] rounded-pill bg-brand-600 px-6 font-semibold text-white shadow-cta transition-colors duration-short ease-standard hover:bg-brand-700"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PropertiesList(props: { initialProperties: Property[] }) {
    return (
        <Suspense
            fallback={
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {/* Skeletons match the card's real height so nothing shifts
                        when the grid replaces them. */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-[26rem] animate-pulse rounded-surface border border-hairline/10 bg-surface-2"
                        />
                    ))}
                </div>
            }
        >
            <PropertiesListContent {...props} />
        </Suspense>
    );
}
