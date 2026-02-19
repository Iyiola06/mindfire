'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyCard } from '@/components/shared/PropertyCard';
import { Property } from '@/types';

function PropertiesListContent({ initialProperties }: { initialProperties: Property[] }) {
    const searchParams = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('Newest');

    // Filter state - initialize from URL params
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');

    // Lock body scroll when mobile filter drawer is open
    useEffect(() => {
        if (showFilters && window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showFilters]);

    // Derive the min/max price of all properties for the slider
    const allPrices = initialProperties.map(p => p.price);
    const globalMin = allPrices.length ? Math.min(...allPrices) : 0;
    const globalMax = allPrices.length ? Math.max(...allPrices) : 10_000_000;

    const statuses = ['All', ...Array.from(new Set(initialProperties.map(p => p.status)))];

    const filtered = useMemo(() => {
        let list = [...initialProperties];

        // Text search: name or address
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.address.toLowerCase().includes(q)
            );
        }

        // Status filter
        if (statusFilter !== 'All') {
            list = list.filter(p => p.status === statusFilter);
        }

        // Min price
        if (minPrice !== '') {
            list = list.filter(p => p.price >= parseFloat(minPrice));
        }

        // Max price
        if (maxPrice !== '') {
            list = list.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Sort
        if (sortBy === 'Price: Low to High') list.sort((a, b) => a.price - b.price);
        if (sortBy === 'Price: High to Low') list.sort((a, b) => b.price - a.price);

        return list;
    }, [initialProperties, search, statusFilter, minPrice, maxPrice, sortBy]);

    const clearFilters = () => {
        setSearch('');
        setMinPrice('');
        setMaxPrice('');
        setStatusFilter('All');
    };

    const hasActiveFilters = search || minPrice || maxPrice || statusFilter !== 'All';

    const FIELD = 'block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:ring-primary focus:border-primary outline-none';

    return (
        <div className="flex flex-col lg:flex-row gap-8 relative">

            {/* Mobile filter toggle */}
            <div className="lg:hidden flex items-center justify-between mb-4">
                <button
                    className="flex items-center gap-2 text-sm font-bold border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg bg-surface-light dark:bg-surface-dark"
                    onClick={() => setShowFilters(true)}>
                    <span className="material-icons-outlined text-base">filter_list</span>
                    Filters {hasActiveFilters && <span className="ml-1 bg-primary text-white rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center">!</span>}
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} of {initialProperties.length} Properties</div>
            </div>

            {/* Backdrop */}
            {showFilters && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            )}

            {/* Sidebar Filters */}
            <aside className={`
                fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-surface-light dark:bg-surface-dark p-6 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out
                ${showFilters ? 'translate-x-0' : 'translate-x-full'}
                lg:relative lg:translate-x-0 lg:w-1/4 lg:p-0 lg:bg-transparent lg:dark:bg-transparent lg:shadow-none lg:block lg:z-auto lg:overflow-visible
            `}>
                <div className="lg:bg-surface-light lg:dark:bg-surface-dark lg:rounded-xl lg:p-6 lg:shadow-sm lg:border lg:border-gray-200 lg:dark:border-gray-800 lg:sticky lg:top-24">

                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800 lg:pb-0 lg:border-0">
                        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">Filters</h3>
                        <div className="flex items-center gap-2">
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">Clear all</button>
                            )}
                            <button className="lg:hidden p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white" onClick={() => setShowFilters(false)}>
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">

                        {/* Search */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Search</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons-outlined text-gray-400 text-lg">search</span>
                                </span>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Name, city, neighborhood..."
                                    className={`${FIELD} pl-10`} />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Listing Type</label>
                            <div className="flex flex-wrap gap-2">
                                {statuses.map(s => (
                                    <button key={s} onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${statusFilter === s ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Price Range</label>
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={e => setMinPrice(e.target.value)}
                                    placeholder={`Min (${globalMin.toLocaleString()})`}
                                    className={FIELD} />
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(e.target.value)}
                                    placeholder={`Max (${globalMax.toLocaleString()})`}
                                    className={FIELD} />
                            </div>
                        </div>

                        <button
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 transition-all mt-4 flex items-center justify-center gap-2"
                            onClick={() => setShowFilters(false)}>
                            <span className="material-icons-outlined text-base">done</span>
                            Show {filtered.length} Results
                        </button>
                    </div>
                </div>
            </aside>

            {/* Grid */}
            <div className="flex-1 w-full">
                {/* Top bar */}
                <div className="flex justify-between items-center mb-6 hidden lg:flex">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> of {initialProperties.length} Properties
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="ml-2 text-primary text-xs font-bold hover:underline">(Clear filters)</button>
                        )}
                    </span>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-transparent border-none text-gray-900 dark:text-white font-medium focus:ring-0 cursor-pointer outline-none text-sm">
                        <option>Newest</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map(property => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <span className="material-icons-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4 block">search_off</span>
                            <p className="text-gray-500 font-medium font-display text-xl">No properties match your filters.</p>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="mt-4 text-primary font-bold text-sm hover:underline">Clear all filters</button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filtered.length > 0 && (
                    <div className="mt-12 flex justify-center">
                        <nav className="flex items-center gap-1 sm:gap-2">
                            <button className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:border-primary transition-colors">
                                <span className="material-icons-outlined text-sm">chevron_left</span>
                            </button>
                            <button className="w-10 h-10 bg-primary text-white rounded-lg font-bold shadow-md text-sm">1</button>
                            <button className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:border-primary transition-colors">
                                <span className="material-icons-outlined text-sm">chevron_right</span>
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PropertiesList(props: { initialProperties: Property[] }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PropertiesListContent {...props} />
        </Suspense>
    );
}
