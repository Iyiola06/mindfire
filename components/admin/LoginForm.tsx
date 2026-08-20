"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const FIELD =
    'h-12 w-full rounded-control border border-hairline/15 bg-surface-2 px-4 text-body-sm text-content outline-none transition-colors duration-short ease-standard placeholder:text-content-muted/70 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 disabled:opacity-60'

const LABEL = 'mb-2 block text-label font-semibold uppercase text-content-muted'

/**
 * `callbackUrl` arrives from the query string, so it is attacker-controlled.
 * Passing it straight to `router.push` turns the sign-in screen into an open
 * redirect: `/admin/login?callbackUrl=https://evil.example` would bounce a
 * freshly-authenticated admin off-site. Only same-origin admin paths are
 * honoured; anything else falls back to the dashboard.
 */
const safeCallback = (raw: string | null | undefined) =>
    raw && raw.startsWith('/admin') && !raw.startsWith('//') ? raw : '/admin'

export default function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = safeCallback(searchParams?.get('callbackUrl'))

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            })

            if (result?.error) {
                setError('That email and password did not match an account.')
                setLoading(false)
                return
            }

            router.push(callbackUrl)
            // Server components on the destination read the session during
            // render. Without the refresh they can render from a cache entry
            // produced while signed out.
            router.refresh()
        } catch {
            setError('Something went wrong signing you in. Please try again.')
            setLoading(false)
        }
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email-address" className={LABEL}>
                    Email address
                </label>
                <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className={FIELD}
                    placeholder="you@mindfirehomes.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="password" className={LABEL}>
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className={FIELD}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* role="alert" so the failure is announced. The previous version
                rendered a bare div, which a screen reader never reported. */}
            <p role="alert" className="min-h-[1.25rem] text-body-sm text-red-600 dark:text-red-400">
                {error}
            </p>

            <Button type="submit" size="lg" fullWidth disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
            </Button>
        </form>
    )
}
