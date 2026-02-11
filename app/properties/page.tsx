'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PropertyCard } from '@/components/shared/PropertyCard';
import { MOCK_PROPERTIES } from '@/constants';

export default function PropertiesPage() {
    const [showFilters, setShowFilters] = useState(false);

    // Lock body scroll when mobile filter drawer is open
    useEffect(() => {
        if (showFilters && window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [showFilters]);

    // Mock filtering for now, to be replaced with backend integration later
    const sortedProperties = [...MOCK_PROPERTIES]; // Placeholder for sorting logic

    return (
        <PublicLayout>
            <div className="bg-background-light dark:bg-background-dark min-h-screen pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8 md:flex md:justify-between md:items-end border-b border-gray-200 dark:border-gray-800 pb-6">
                        <div>
                            <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Redefining Modern Living</p>
                            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                                Find Your <span className="text-primary italic">Dream</span> Space
                            </h1>
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-wrap items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                            <button
                                aria-expanded={showFilters}
                                aria-controls="filters-panel"
                                className="lg:hidden flex items-center gap-2 text-sm font-medium border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg bg-surface-light dark:bg-surface-dark"
                                onClick={() => setShowFilters(true)}
                            >
                                <span className="material-icons-outlined text-base">filter_list</span> Filters
                            </button>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 w-full sm:w-auto mt-2 sm:mt-0">
                                <span className="hidden sm:inline">Showing {MOCK_PROPERTIES.length} Properties</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full hidden sm:inline"></span>
                                <select aria-label="Sort properties" className="bg-transparent border border-gray-300 dark:border-gray-700 sm:border-none rounded-lg sm:rounded-none px-3 sm:px-0 text-gray-900 dark:text-white font-medium focus:ring-0 py-2 sm:py-0 w-full sm:w-auto cursor-pointer">
                                    <option>Sort by: Newest</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 relative">

                        {/* Mobile Filter Overlay Backdrop */}
                        {showFilters && (
                            <div
                                className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                                onClick={() => setShowFilters(false)}
                            />
                        )}

                        {/* Sidebar Filters (Drawer on Mobile, Sticky Sidebar on Desktop) */}
                        <aside
                            id="filters-panel"
                            className={`
                fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-surface-light dark:bg-surface-dark p-6 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out
                ${showFilters ? 'translate-x-0' : 'translate-x-full'}
                lg:relative lg:translate-x-0 lg:w-1/4 lg:p-0 lg:bg-transparent lg:dark:bg-transparent lg:shadow-none lg:block lg:z-auto lg:overflow-visible
              `}
                        >
                            <div className="lg:bg-surface-light lg:dark:bg-surface-dark lg:rounded-xl lg:p-6 lg:shadow-sm lg:border lg:border-gray-200 lg:dark:border-gray-800 lg:sticky lg:top-24">

                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800 lg:pb-0 lg:border-0">
                                    <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">Filters</h3>
                                    <div className="flex items-center gap-4">
                                        <button className="text-sm text-primary font-medium hover:underline">Reset</button>
                                        <button
                                            className="lg:hidden p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            onClick={() => setShowFilters(false)}
                                        >
                                            <span className="material-icons-outlined">close</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider text-[10px]" htmlFor="location-search">Location</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-icons-outlined text-gray-400 text-lg">search</span>
                                            </span>
                                            <input id="location-search" type="text" placeholder="City, neighborhood..." className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-primary focus:border-primary sm:text-sm" />
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider text-[10px]">Price Range</label>
                                        <input type="range" aria-label="Price range slider" className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary mb-4" />
                                        <div className="flex gap-3">
                                            <div className="relative w-full">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">$</span>
                                                <input aria-label="Minimum price" type="number" placeholder="Min" className="w-full pl-6 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div className="relative w-full">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">$</span>
                                                <input aria-label="Maximum price" type="number" placeholder="Max" className="w-full pl-6 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Type */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider text-[10px]">Property Type</label>
                                        <div className="space-y-3">
                                            {['House', 'Apartment', 'Villa', 'Commercial'].map((type, i) => (
                                                <label key={type} className="flex items-center p-2 -m-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                                    <input type="checkbox" defaultChecked={i === 1} className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary h-5 w-5 bg-gray-50 dark:bg-gray-800 cursor-pointer" />
                                                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 font-medium">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bedrooms */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider text-[10px]">Bedrooms</label>
                                        <div className="flex gap-2">
                                            {['Any', '1+', '2+', '3+', '4+'].map((beds, i) => (
                                                <button key={beds} aria-pressed={i === 2} className={`flex-1 py-2.5 border rounded-lg text-sm font-medium transition-colors ${i === 2 ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                                    {beds}
                                                </button>
                                            ))}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {sortedProperties.map(property => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-12 flex justify-center">
                                <nav className="flex items-center gap-1 sm:gap-2" aria-label="Pagination">
                                    <button aria-label="Previous page" className="p-2 sm:p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
                                        <span className="material-icons-outlined text-sm sm:text-base">chevron_left</span>
                                    </button>
                                    <button aria-current="page" className="w-10 h-10 bg-primary text-white rounded-lg font-bold shadow-md text-sm sm:text-base">1</button>
                                    <button className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors font-medium text-sm sm:text-base">2</button>
                                    <button className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors font-medium text-sm sm:text-base hidden sm:inline-flex items-center justify-center">3</button>
                                    <span className="text-gray-400 px-1 sm:px-2" aria-hidden="true">...</span>
                                    <button aria-label="Next page" className="p-2 sm:p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors">
                                        <span className="material-icons-outlined text-sm sm:text-base">chevron_right</span>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
