import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { HeroSearch } from '@/components/home/HeroSearch';
import { HeroStage, type StageFeature } from '@/components/home/HeroStage';
import { PropertyCard } from '@/components/shared/PropertyCard';
import { Reveal } from '@/components/motion/Reveal';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { supabase } from '@/lib/supabase';
import { FEATURE_ELEVATION, INTERIOR_PORTRAIT } from '@/lib/media';
import { absoluteUrl, ORGANISATION_JSON_LD, SITE } from '@/lib/seo';
import type { Property } from '@/types';
import { IconArrowRight } from '@/components/icons';

export const metadata: Metadata = {
    title: 'Premium property in Abuja, with the title checked first',
    description:
        'Mindfire Homes curates legally verified homes and investment opportunities across Abuja — documented titles, inspected construction, and payment terms agreed in writing before you commit.',
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        url: absoluteUrl('/'),
        title: `${SITE.name} — premium property in Abuja`,
        description:
            'Legally verified homes and investment opportunities in Abuja, with documented titles and payment terms agreed in writing.',
    },
};

export const dynamic = 'force-dynamic';

/** Process, not statistics. Each line is something the business does and can be
    held to, so nothing here needs a number we cannot evidence. */
const CREDIBILITY = [
    'Title verified before listing',
    'Full documentation provided',
    'Flexible payment plans',
    'Accompanied site visits',
];

const INVESTMENT_CASE = [
    {
        title: 'Location before everything',
        body: 'We list in districts with existing road access, power, and water — infrastructure that is already delivered rather than promised in a brochure.',
    },
    {
        title: 'Documentation checked first',
        body: 'Title type and status are confirmed with the relevant land registry before a property reaches this site, and the search results are shared with you.',
    },
    {
        title: 'Build quality you can inspect',
        body: 'Every development can be visited during construction. Specifications, finishes, and completion stage are documented rather than described.',
    },
    {
        title: 'Terms that fit the purchase',
        body: 'Payment plans are set out in writing before commitment — deposit, milestones, and duration, with no charge that appears later.',
    },
];

const formatPrice = (p: Pick<Property, 'price' | 'currency'>) =>
    p.currency === 'USD' ? `$${p.price.toLocaleString('en-US')}` : `₦${p.price.toLocaleString('en-NG')}`;

/** The hero chips read from the featured listing when there is one, so the
    stage always shows a property the visitor can actually go and look at. */
const stageFeature = (p?: Property): StageFeature =>
    p
        ? {
              eyebrow: p.address.split(',')[0]?.trim() || 'Featured',
              price: formatPrice(p),
              location: p.address,
              specs: [
                  { value: p.sqft.toLocaleString('en-NG'), label: 'Sq ft' },
                  { value: String(p.beds), label: 'Beds' },
                  { value: String(p.baths), label: 'Baths' },
              ],
          }
        : {
              eyebrow: 'Abuja',
              price: 'Verified titles',
              location: 'Documentation shared before you commit',
              specs: [
                  { value: '100%', label: 'Title checked' },
                  { value: '0', label: 'Hidden fees' },
              ],
          };

