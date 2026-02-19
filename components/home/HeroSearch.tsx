'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const HeroSearch = () => {
    const router = useRouter();
    const [intent, setIntent] = useState('Buy Property');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('All Types');

    const handleSearch = () => {
        const params = new URLSearchParams();

        // Map Intent to Status
        if (intent === 'Buy Property') params.set('status', 'For Sale');
        if (intent === 'Rent Home') params.set('status', 'For Rent');

        // Map Location & Type to Search
        // We'll combine them since PropertiesList search covers name/address. 
        // Ideally we'd have a separate type filter, but for now this works if types are in names/tags.
        const searchTerms = [];
        if (location) searchTerms.push(location);
        if (type !== 'All Types') searchTerms.push(type);

        if (searchTerms.length > 0) {
            params.set('search', searchTerms.join(' '));
        }

        router.push(`/properties?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div className="w-full max-w-4xl bg-surface-light dark:bg-surface-dark/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-6 transform translate-y-8 md:translate-y-12 border border-white/10">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-3 md:pb-0 md:pr-6">
                    <label className="block text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mb-1">Looking to</label>
                    <select
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                        aria-label="Looking to buy or rent"
                        className="w-full bg-transparent border-none text-text-main-light dark:text-white font-display font-semibold text-base sm:text-lg p-0 focus:ring-0 cursor-pointer outline-none"
                    >
                        <option>Buy Property</option>
                        <option>Rent Home</option>
                    </select>
                </div>
                <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-3 md:pb-0 md:pr-6">
                    <label className="block text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mb-1">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={handleKeyDown}
                        aria-label="Search by location"
                        placeholder="City, Zip, or Address"
                        className="w-full bg-transparent border-none text-text-main-light dark:text-white font-display font-semibold text-base sm:text-lg p-0 focus:ring-0 placeholder-gray-400 outline-none"
                    />
                </div>
                <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-3 md:pb-0 md:pr-6">
                    <label className="block text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest mb-1">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        aria-label="Property type"
                        className="w-full bg-transparent border-none text-text-main-light dark:text-white font-display font-semibold text-base sm:text-lg p-0 focus:ring-0 cursor-pointer outline-none"
                    >
                        <option>All Types</option>
                        <option>Villa</option>
                        <option>Penthouse</option>
                        <option>Appartment</option>
                        <option>Mansion</option>
                    </select>
                </div>
                <div className="md:w-auto flex items-end pt-2 md:pt-0">
                    <button
                        onClick={handleSearch}
                        aria-label="Search Properties"
                        className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-8 h-full min-h-[50px] rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-icons-outlined">search</span> Search
                    </button>
                </div>
            </div>
        </div>
    );
};
