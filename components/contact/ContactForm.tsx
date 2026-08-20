'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createLead } from '@/lib/actions';
import { OFFICE } from '@/lib/contact';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconSend } from '@/components/icons';

const FIELD =
    'w-full rounded-control border border-hairline/15 bg-surface-2 px-4 py-3 text-body text-content outline-none transition-colors duration-short ease-standard placeholder:text-content-muted focus-visible:border-brand-600';
const LABEL = 'mb-1.5 block text-label font-semibold uppercase text-content-muted';

const SUBJECTS = [
    'General inquiry',
    'I want to buy a property',
    'I want to sell my property',
    'I am looking for an investment',
    'Something else',
];

export const ContactForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: SUBJECTS[0],
        message: '',
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
                // The subject is the interest, and the visitor's own words go
                // through in full. The previous version also sent a fabricated
                // budget of "$0 - $1M+" that nobody had entered.
                propertyInterest: formData.subject,
                message: formData.message,
            });

            if (res.success) {
                setIsSuccess(true);
                setFormData({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
            } else {
                // The form keeps its values — a failed send must not cost the
                // visitor their typing.
                setError(res.error ?? 'We could not send your message. Please try again.');
            }
        } catch {
            setError(
                `We could not send your message. Please try again, or write to ${OFFICE.email} directly.`,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex h-full min-h-[28rem] flex-col items-center justify-center rounded-showcase border border-hairline/[0.06] bg-surface p-8 text-center shadow-ambient md:p-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-pill bg-brand-600/10 text-brand-600">
                    <IconSend size={28} />
                </div>
                <h2 className="font-display text-display-sm font-semibold tracking-tight text-content">
                    Message received
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-body text-content-muted">
                    Thank you for reaching out. An advisor will reply {OFFICE.responseTime}.
                </p>
                <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="mt-8 min-h-[44px] font-semibold text-brand-600 hover:underline"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <div className="h-full rounded-showcase border border-hairline/[0.06] bg-surface p-8 shadow-ambient md:p-10">
            <Eyebrow>Enquiry</Eyebrow>
            <h2 className="mb-2 mt-2 font-display text-display-sm font-semibold tracking-tight text-content">
                Send a message
            </h2>
            <p className="mb-8 text-body-sm text-content-muted">
                We reply {OFFICE.responseTime}. No newsletters, no follow-up lists — just an answer.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className={LABEL} htmlFor="contact-name">
                            Full name
                        </label>
                        <input
                            type="text"
                            id="contact-name"
                            required
                            autoComplete="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={FIELD}
                        />
                    </div>
                    <div>
                        <label className={LABEL} htmlFor="contact-email">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="contact-email"
                            required
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={FIELD}
                        />
                    </div>
                </div>

                <div>
                    <label className={LABEL} htmlFor="contact-phone">
                        Phone number <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                        type="tel"
                        id="contact-phone"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="+234 800 000 0000"
                        aria-describedby="contact-phone-hint"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={FIELD}
                    />
                    <p id="contact-phone-hint" className="mt-1.5 text-body-sm text-content-muted">
                        Nigerian mobile or international number, including country code.
                    </p>
                </div>

                <div>
                    <label className={LABEL} htmlFor="contact-subject">
                        What is this about?
                    </label>
                    <select
                        id="contact-subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className={FIELD}
                    >
                        {SUBJECTS.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={LABEL} htmlFor="contact-message">
                        Your message
                    </label>
                    <textarea
                        id="contact-message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="How can we help you?"
                        className={`${FIELD} resize-none`}
                    ></textarea>
                </div>

                {/* role="alert" so a failure is announced rather than only
                    appearing above the button. */}
                {error && (
                    <p
                        role="alert"
                        className="rounded-control bg-red-50 px-4 py-3 text-body-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"
                    >
                        {error}
                    </p>
                )}

                <Button type="submit" size="lg" disabled={isSubmitting} icon={<IconSend size={19} />} className="w-full md:w-auto">
                    {isSubmitting ? 'Sending…' : 'Send message'}
                </Button>

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
