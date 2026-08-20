import React from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import PropertyManagement from '@/components/admin/properties/PropertyManagement';

export const dynamic = 'force-dynamic';

/* Never indexable. robots.txt already disallows /admin and the middleware
   redirects an unauthenticated request, but a page-level directive is the one
   signal that survives both being misconfigured. */
export const metadata: Metadata = {
    title: 'Properties | Mindfire Homes Admin',
    robots: { index: false, follow: false },
};

export default async function AdminProperties() {
    const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Error fetching properties:', error);
    }

    return (
        <PropertyManagement initialProperties={properties || []} />
    );
}
