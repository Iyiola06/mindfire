'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createLead } from '@/lib/actions';
import { OFFICE, displayPhone, mailtoHref, whatsappHref } from '@/lib/contact';
import { IconCalendarCheck, IconCheck, IconSpinner } from '@/components/icons';

const ADVISOR_NAME = 'Mindfire client advisory team';

const FIELD =
    'w-full rounded-control border border-hairline/15 bg-surface-2 px-4 py-3 text-body text-content outline-none transition-colors duration-short ease-standard placeholder:text-content-muted focus-visible:border-brand-600';
const LABEL = 'mb-1.5 block text-label font-semibold uppercase text-content-muted';

export const PropertyContactForm = ({
    propertyName,
    isSold = false,
}: {
    propertyName: string;
    /** A sold property must not invite a viewing that cannot happen. */
    isSold?: boolean;
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        preferredDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await createLead({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                propertyInterest: `Interest in ${propertyName}`,
                message: formData.preferredDate
                    ? `Viewing request for ${propertyName}. Preferred date: ${formData.preferredDate}.`
                    : `Viewing request for ${propertyName}.`,
            });

            if (res.success) {
                setIsSuccess(true);
                setFormData({ name: '', phone: '', email: '', preferredDate: '' });
            } else {
                // The form keeps its values — a failed send must not cost the
                // visitor their typing.
                setError('We could not send that request. Please try again, or call us directly.');
            }
        } catch {
            setError('We could not send that request. Please try again, or call us directly.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSold) {
        return (
            <div className="rounded-showcase border border-hairline/[0.06] bg-surface p-6 shadow-ambient md:p-8">
                <p className="mb-2 text-label font-semibold uppercase text-content-muted">No longer available</p>
                <h2 className="font-display text-display-sm font-semibold text-content">
                    This property has been sold
                </h2>
                <p className="mt-3 text-body text-content-muted">
                    We keep sold listings online for reference. Similar properties in the same area come up
                    regularly — we can send you the next ones that match.
                </p>
                <Link
                    href="/properties?status=For+Sale"
                    className="mt-6 flex min-h-[44px] items-center justify-center rounded-pill bg-brand-600 px-6 font-semibold text-white shadow-cta transition-colors duration-short ease-standard hover:bg-brand-700"
                >
                    Find similar properties
                </Link>
                <Link
                    href="/contact"
                    className="mt-3 flex min-h-[44px] items-center justify-center rounded-pill border border-hairline/15 px-6 font-semibold text-content transition-colors duration-short ease-standard hover:border-brand-600"
                >
                    Get notified about comparable listings
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="rounded-showcase border border-hairline/[0.06] bg-surface p-8 text-center shadow-ambient">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600/10 text-brand-600">
                    <IconCheck size={32} />
                </div>
                <h2 className="font-display text-display-sm font-semibold text-content">Request received</h2>
                <p className="mt-3 text-body text-content-muted">
                    An advisor will contact you {OFFICE.responseTime} to confirm a time. This is a request,
                    not a confirmed appointment — we will agree the slot with you first.
                </p>
                <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="mt-6 min-h-[44px] font-semibold text-brand-600 hover:underline"
                >
                    Send another request
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-showcase border border-hairline/[0.06] bg-surface p-6 shadow-ambient md:p-8">
            <div className="mb-6 border-b border-hairline/10 pb-6">
                <p className="mb-2 text-label font-semibold uppercase text-content-muted">
                    {ADVISOR_NAME}
                </p>
                <h2 className="font-display text-display-sm font-semibold text-content">
                    Book a private viewing
                </h2>
                <p className="mt-2 text-body-sm text-content-muted">
                    We reply {OFFICE.responseTime}. Prefer to reach us directly?{' '}
                    {OFFICE.phoneE164 ? (
                        <>
                            <a
                                href={`tel:${OFFICE.phoneE164}`}
                                className="font-semibold text-brand-600 hover:underline"
                            >
                                {displayPhone(OFFICE.phoneE164)}
                            </a>{' '}
                            or{' '}
                            <a
                                href={whatsappHref(
                                    OFFICE.phoneE164,
                                    `Hello, I would like to view ${propertyName}.`,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-brand-600 hover:underline"
                            >
                                WhatsApp
                            </a>
                            .
                        </>
                    ) : (
                        <a
                            href={mailtoHref(`Viewing enquiry: ${propertyName}`)}
                            className="font-semibold text-brand-600 hover:underline"
                        >
                            {OFFICE.email}
                        </a>
                    )}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
                <div>
                    <label className={LABEL} htmlFor="lead-name">
                        Full name
                    </label>
                    <input
                        type="text"
                        id="lead-name"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={FIELD}
                    />
                </div>

                <div>
                    <label className={LABEL} htmlFor="lead-phone">
                        Phone number
                    </label>
                    <input
                        type="tel"
                        id="lead-phone"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="+234 800 000 0000"
                        aria-describedby="lead-phone-hint"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={FIELD}
                    />
                    <p id="lead-phone-hint" className="mt-1.5 text-body-sm text-content-muted">
                        Nigerian mobile or international number, including country code.
                    </p>
                </div>

                <div>
                    <label className={LABEL} htmlFor="lead-email">
                        Email address
                    </label>
                    <input
                        type="email"
                        id="lead-email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={FIELD}
                    />
                </div>

                <div>
                    <label className={LABEL} htmlFor="lead-date">
                        Preferred viewing date <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                        type="date"
                        id="lead-date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className={FIELD}
                    />
                </div>

                {/* role="alert" so the failure is announced rather than only
                    appearing above the button. */}
                {error && (
                    <p role="alert" className="rounded-control bg-red-50 px-4 py-3 text-body-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-pill bg-brand-600 py-3.5 font-semibold text-white shadow-cta transition-colors duration-short ease-standard hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? <IconSpinner size={20} className="animate-spin" /> : <IconCalendarCheck size={20} />}
                    {isSubmitting ? 'Sending request…' : 'Request a viewing'}
                </button>

                <p className="text-body-sm text-content-muted">
                    We use your details only to answer this enquiry. See our{' '}
                    <Link href="/privacy" className="font-semibold text-brand-600 hover:underline">
                        privacy policy
                    </Link>
                    .
                </p>
            </form>
        </div>
    );
};
