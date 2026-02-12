'use client';

import React, { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/shared/PropertyCard';
import { Property } from '@/types';

export default function PropertiesList({ initialProperties }: { initialProperties: Property[] }) {
    const [showFilters, setShowFilters] = useState(false);
    const [properties] = useState(initialProperties);
    const [sortBy, setSortBy] = useState('Newest');

    // Lock body scroll when mobile filter drawer is open
    useEffect(() => {
        if (showFilters && window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [showFilters]);

    const sortedProperties = [...properties].sort((a, b) => {
        if (sortBy === 'Price: Low to High') return a.price - b.price;
        if (sortBy === 'Price: High to Low') return b.price - a.price;
        return 0; // Default: Newest (assuming ID or createdAt logic, but sticking to array order for now)
    });

    return (
        <div className="flex flex-col lg:flex-row gap-8 relative">
            {/* Header / Sub-Header duplicated from parent for filtering logic context if needed */}
            <div className="lg:hidden flex items-center justify-between mb-4">
                <button
                    className="flex items-center gap-2 text-sm font-medium border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg bg-surface-light dark:bg-surface-dark"
                    onClick={() => setShowFilters(true)}
                >
                    <span className="material-icons-outlined text-base">filter_list</span> Filters
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {properties.length} Properties
                </div>
            </div>

            {/* Mobile Filter Overlay Backdrop */}
            {showFilters && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setShowFilters(false)}
                />
            )}

            {/* Sidebar Filters */}
            <aside
                className={`
                    fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-surface-light dark:bg-surface-dark p-6 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out
                    ${showFilters ? 'translate-x-0' : 'translate-x-full'}
                    lg:relative lg:translate-x-0 lg:w-1/4 lg:p-0 lg:bg-transparent lg:dark:bg-transparent lg:shadow-none lg:block lg:z-auto lg:overflow-visible
                `}
            >
                <div className="lg:bg-surface-light lg:dark:bg-surface-dark lg:rounded-xl lg:p-6 lg:shadow-sm lg:border lg:border-gray-200 lg:dark:border-gray-800 lg:sticky lg:top-24">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800 lg:pb-0 lg:border-0">
                        <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">Filters</h3>
                        <button
                            className="lg:hidden p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            onClick={() => setShowFilters(false)}
                        >
                            <span className="material-icons-outlined">close</span>
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider text-[10px]">Location</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons-outlined text-gray-400 text-lg">search</span>
                                </span>
                                <input type="text" placeholder="City, neighborhood..." className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider text-[10px]">Price Range</label>
                            <input type="range" className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary mb-4" />
                            <div className="flex gap-3">
                                <input type="number" placeholder="Min" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-white" />
                                <input type="number" placeholder="Max" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-white" />
                            </div>
                        </div>

                        <button
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 transition-all mt-4"
                            onClick={() => setShowFilters(false)}
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            </aside>

            {/* Grid */}
            <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-6 hidden lg:flex">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Showing {properties.length} Properties</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent border-none text-gray-900 dark:text-white font-medium focus:ring-0 cursor-pointer outline-none text-sm"
                    >
                        <option>Sort by: Newest</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedProperties.map(property => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                    {sortedProperties.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-gray-500 font-medium font-display text-xl">No properties found match your criteria.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {sortedProperties.length > 0 && (
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
