import React from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import PropertiesList from '@/components/properties/PropertiesList';
import { absoluteUrl, breadcrumbJsonLd, SITE } from '@/lib/seo';
import type { Property } from '@/types';

export const metadata: Metadata = {
    title: 'Properties for sale in Abuja',
    description:
        'Browse verified homes, apartments, and land across Maitama, Asokoro, Guzape, Jabi, and Gwarinpa. Every listing has had its title checked and has been visited by our team.',
    alternates: { canonical: '/properties' },
    openGraph: {
        type: 'website',
        url: absoluteUrl('/properties'),
        title: `Properties for sale in Abuja | ${SITE.name}`,
        description:
            'Verified homes, apartments, and land across Abuja — titles checked and documentation shared before you commit.',
    },
};

export const dynamic = 'force-dynamic';

export default async function PropertiesPage() {
    const { data } = await supabase
        .from('properties')
        .select('*')
        .order('createdAt', { ascending: false });

    const properties = (data ?? []) as Property[];
    const count = properties.length;

    /**
     * `ItemList` for the listing grid. It is what lets a search engine
     * understand this page as a set of properties rather than as one document
     * that happens to mention several — and it is capped at the first 20 so
     * the payload stays proportionate.
     */
    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Properties for sale in Abuja',
        numberOfItems: count,
        itemListElement: properties.slice(0, 20).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl(`/properties/${p.id}`),
            name: p.name,
        })),
    };

    return (
        <PublicLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Properties', path: '/properties' },
                        ]),
                    ),
                }}
            />

            <PageHeader
                eyebrow="Abuja · Verified listings"
                title="Properties"
                lede={
                    count > 0
                        ? `${count} ${count === 1 ? 'property' : 'properties'} currently available. Every listing has had its title checked and has been visited by our team.`
                        : 'Our listings are updated as new developments are released. Speak with an advisor to hear about properties before they are published.'
                }
            />

            <div className="bg-bg pb-section pt-section-sm">
                <div className="mx-auto max-w-content px-gutter">
                    <PropertiesList initialProperties={properties} />
                </div>
            </div>
        </PublicLayout>
    );
}
