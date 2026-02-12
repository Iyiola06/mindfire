import React from 'react';
import { supabase } from '@/lib/supabase';
import { PublicLayout } from '@/components/layout/PublicLayout';
import PropertiesList from '@/components/properties/PropertiesList';

export const dynamic = 'force-dynamic';

export default async function PropertiesPage() {
    const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .order('createdAt', { ascending: false });

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
                    </div>

                    <PropertiesList initialProperties={properties || []} />
                </div>
            </div>
        </PublicLayout>
    );
}
