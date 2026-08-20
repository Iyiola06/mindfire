import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Property } from '@/types';
import { PropertyContactForm } from '@/components/properties/PropertyContactForm';
import { Chip } from '@/components/ui/Chip';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { absoluteUrl, BASE_URL, breadcrumbJsonLd, metaDescription, SITE } from '@/lib/seo';
import {
    IconArea,
    IconBath,
    IconBed,
    IconBuilding,
    IconCheck,
    IconFileText,
    IconMapPin,
    IconShieldCheck,
} from '@/components/icons';

export const dynamic = 'force-dynamic';

const fetchProperty = async (id: string) => {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    return error || !data ? null : (data as Property);
};

/** Naira is formatted with the Nigerian locale so grouping matches how a local
    buyer reads a price; the previous call used the runtime default. */
const formatPrice = (p: Property) =>
    p.currency === 'USD'
        ? `$${p.price.toLocaleString('en-US')}`
        : `₦${p.price.toLocaleString('en-NG')}`;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const property = await fetchProperty(id);

    // A 404 must not be indexable. Without this the not-found page inherits the
    // site defaults and invites a crawler to keep it.
    if (!property) {
        return { title: 'Property not found', robots: { index: false, follow: false } };
    }

    const description = metaDescription(
        property.description ??
            `${property.beds} bedroom property at ${property.address}. ${formatPrice(property)}. Title checked with the land registry before listing.`,
    );

    return {
        title: `${property.name}, ${property.address}`,
        description,
        alternates: { canonical: `/properties/${property.id}` },
        openGraph: {
            type: 'website',
            url: absoluteUrl(`/properties/${property.id}`),
            title: `${property.name} | ${SITE.name}`,
            description,
            images: property.image ? [{ url: property.image, alt: property.name }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${property.name} | ${SITE.name}`,
            description,
            images: property.image ? [property.image] : undefined,
        },
    };
}

/** What Mindfire does for every listing. Stated as process rather than as a
    per-property claim, because the schema has no title-type or search-date
    column — asserting a specific title for a specific property would be
    inventing data. The documents themselves are shared on request. */
const ASSURANCES = [
    {
        icon: IconShieldCheck,
        title: 'Title checked before listing',
        body: 'The title type and its current status are confirmed with the relevant land registry before this property appears on the site.',
    },
    {
        icon: IconFileText,
        title: 'Documents shared on request',
        body: 'Ask an advisor for the search results, survey plan, and payment schedule for this property and they will be sent to you in full.',
    },
    {
        icon: IconBuilding,
        title: 'Visit before you commit',
        body: 'Accompanied site visits are arranged at your convenience, including during construction where the development is not yet complete.',
    },
];

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-6 font-display text-display-sm font-semibold text-content">{children}</h2>
);

export default async function PropertyDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const property = await fetchProperty(id);

    if (!property) return notFound();

    const isSold = property.status.trim().toLowerCase() === 'sold';
    const gallery = property.images?.filter(Boolean) ?? [];
    const price = formatPrice(property);

    // Only the four facts the schema actually stores. The previous version
    // showed a hardcoded "2 Cars" for every property with no field behind it.
    const stats = [
        { icon: IconBed, value: property.beds, label: property.beds === 1 ? 'Bedroom' : 'Bedrooms' },
        { icon: IconBath, value: property.baths, label: property.baths === 1 ? 'Bathroom' : 'Bathrooms' },
        { icon: IconArea, value: property.sqft.toLocaleString('en-NG'), label: 'Sq. ft.' },
        { icon: IconBuilding, value: property.status, label: 'Status' },
    ];

    /**
     * Only fields present in the record are emitted, so the markup never
     * describes something the listing does not have.
     *
     * The listing is modelled as a `Product` wrapping the `Residence`, because
     * `Residence` alone has no `offers` — and the price and availability are
     * the two things a search result should carry for a property that is for
     * sale. Availability maps from the same `status` string the page renders,
     * so the badge and the structured data cannot disagree.
     */
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': absoluteUrl(`/properties/${property.id}#listing`),
        name: property.name,
        description: property.description ?? undefined,
        image: [property.image, ...(property.images ?? [])].filter(Boolean),
        url: absoluteUrl(`/properties/${property.id}`),
        category: 'Real estate',
        offers: {
            '@type': 'Offer',
            price: property.price,
            priceCurrency: property.currency ?? 'NGN',
            url: absoluteUrl(`/properties/${property.id}`),
            availability: isSold
                ? 'https://schema.org/SoldOut'
                : 'https://schema.org/InStock',
            // Points at the RealEstateAgent node emitted on the home page,
            // so the offer is attributed to the business rather than orphaned.
            seller: { '@id': `${BASE_URL}/#organisation` },
        },
        additionalProperty: [
            { '@type': 'PropertyValue', name: 'Bedrooms', value: property.beds },
            { '@type': 'PropertyValue', name: 'Bathrooms', value: property.baths },
            { '@type': 'PropertyValue', name: 'Floor area (sq ft)', value: property.sqft },
        ],
        subjectOf: {
            '@type': 'Residence',
            name: property.name,
            address: {
                '@type': 'PostalAddress',
                streetAddress: property.address,
                addressLocality: 'Abuja',
                addressCountry: 'NG',
            },
            numberOfBedrooms: property.beds,
            numberOfBathroomsTotal: property.baths,
            floorSize: { '@type': 'QuantitativeValue', value: property.sqft, unitCode: 'FTK' },
        },
    };

    return (
        <PublicLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Properties', path: '/properties' },
                            { name: property.name, path: `/properties/${property.id}` },
                        ]),
                    ),
                }}
            />

            <div className="hero-wash min-h-screen pb-section">
                <div className="mx-auto max-w-content px-gutter">
                    <nav aria-label="Breadcrumb" className="py-6">
                        <ol className="flex flex-wrap items-center gap-x-2 text-body-sm text-content-muted">
                            <li>
                                <Link href="/" className="hover:text-brand-600">
                                    Home
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li>
                                <Link href="/properties" className="hover:text-brand-600">
                                    Properties
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li aria-current="page" className="font-medium text-content">
                                {property.name}
                            </li>
                        </ol>
                    </nav>

                    <header className="mb-9 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            {isSold ? (
                                <Chip variant="outline" className="mb-4">Sold — shown for reference</Chip>
                            ) : (
                                <Eyebrow tone="brand">{property.status}</Eyebrow>
                            )}
                            <h1 className="mt-2 text-balance font-display text-[clamp(2.125rem,4.6vw,3.625rem)] font-bold leading-[1.04] tracking-[-0.03em] text-content">
                                {property.name}
                            </h1>
                            <p className="mt-3 flex items-start gap-2 text-body-lg text-content-muted">
                                <IconMapPin size={20} className="mt-1 shrink-0" />
                                {property.address}
                            </p>
                        </div>
                        <div className="shrink-0 md:text-right">
                            <p className="font-display text-[clamp(1.5rem,2.4vw,2.125rem)] font-bold tracking-[-0.02em] text-brand-600">
                                {price}
                            </p>
                            {property.priceLabel && (
                                <p className="mt-1 text-body-sm text-content-muted">{property.priceLabel}</p>
                            )}
                        </div>
                    </header>

                    {/* Gallery. When the record has no extra images the main
                        photograph runs full width — the previous version padded
                        the grid with four identical empty placeholder tiles. */}
                    <div
                        className={`mb-12 grid gap-2 overflow-hidden rounded-showcase border border-hairline/[0.06] shadow-ambient sm:gap-3 ${
                            gallery.length > 0 ? 'md:grid-cols-4 md:grid-rows-2' : ''
                        }`}
                    >
                        <div
                            className={`relative aspect-[16/10] md:aspect-auto ${
                                gallery.length > 0 ? 'md:col-span-2 md:row-span-2' : ''
                            }`}
                        >
                            <img
                                src={property.image}
                                alt={`${property.name} — exterior view from the approach`}
                                className="h-full w-full object-cover"
                                fetchPriority="high"
                            />
                        </div>
                        {gallery.slice(0, 4).map((img, i) => {
                            const overflow = gallery.length - 4;
                            return (
                                <div key={img} className="relative hidden md:block">
                                    <img
                                        src={img}
                                        alt={`${property.name} — interior and grounds, view ${i + 2}`}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                    {i === 3 && overflow > 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 font-semibold text-white">
                                            +{overflow} more
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid gap-12 lg:grid-cols-3">
                        <div className="space-y-12 lg:col-span-2">
                            <dl className="grid grid-cols-2 gap-6 rounded-surface border border-hairline/10 bg-surface p-6 shadow-soft sm:grid-cols-4">
                                {stats.map(({ icon: Glyph, value, label }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <Glyph size={24} className="shrink-0 text-brand-600" />
                                        <div>
                                            <dd className="font-display text-body-lg font-semibold text-content">
                                                {value}
                                            </dd>
                                            <dt className="text-label font-semibold uppercase text-content-muted">
                                                {label}
                                            </dt>
                                        </div>
                                    </div>
                                ))}
                            </dl>

                            {property.description && (
                                <section>
                                    <SectionHeading>About this property</SectionHeading>
                                    <div className="max-w-[42rem] whitespace-pre-wrap text-body text-content-muted">
                                        {property.description}
                                    </div>
                                </section>
                            )}

                            {(property.amenities?.length ?? 0) > 0 && (
                                <section>
                                    <SectionHeading>What the property includes</SectionHeading>
                                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {property.amenities?.map((amenity) => (
                                            <li
                                                key={amenity}
                                                className="flex items-center gap-3 rounded-pill border border-hairline/10 bg-surface px-4 py-3"
                                            >
                                                {/* One mark for every entry. Guessing a
                                                    pictogram per amenity string produced
                                                    icons that contradicted the label. */}
                                                <IconCheck size={18} className="shrink-0 text-brand-600" />
                                                <span className="text-body-sm font-medium text-content">
                                                    {amenity}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {(property.floorPlans?.length ?? 0) > 0 && (
                                <section>
                                    <SectionHeading>Floor plans</SectionHeading>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        {property.floorPlans?.map((plan) => (
                                            <figure
                                                key={plan.label}
                                                className="overflow-hidden rounded-surface border border-hairline/10 bg-surface shadow-soft"
                                            >
                                                <figcaption className="border-b border-hairline/10 px-4 py-3 text-body-sm font-semibold text-content">
                                                    {plan.label}
                                                </figcaption>
                                                <img
                                                    src={plan.image}
                                                    alt={`Floor plan: ${plan.label}`}
                                                    className="aspect-[4/3] w-full bg-surface-2 object-contain p-4"
                                                    loading="lazy"
                                                />
                                            </figure>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section>
                                <SectionHeading>Documentation and process</SectionHeading>
                                <div className="space-y-6">
                                    {ASSURANCES.map(({ icon: Glyph, title, body }) => (
                                        <div key={title} className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-brand-600/10 text-brand-600">
                                                <Glyph size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-display text-body-lg font-semibold text-content">
                                                    {title}
                                                </h3>
                                                <p className="mt-1.5 max-w-[38rem] text-body text-content-muted">
                                                    {body}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* The form is in the flow on mobile and sticky from lg
                            up. It was previously hidden below lg, which left
                            small screens with no way to enquire at all. */}
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
                                <PropertyContactForm propertyName={property.name} isSold={isSold} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
