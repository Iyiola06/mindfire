import React from 'react';
import { supabase } from '@/lib/supabase';
import PropertyManagement from '@/components/admin/properties/PropertyManagement';

export const dynamic = 'force-dynamic';

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
