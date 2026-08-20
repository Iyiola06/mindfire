'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch } from '@/components/icons';

/**
 * Abuja districts, spelled as the market spells them. These are the values a
 * buyer types, so they are also what the free-text search matches against
 * property names and addresses.
 */
const LOCATIONS = [
    'All Locations',
    'Maitama',
    'Asokoro',
    'Wuse II',
    'Jabi',
    'Guzape',
    'Gwarinpa',
    'Katampe Extension',
    'Lokogoma',
    'Lugbe',
];

/** "Appartment" was the previous spelling. */
const TYPES = ['All Types', 'Apartment', 'Terrace', 'Duplex', 'Penthouse', 'Villa', 'Land', 'Commercial'];

/** Values are the numeric bounds handed to the listing page, so the label and
    the filter can never drift apart. `''` means unbounded on that side. */
const BUDGETS: { label: string; min: string; max: string }[] = [
    { label: 'Any budget', min: '', max: '' },
    { label: 'Under ₦50M', min: '', max: '50000000' },
    { label: '₦50M – ₦100M', min: '50000000', max: '100000000' },
    { label: '₦100M – ₦250M', min: '100000000', max: '250000000' },
    { label: '₦250M – ₦500M', min: '250000000', max: '500000000' },
    { label: 'Above ₦500M', min: '500000000', max: '' },
];

const FIELD_LABEL = 'block text-label font-semibold uppercase text-content-muted';
const FIELD_CONTROL =
    'mt-1 w-full cursor-pointer border-none bg-transparent p-0 font-display text-base font-semibold text-content outline-none focus:ring-0';

export const HeroSearch = () => {
    const router = useRouter();
    const [intent, setIntent] = useState('Buy');
    const [location, setLocation] = useState(LOCATIONS[0]);
    const [type, setType] = useState(TYPES[0]);
    const [budget, setBudget] = useState(BUDGETS[0].label);

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (intent === 'Buy') params.set('status', 'For Sale');
        if (intent === 'Rent') params.set('status', 'For Rent');

        // Location and type are their own params rather than being flattened
        // into `search`, so the listing page can render them as removable chips
        // and the browser back button restores each one independently.
        if (location !== LOCATIONS[0]) params.set('location', location);
        if (type !== TYPES[0]) params.set('type', type);

        const chosen = BUDGETS.find((b) => b.label === budget);
        if (chosen?.min) params.set('minPrice', chosen.min);
        if (chosen?.max) params.set('maxPrice', chosen.max);

        router.push(`/properties?${params.toString()}`);
    };

    return (
        <form
            role="search"
            aria-label="Property search"
            onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
            }}
            className="glass-elevated w-full max-w-4xl rounded-showcase p-4 text-content shadow-ambient md:p-5"
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-0">
                <div className="md:flex-1 md:border-r md:border-hairline/15 md:pr-5">
                    <label htmlFor="hero-intent" className={FIELD_LABEL}>
                        Looking to
                    </label>
                    <select
                        id="hero-intent"
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                        className={FIELD_CONTROL}
                    >
                        <option>Buy</option>
                        <option>Rent</option>
                    </select>
                </div>

                <div className="md:flex-1 md:border-r md:border-hairline/15 md:px-5">
                    <label htmlFor="hero-location" className={FIELD_LABEL}>
                        Location
                    </label>
                    <select
                        id="hero-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={FIELD_CONTROL}
                    >
                        {LOCATIONS.map((l) => (
                            <option key={l}>{l}</option>
                        ))}
                    </select>
                </div>

                <div className="md:flex-1 md:border-r md:border-hairline/15 md:px-5">
                    <label htmlFor="hero-type" className={FIELD_LABEL}>
                        Property type
                    </label>
                    <select
                        id="hero-type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={FIELD_CONTROL}
                    >
                        {TYPES.map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="md:flex-1 md:px-5">
                    <label htmlFor="hero-budget" className={FIELD_LABEL}>
                        Budget
                    </label>
                    <select
                        id="hero-budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className={FIELD_CONTROL}
                    >
                        {BUDGETS.map((b) => (
                            <option key={b.label}>{b.label}</option>
                        ))}
                    </select>
                </div>

                {/* min-h-[44px] is the touch-target floor, and the button keeps
                    its visible label so the icon stays decorative. */}
                <div className="md:pl-5">
                    <button
                        type="submit"
                        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-pill bg-brand-600 px-8 py-3 font-semibold text-white shadow-cta transition-colors duration-short ease-standard hover:bg-brand-700 md:w-auto"
                    >
                        <IconSearch size={20} />
                        Search
                    </button>
                </div>
            </div>
        </form>
    );
};
