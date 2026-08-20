import React from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import LeadsManagement from '@/components/admin/leads/LeadsManagement';

export const dynamic = 'force-dynamic';

/* Never indexable. robots.txt already disallows /admin and the middleware
   redirects an unauthenticated request, but a page-level directive is the one
   signal that survives both being misconfigured. */
export const metadata: Metadata = {
    title: 'Leads | Mindfire Homes Admin',
    robots: { index: false, follow: false },
};

export default async function AdminLeads() {
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Error fetching leads:', error);
    }

    return (
        <LeadsManagement initialLeads={leads || []} />
    );
}