export default async function HomePage() {
    const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('featured', true)
        .order('createdAt', { ascending: false })
        .limit(4);

    const featured = (data ?? []) as Property[];
    const [headline, ...rest] = featured;

    return (
        <PublicLayout>
            {/* JSON-LD identifying the business itself. Emitted once, on the
                home page, which is what search engines treat as the entity's
                canonical home. */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANISATION_JSON_LD) }}
            />

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <header className="hero-wash relative -mt-nav overflow-hidden pt-nav">
                <div
                    aria-hidden="true"
                    className="ambient-glow absolute -top-[30%] left-1/2 h-[50rem] w-[75rem] max-w-none -translate-x-1/2 rounded-full"
                />

                <div className="relative mx-auto max-w-content px-gutter pt-[clamp(2rem,6vh,5rem)] text-center">
                    <Eyebrow tone="brand">Abuja · Verified titles · Guided purchase</Eyebrow>

                    <h1 className="mx-auto mt-4 max-w-[17ch] text-balance font-display text-[clamp(2.5rem,6.4vw,5.75rem)] font-bold leading-[1.0] tracking-[-0.04em] text-content">
                        Own exceptional property in Abuja’s most promising locations.
                    </h1>

                    <p className="mx-auto mt-6 max-w-[44rem] text-[clamp(1rem,1.6vw,1.25rem)] leading-[1.6] text-content-muted">
                        Mindfire Homes curates legally verified residences and investment opportunities —
                        documented titles, inspected construction, and payment terms agreed in writing
                        before you commit.
                    </p>

                    <div className="mt-9 flex flex-col flex-wrap justify-center gap-3.5 sm:flex-row">
                        <ButtonLink href="/properties" size="lg">
                            Explore properties
                        </ButtonLink>
                        <ButtonLink href="/contact" variant="glass" size="lg">
                            Book a private viewing
                        </ButtonLink>
                    </div>
                </div>

                <HeroStage feature={stageFeature(headline)} />
            </header>

            {/* ── Search ───────────────────────────────────────────────────── */}
            <section aria-labelledby="search-heading" className="bg-bg pb-section-sm pt-section-sm">
                <div className="mx-auto flex max-w-content flex-col items-center px-gutter">
                    <h2 id="search-heading" className="sr-only">
                        Search properties
                    </h2>
                    <HeroSearch />
                </div>
            </section>

            {/* ── Credibility ──────────────────────────────────────────────── */}
            <section aria-label="How we work" className="border-y border-hairline/[0.06] bg-surface">
                <Reveal as="ul" className="mx-auto grid max-w-content grid-cols-1 gap-5 px-gutter py-section-sm sm:grid-cols-2 lg:grid-cols-4">
                    {CREDIBILITY.map((label) => (
                        <li key={label} className="flex items-center gap-3">
                            {/* A 10px dot, not an icon: at icon size the bronze
                                is 2.9:1 and fails AA, and four different
                                pictograms competed with the words. */}
                            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-pill bg-accent-500" />
                            <span className="text-body-sm font-medium text-content">{label}</span>
                        </li>
                    ))}
                </Reveal>
            </section>

            {/* ── Featured ─────────────────────────────────────────────────── */}
            <section className="bg-bg py-section">
                <div className="mx-auto max-w-content px-gutter">
                    <Reveal className="mb-[clamp(2.25rem,5vw,3.5rem)] flex flex-wrap items-end justify-between gap-5">
                        <div className="max-w-[40rem]">
                            <Eyebrow>Current selection</Eyebrow>
                            <h2 className="mt-3 font-display text-[clamp(2rem,4.6vw,3.625rem)] font-bold leading-[1.04] tracking-[-0.03em] text-content">
                                Featured properties
                            </h2>
                            <p className="mt-4 text-body-lg text-content-muted">
                                A short list rather than a catalogue. Each of these has been visited, and its
                                documentation checked, by someone on our team.
                            </p>
                        </div>
                        <Link
                            href="/properties"
                            className="group inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-brand-600 transition-colors duration-short ease-standard hover:text-brand-700"
                        >
                            View all properties
                            <IconArrowRight size={18} className="transition-transform duration-short ease-standard group-hover:translate-x-0.5" />
                        </Link>
                    </Reveal>

                    {headline ? (
                        <>
                            {/* The lead listing gets the full showcase panel:
                                photograph on one side, the facts on the other,
                                inside a single lifted plate. */}
                            <Reveal className="grid items-center gap-[clamp(1.75rem,4vw,3.5rem)] rounded-showcase border border-hairline/[0.06] bg-surface p-[clamp(1.25rem,3vw,2.25rem)] shadow-ambient lg:grid-cols-2">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-surface">
                                    <img
                                        src={headline.image || FEATURE_ELEVATION.src}
                                        alt={`${headline.name} — exterior view from the approach`}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute left-3.5 top-3.5 flex gap-2">
                                        {headline.status && (
                                            <Badge color={headline.status === 'Sold' ? 'overlay' : 'primary'}>
                                                {headline.status}
                                            </Badge>
                                        )}
                                        <Badge color="secondary">Featured</Badge>
                                    </div>
                                </div>

                                <div>
                                    <Eyebrow tone="brand">{headline.address.split(',')[0]}</Eyebrow>
                                    <h3 className="mt-2 font-display text-[clamp(1.625rem,3vw,2.5rem)] font-bold tracking-[-0.025em] text-content">
                                        {headline.name}
                                    </h3>
                                    <p className="mt-2.5 font-display text-[clamp(1.25rem,2vw,1.625rem)] font-bold tracking-[-0.02em] text-brand-600">
                                        {formatPrice(headline)}
                                    </p>
                                    {headline.description && (
                                        <p className="mt-4 max-w-[38rem] text-body text-content-muted">
                                            {headline.description.slice(0, 220)}
                                            {headline.description.length > 220 ? '…' : ''}
                                        </p>
                                    )}

                                    <div className="mt-6 flex flex-wrap gap-2.5">
                                        <Chip>{headline.beds} bedrooms</Chip>
                                        <Chip>{headline.baths} bathrooms</Chip>
                                        <Chip>{headline.sqft.toLocaleString('en-NG')} sq ft</Chip>
                                    </div>

                                    <ButtonLink href={`/properties/${headline.id}`} className="mt-7">
                                        Enquire about this home
                                    </ButtonLink>
                                </div>
                            </Reveal>

                            {rest.length > 0 && (
                                <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                                    {rest.map((property, i) => (
                                        <Reveal key={property.id} delay={i * 80}>
                                            <PropertyCard property={property} />
                                        </Reveal>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        /* An empty response is a real state, not an error — the
                           section stays intentional rather than collapsing. */
                        <Reveal className="rounded-showcase border border-hairline/[0.06] bg-surface p-12 text-center shadow-ambient">
                            <p className="font-display text-display-sm font-semibold text-content">
                                No featured properties right now
                            </p>
                            <p className="mx-auto mt-2 max-w-md text-body text-content-muted">
                                Our current listings are still available to browse in full.
                            </p>
                            <ButtonLink href="/properties" className="mt-6">
                                Browse all properties
                            </ButtonLink>
                        </Reveal>
                    )}
                </div>
            </section>

            {/* ── Investment case ──────────────────────────────────────────── */}
            <section id="why" className="border-t border-hairline/[0.06] bg-surface py-section">
                <div className="mx-auto grid max-w-content items-center gap-[clamp(2.5rem,6vw,5rem)] px-gutter lg:grid-cols-2">
                    <Reveal>
                        <Eyebrow>Why these properties</Eyebrow>
                        <h2 className="mt-3 font-display text-[clamp(1.875rem,4.2vw,3.375rem)] font-bold leading-[1.05] tracking-[-0.03em] text-content">
                            What we check before a property is listed.
                        </h2>
                        <p className="mt-4 max-w-[38rem] text-body-lg text-content-muted">
                            Property in Abuja rewards diligence over speed. These are the four things we
                            confirm on your behalf — and the evidence for each is available on request.
                        </p>

                        <ol className="mt-10 flex flex-col gap-6">
                            {INVESTMENT_CASE.map(({ title, body }, i) => (
                                <li key={title} className="flex gap-[1.125rem]">
                                    <span
                                        aria-hidden="true"
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-600/[0.09] font-display text-body-sm font-bold text-brand-600"
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h3 className="font-display text-body-lg font-semibold text-content">{title}</h3>
                                        <p className="mt-1.5 max-w-[38rem] text-body-sm leading-[1.6] text-content-muted">
                                            {body}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <ButtonLink href="/contact" size="lg" className="mt-9">
                            Speak with an advisor
                        </ButtonLink>
                    </Reveal>

                    <Reveal delay={120}>
                        <div className="aspect-[4/5] overflow-hidden rounded-showcase shadow-elevated">
                            <img
                                src={INTERIOR_PORTRAIT.src}
                                alt={INTERIOR_PORTRAIT.alt}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── Advisor CTA. One dominant action, not five. ───────────────── */}
            <section className="bg-bg py-section">
                <Reveal className="mx-auto max-w-3xl px-gutter text-center">
                    <h2 className="text-balance font-display text-[clamp(1.875rem,4.6vw,3.625rem)] font-bold leading-[1.04] tracking-[-0.035em] text-content">
                        Talk to someone who has visited the property.
                    </h2>
                    <p className="mx-auto mt-4 max-w-[38rem] text-body-lg text-content-muted">
                        Tell us what you are looking for and your budget. We will send the matching
                        properties with their documentation status, and arrange a viewing when you are ready.
                    </p>
                    <ButtonLink href="/contact" size="lg" className="mt-8">
                        Book a private viewing
                    </ButtonLink>
                    <p className="mt-4 text-body-sm text-content-muted">
                        Your details are used only to answer your enquiry. We never sell them on.
                    </p>
                </Reveal>
            </section>
        </PublicLayout>
    );
}
