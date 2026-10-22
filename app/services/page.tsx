import React from 'react';
import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { absoluteUrl, breadcrumbJsonLd, SITE } from '@/lib/seo';

export const metadata: Metadata = {
    title: 'Services: estate development, land, construction, and title perfection',
    description:
        'Mindfire Homes is a full-cycle real estate company: estate development, land banking and sales, building and construction, investment advisory, documentation and title perfection, and facility management.',
    alternates: { canonical: '/services' },
    openGraph: {
        type: 'website',
        url: absoluteUrl('/services'),
        title: `Services | ${SITE.name}`,
        description:
            'From acquiring the land to managing the finished estate: one company, accountable at every stage.',
    },
};

/**
 * The six lines of business, in the order a project moves through them.
 * Wording comes from the company's own description of its services; each
 * photograph is from a Mindfire site (see lib/media.ts).
 */
const SERVICES = [
    {
        title: 'Estate development',
        body: 'We acquire, design, and develop serviced estates, planned so that the infrastructure is part of the product, not a promise for later.',
        includes: ['Road networks and drainage', 'Electricity', 'Estate security'],
        image: {
            src: '/hero/estate-courtyard.webp',
            alt: 'Completed Mindfire estate: detached villas around a central courtyard and pool',
        },
    },
    {
        title: 'Land banking and sales',
        body: 'Strategically located land with genuine titles, for building a home or holding as an investment.',
        includes: ['FCDA Certificate of Occupancy (C of O)', 'Right of Occupancy (R of O)', 'Deeds'],
        image: {
            src: '/projects/land-hilltop-plots.webp',
            alt: 'Hilltop plots with foundation blockwork overlooking the city in morning haze',
        },
    },
    {
        title: 'Building and construction',
        body: 'From bungalows to luxury duplexes, we build modern, functional homes for the contemporary Nigerian family.',
        includes: ['Bungalows', 'Terraces and townhouses', 'Detached and luxury duplexes'],
        image: {
            src: '/projects/finishing-townhouse-facade.webp',
            alt: 'White contemporary townhouse under scaffolding, with glass balconies and a roof pergola',
        },
    },
    {
        title: 'Property investment advisory',
        body: 'We guide clients to secure assets, not liabilities, and to buy where value appreciates, not where stories end.',
        includes: ['Location and appreciation analysis', 'Accompanied site inspections', 'Payment plans set out in writing'],
        image: {
            src: '/projects/land-site-inspection.webp',
            alt: 'Site inspection: three people walking a plot along a cleared path through farmland',
        },
    },
    {
        title: 'Documentation and title perfection',
        body: 'We handle the difficult part, so that the asset you pay for is truly, provably yours.',
        includes: ['Land registry search', 'Verification', 'Registration and title perfection'],
        image: {
            src: '/projects/handover-gated-duplex.webp',
            alt: 'Completed detached duplex behind a wrought-iron gate',
        },
    },
    {
        title: 'Facility management and after-sales',
        body: 'Our relationship does not end at payment. We manage, maintain, and protect the investment after handover.',
        includes: ['Estate and property maintenance', 'Facility management', 'After-sales support'],
        image: {
            src: '/projects/handover-estate-street.webp',
            alt: 'Completed estate street lined with three-storey villas, lawns, and lamp posts',
        },
    },
];

export default function ServicesPage() {
    return (
        <PublicLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Services', path: '/services' },
                        ]),
                    ),
                }}
            />

            <PageHeader
                eyebrow="What we do"
                title="Full-cycle real estate, from land to after-sales."
                align="center"
                lede="Since 2016, Mindfire Homes has done the hard work behind every property (acquisition, due diligence, documentation, infrastructure, and development) so you can invest with confidence and live with pride."
            />

            <section className="bg-bg pb-section pt-section-sm">
                <ol className="mx-auto grid max-w-content gap-x-6 gap-y-12 px-gutter md:grid-cols-2 lg:grid-cols-3">
                    {SERVICES.map(({ title, body, includes, image }, i) => (
                        <Reveal as="li" key={title} delay={(i % 3) * 80} className="flex flex-col">
                            <div className="aspect-[4/3] overflow-hidden rounded-surface bg-surface shadow-soft">
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                            <div className="mt-5 flex gap-[1.125rem]">
                                <span
                                    aria-hidden="true"
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-600/[0.09] font-display text-body-sm font-bold text-brand-600"
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <h2 className="font-display text-body-lg font-semibold text-content">{title}</h2>
                                    <p className="mt-1.5 text-body-sm leading-[1.6] text-content-muted">{body}</p>
                                    <ul className="mt-4 space-y-2">
                                        {includes.map((item) => (
                                            <li key={item} className="flex items-center gap-3 text-body-sm text-content">
                                                <span
                                                    aria-hidden="true"
                                                    className="h-2 w-2 shrink-0 rounded-pill bg-accent-500"
                                                />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </ol>
            </section>

            {/* Promise */}
            <section className="border-y border-hairline/[0.06] bg-surface py-section">
                <Reveal className="mx-auto max-w-3xl px-gutter text-center">
                    <Eyebrow tone="brand">Our promise</Eyebrow>
                    <h2 className="mt-3 text-balance font-display text-[clamp(1.875rem,4.6vw,3.625rem)] font-bold leading-[1.04] tracking-[-0.035em] text-content">
                        No stories, no stress, just value.
                    </h2>
                    <p className="mx-auto mt-4 max-w-[38rem] text-body-lg text-content-muted">
                        Every estate we touch is a promise. We do the acquisition, the due diligence, and the
                        paperwork first, so the property you buy is one you can live in, hold, or sell with
                        confidence.
                    </p>
                </Reveal>
            </section>

            {/* CTA */}
            <section className="bg-bg py-section">
                <Reveal className="mx-auto max-w-3xl px-gutter text-center">
                    <h2 className="text-balance font-display text-[clamp(1.875rem,4.6vw,3.625rem)] font-bold leading-[1.04] tracking-[-0.035em] text-content">
                        Secure assets, not excuses.
                    </h2>
                    <p className="mx-auto mt-4 max-w-[38rem] text-body-lg text-content-muted">
                        Tell us whether you want to build, buy, or invest. We will come back with the options
                        that fit, and the documentation for each.
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
                        <ButtonLink href="/contact" size="lg">
                            Speak with an advisor
                        </ButtonLink>
                        <ButtonLink href="/about#our-work" variant="outline" size="lg">
                            See our work
                        </ButtonLink>
                    </div>
                </Reveal>
            </section>
        </PublicLayout>
    );
}
