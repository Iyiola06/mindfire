import React from 'react';
import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { OFFICE } from '@/lib/contact';
import { INTERIOR_PORTRAIT } from '@/lib/media';
import { absoluteUrl, breadcrumbJsonLd, SITE } from '@/lib/seo';

export const metadata: Metadata = {
    title: 'About us — Abuja property advisors',
    description:
        'How Mindfire Homes works: titles checked with the land registry before listing, documented specifications, accompanied site visits, and payment terms agreed in writing.',
    alternates: { canonical: '/about' },
    openGraph: {
        type: 'website',
        url: absoluteUrl('/about'),
        title: `About ${SITE.name}`,
        description:
            'Titles checked with the land registry before listing, documented specifications, and payment terms agreed in writing.',
    },
};

/**
 * OWNER ACTION REQUIRED — company facts.
 *
 * The previous version of this page stated "Founded in 2015", "10+ Years
 * Experience", and "$500M Sales Volume". None of those figures exist anywhere
 * in this codebase or its data, so they have been removed rather than carried
 * forward. Supply the real values here and the milestones band renders itself.
 *
 * Every entry must be something the business can evidence if a buyer asks.
 * Leave the array empty rather than filling it with round numbers.
 *
 *   { value: '2015', label: 'Year founded' },
 *   { value: '84', label: 'Homes handed over' },
 */
const MILESTONES: { value: string; label: string }[] = [];

/**
 * OWNER ACTION REQUIRED — team.
 *
 * The previous version listed four people — "Marcus Reynolds", "Elena
 * Rodriguez", "David Chen", "Sarah Jenkins" — with stock avatars from
 * pravatar.cc. They are not real staff, so they have been removed: a buyer
 * choosing an advisor on the strength of an invented biography is a real harm.
 *
 * Add the actual team with real photographs and the section appears. Until
 * then the page routes enquiries to the advisory team as a whole, which is
 * true.
 */
const TEAM: { name: string; role: string; image: string; alt: string }[] = [];

/** Practice rather than promise. Each of these is a step the business
    performs and can be held to, which is why none of them needs a number. */
const HOW_WE_WORK = [
    {
        title: 'We check the title first',
        body: 'Before a property is published here, its title type and current status are confirmed with the relevant land registry. If a search raises something unresolved, the listing does not go up.',
    },
    {
        title: 'We put the documents in your hands',
        body: 'Search results, survey plan, deed of assignment, and the payment schedule are shared in full on request — not summarised, and not held back until you have committed.',
    },
    {
        title: 'We only list where infrastructure exists',
        body: 'Road access, power, and water have to be delivered rather than promised. A masterplan drawing is not evidence that a district is ready to live in.',
    },
    {
        title: 'We take you to the site',
        body: 'Accompanied visits are arranged at your convenience, including mid-construction, so you see the build stage and the finishes for yourself.',
    },
    {
        title: 'We put the terms in writing before you commit',
        body: 'Deposit, milestone dates, duration, and every associated cost are set out on paper in advance. Nothing is introduced after a commitment has been made.',
    },
];

