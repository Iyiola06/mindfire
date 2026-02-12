import React from 'react';
import { supabase } from '@/lib/supabase';
import LeadsManagement from '@/components/admin/leads/LeadsManagement';

export const dynamic = 'force-dynamic';

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
