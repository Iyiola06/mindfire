import type { Metadata } from 'next'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { OFFICE } from '@/lib/contact'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
    title: 'Privacy policy',
    description:
        'What personal information Mindfire Homes collects when you enquire about a property or subscribe to the newsletter, how it is used, and how to request its deletion.',
    alternates: { canonical: '/privacy' },
    openGraph: { type: 'website', url: absoluteUrl('/privacy') },
}

/**
 * OWNER ACTION REQUIRED — legal review.
 *
 * The text below describes what this codebase actually does with personal
 * data, which is more than the previous single paragraph said, but it is not a
 * lawyer-reviewed privacy policy and does not claim to be one. Have it checked
 * against NDPR before launch, and add a data controller contact if one is
 * registered.
 */
export default function PrivacyPage() {
    return (
        <PublicLayout>
            <PageHeader
                eyebrow="Legal"
                title="Privacy policy"
                lede="What we collect, why we collect it, and how to have it removed."
            />

            <div className="bg-bg pb-section pt-section-sm">
                <div className="mx-auto max-w-3xl px-gutter">
                    <div className="prose prose-lg max-w-none text-content-muted prose-headings:font-display prose-headings:tracking-tight prose-headings:text-content prose-a:text-brand-600 dark:prose-invert">
                        <h2>What we collect</h2>
                        <p>
                            Two things, and only when you give them to us. If you send an enquiry through
                            the contact form or a property page, we store the name, email address, phone
                            number, budget, and message you submit. If you subscribe to the newsletter, we
                            store your email address and nothing else.
                        </p>

                        <h2>Why we collect it</h2>
                        <p>
                            Enquiry details are used to answer your enquiry and to arrange a viewing.
                            Newsletter addresses are used to send the newsletter. We do not sell personal
                            information, and we do not share it with third parties for their own marketing.
                        </p>

                        <h2>How long we keep it</h2>
                        <p>
                            Enquiries are retained while they are live and for as long as we may reasonably
                            need to answer a follow-up. Newsletter subscriptions are retained until you
                            unsubscribe, which every issue links to.
                        </p>

                        <h2>Analytics</h2>
                        <p>
                            This site uses Google Analytics to understand which pages are read. It records
                            page views and approximate location, not the contents of any form.
                        </p>

                        <h2>Asking for your data, or its deletion</h2>
                        <p>
                            Write to{' '}
                            <a href={`mailto:${OFFICE.email}`}>{OFFICE.email}</a> and ask for a copy of what
                            we hold, a correction, or deletion. We will action it and confirm{' '}
                            {OFFICE.responseTime}.
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}