export default function AboutPage() {
    return (
        <PublicLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'About', path: '/about' },
                        ]),
                    ),
                }}
            />

            <PageHeader
                eyebrow="Who we are"
                title="Property advice you can check."
                align="center"
                lede="Mindfire Homes sells residential and investment property in Abuja. What distinguishes the work is not the adjectives — it is that every claim we make about a property is backed by a document we will show you."
            />

            {/* Position */}
            <section className="bg-bg py-section">
                <div className="mx-auto grid max-w-content items-center gap-[clamp(2.5rem,6vw,5rem)] px-gutter lg:grid-cols-2">
                    <Reveal>
                        <div className="aspect-[4/5] overflow-hidden rounded-showcase shadow-elevated">
                            <img
                                src={INTERIOR_PORTRAIT.src}
                                alt="Completed residence with landscaped grounds and a covered entrance"
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <Eyebrow>Our position</Eyebrow>
                        <h2 className="mt-3 font-display text-[clamp(1.875rem,4.2vw,3.375rem)] font-bold leading-[1.05] tracking-[-0.03em] text-content">
                            Diligence is the product.
                        </h2>
                        <div className="mt-6 space-y-5 text-body-lg text-content-muted">
                            <p className="max-w-[42rem]">
                                Buying property in Abuja carries a specific risk, and it is not usually the
                                price. It is the title: whether the land is what the seller says it is,
                                whether the documents will survive scrutiny, and whether the infrastructure
                                shown in the brochure has been built.
                            </p>
                            <p className="max-w-[42rem]">
                                We built this business around answering those questions before a buyer is
                                asked for money. Every property here has been visited by someone on the
                                team, and its documentation checked, before it appears on the site — and the
                                evidence for both is yours on request.
                            </p>
                        </div>

                        {MILESTONES.length > 0 && (
                            <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-hairline/10 pt-8">
                                {MILESTONES.map(({ value, label }) => (
                                    <div key={label}>
                                        <dd className="font-display text-display-md font-bold tracking-tight text-brand-600">
                                            {value}
                                        </dd>
                                        <dt className="mt-1 text-eyebrow font-semibold uppercase text-content-muted">
                                            {label}
                                        </dt>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </Reveal>
                </div>
            </section>

            {/* How we work */}
            <section className="border-y border-hairline/[0.06] bg-surface py-section">
                <div className="mx-auto max-w-content px-gutter">
                    <Reveal className="mb-[clamp(2.5rem,5vw,4rem)] max-w-[40rem]">
                        <Eyebrow>The Mindfire way</Eyebrow>
                        <h2 className="mt-3 font-display text-[clamp(1.875rem,4.2vw,3.375rem)] font-bold leading-[1.05] tracking-[-0.03em] text-content">
                            What we do on every property.
                        </h2>
                        <p className="mt-4 text-body-lg text-content-muted">
                            Not values on a wall — the five steps that happen before a listing reaches you,
                            and that you can hold us to.
                        </p>
                    </Reveal>

                    <ol className="grid gap-x-12 gap-y-9 md:grid-cols-2">
                        {HOW_WE_WORK.map(({ title, body }, i) => (
                            <Reveal as="li" key={title} delay={(i % 2) * 80} className="flex gap-[1.125rem]">
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
                            </Reveal>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Team — renders only once real people are supplied. */}
            {TEAM.length > 0 && (
                <section className="bg-bg py-section">
                    <div className="mx-auto max-w-content px-gutter">
                        <Reveal className="mb-[clamp(2.5rem,5vw,4rem)] max-w-[40rem]">
                            <Eyebrow>Your advisor</Eyebrow>
                            <h2 className="mt-3 font-display text-[clamp(1.875rem,4.2vw,3.375rem)] font-bold leading-[1.05] tracking-[-0.03em] text-content">
                                The people you will deal with
                            </h2>
                            <p className="mt-4 text-body-lg text-content-muted">
                                You will have one advisor from first enquiry through to handover.
                            </p>
                        </Reveal>

                        <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            {TEAM.map((member) => (
                                <li key={member.name} className="text-center">
                                    <div className="mx-auto mb-5 aspect-square w-40 overflow-hidden rounded-pill border border-hairline/10 shadow-soft">
                                        <img
                                            src={member.image}
                                            alt={member.alt}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                    <h3 className="font-display text-body-lg font-semibold text-content">
                                        {member.name}
                                    </h3>
                                    <p className="mt-1 text-eyebrow font-semibold uppercase text-content-muted">
                                        {member.role}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="bg-bg py-section">
                <Reveal className="mx-auto max-w-3xl px-gutter text-center">
                    <h2 className="text-balance font-display text-[clamp(1.875rem,4.6vw,3.625rem)] font-bold leading-[1.04] tracking-[-0.035em] text-content">
                        Start with a question, not a commitment.
                    </h2>
                    <p className="mx-auto mt-4 max-w-[38rem] text-body-lg text-content-muted">
                        Tell us what you are looking for. We will send the properties that match, with their
                        documentation status, and arrange a viewing when you are ready.
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
                        <ButtonLink href="/contact" size="lg">
                            Speak with an advisor
                        </ButtonLink>
                        <ButtonLink href="/properties" variant="outline" size="lg">
                            Browse properties
                        </ButtonLink>
                    </div>
                    <p className="mt-6 text-body-sm text-content-muted">
                        Or write to{' '}
                        <a href={`mailto:${OFFICE.email}`} className="font-semibold text-brand-600 hover:underline">
                            {OFFICE.email}
                        </a>
                        . We reply {OFFICE.responseTime}.
                    </p>
                </Reveal>
            </section>
        </PublicLayout>
    );
}
