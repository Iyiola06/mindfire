import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContactForm } from '@/components/contact/ContactForm';
import { Reveal } from '@/components/motion/Reveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { OFFICE, displayPhone, mailtoHref, whatsappHref } from '@/lib/contact';
import { absoluteUrl, breadcrumbJsonLd, SITE } from '@/lib/seo';
import { IconClock, IconMail, IconMapPin, IconPhone, IconWhatsApp } from '@/components/icons';

export const metadata: Metadata = {
    title: 'Contact us — Abuja property advisors',
    description:
        'Questions about a property, a viewing to arrange, or a development to discuss — contact the Mindfire Homes advisory team in Abuja.',
    alternates: { canonical: '/contact' },
    openGraph: {
        type: 'website',
        url: absoluteUrl('/contact'),
        title: `Contact ${SITE.name}`,
        description: 'Arrange a viewing or ask about a property. We reply within one business day.',
    },
};

const INFO_CARDS = [
    {
        icon: IconMapPin,
        label: 'Office',
        render: () => (
            <>
                {OFFICE.name}
                <br />
                {OFFICE.streetLine ? (
                    <>
                        {OFFICE.streetLine}
                        <br />
                    </>
                ) : null}
                {OFFICE.cityLine}
            </>
        ),
    },
    {
        icon: IconMail,
        label: 'Email',
        render: () => (
            <a href={mailtoHref('Hello Mindfire Homes')} className="hover:underline">
                {OFFICE.email}
            </a>
        ),
    },
    {
        icon: IconClock,
        label: 'Office hours',
        render: () => OFFICE.hours,
    },
];

export default function ContactPage() {
    return (
        <PublicLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Contact', path: '/contact' },
                        ]),
                    ),
                }}
            />

            <PageHeader
                eyebrow="We are here to help"
                title="Get in touch"
                align="center"
                lede={`A question about a property, a viewing to arrange, or a development to discuss — the advisory team will come back to you ${OFFICE.responseTime}.`}
            />

            <div className="bg-bg pb-section pt-section-sm">
                <div className="mx-auto max-w-content px-gutter">
                    <div className="grid gap-10 lg:grid-cols-5 lg:gap-14">
                        <Reveal className="space-y-6 lg:col-span-2">
                            <div className="rounded-showcase border border-hairline/[0.06] bg-surface p-8 shadow-ambient">
                                <Eyebrow>Direct</Eyebrow>
                                <h2 className="mb-6 mt-2 font-display text-display-sm font-semibold tracking-tight text-content">
                                    Contact details
                                </h2>

                                <div className="space-y-6">
                                    {INFO_CARDS.map(({ icon: Glyph, label, render }) => (
                                        <div key={label} className="flex items-start gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-600/[0.09] text-brand-600">
                                                <Glyph size={22} />
                                            </div>
                                            <div>
                                                <p className="mb-1 text-eyebrow font-semibold uppercase text-content-muted">
                                                    {label}
                                                </p>
                                                <p className="text-body text-content">{render()}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Only rendered once the owner supplies the real
                                        number — see lib/contact.ts. */}
                                    {OFFICE.phoneE164 && (
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-600/[0.09] text-brand-600">
                                                <IconPhone size={22} />
                                            </div>
                                            <div>
                                                <p className="mb-1 text-eyebrow font-semibold uppercase text-content-muted">
                                                    Call us
                                                </p>
                                                <p className="text-body text-content">
                                                    <a href={`tel:${OFFICE.phoneE164}`} className="hover:underline">
                                                        {displayPhone(OFFICE.phoneE164)}
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {OFFICE.phoneE164 && (
                                <div className="rounded-showcase border border-hairline/[0.06] bg-surface p-8 shadow-ambient">
                                    <h2 className="mb-3 font-display text-display-sm font-semibold tracking-tight text-content">
                                        Prefer WhatsApp?
                                    </h2>
                                    <p className="mb-6 text-body-sm text-content-muted">
                                        Message the team directly and get an answer at your own pace.
                                    </p>
                                    <a
                                        href={whatsappHref(
                                            OFFICE.phoneE164,
                                            'Hello, I have a question about Mindfire Homes.',
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-hairline/15 px-6 font-semibold text-content transition-colors duration-short ease-standard hover:border-brand-600 hover:text-brand-600"
                                    >
                                        <IconWhatsApp size={20} />
                                        Message on WhatsApp
                                    </a>
                                </div>
                            )}
                        </Reveal>

                        <Reveal delay={100} className="lg:col-span-3">
                            <ContactForm />
                        </Reveal>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
