import type { Metadata } from 'next'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { OFFICE } from '@/lib/contact'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
    title: 'Terms of service',
    description:
        'The terms governing use of the Mindfire Homes website, including the status of listing information, prices, and availability.',
    alternates: { canonical: '/terms' },
    openGraph: { type: 'website', url: absoluteUrl('/terms') },
}

/**
 * OWNER ACTION REQUIRED — legal review.
 *
 * These terms state what is already true of the site as built. They have not
 * been reviewed by a lawyer and should be before launch, particularly the
 * sections on listing accuracy and liability.
 */
export default function TermsPage() {
    return (
        <PublicLayout>
            <PageHeader
                eyebrow="Legal"
                title="Terms of service"
                lede="The basis on which this site publishes property information."
            />

            <div className="bg-bg pb-section pt-section-sm">
                <div className="mx-auto max-w-3xl px-gutter">
                    <div className="prose prose-lg max-w-none text-content-muted prose-headings:font-display prose-headings:tracking-tight prose-headings:text-content prose-a:text-brand-600 dark:prose-invert">
                        <h2>Listing information</h2>
                        <p>
                            Property listings, prices, specifications, and availability shown on this site
                            are indicative. They are accurate as far as we know at the time of publication
                            and remain subject to change until confirmed in writing as part of a sale
                            agreement.
                        </p>

                        <h2>Documentation</h2>
                        <p>
                            Where we describe a title as checked, that means its type and status were
                            confirmed with the relevant land registry before the property was listed. The
                            search results are shared on request. Nothing on this site is a substitute for
                            your own legal advice, and we encourage you to take it.
                        </p>

                        <h2>Enquiries</h2>
                        <p>
                            Submitting an enquiry through this site does not reserve a property, form a
                            contract, or commit either party to a transaction.
                        </p>

                        <h2>Images</h2>
                        <p>
                            Photographs and renders illustrate a development. Where an image is a render
                            rather than a photograph of the completed build, an advisor will tell you when
                            you ask.
                        </p>

                        <h2>Questions</h2>
                        <p>
                            Write to <a href={`mailto:${OFFICE.email}`}>{OFFICE.email}</a> and we will
                            answer {OFFICE.responseTime}.
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}
