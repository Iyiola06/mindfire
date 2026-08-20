import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from '@/components/admin/LoginForm'

export const metadata: Metadata = {
    title: 'Sign in | Mindfire Homes Admin',
    // Belt and braces alongside the robots.txt disallow: a sign-in screen
    // should never appear in an index, and a stray inbound link is enough to
    // get one crawled.
    robots: { index: false, follow: false },
}

export default function AdminLogin() {
    return (
        <div className="hero-wash relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
            <div
                aria-hidden="true"
                className="ambient-glow pointer-events-none absolute -top-1/3 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full"
            />

            <div className="relative w-full max-w-md">
                <div className="mb-8 text-center">
                    <img src="/logo.svg" alt="" width={48} height={48} className="mx-auto h-12 w-12 rounded-xl object-contain" />
                    <h1 className="mt-6 font-display text-display-sm font-bold tracking-tight text-content">
                        Mindfire Admin
                    </h1>
                    <p className="mt-2 text-body-sm text-content-muted">
                        Sign in to manage listings, leads, and the journal.
                    </p>
                </div>

                <div className="rounded-panel border border-hairline/10 bg-surface p-8 shadow-ambient">
                    <Suspense
                        fallback={<p className="py-6 text-center text-body-sm text-content-muted">Loading…</p>}
                    >
                        <LoginForm />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
