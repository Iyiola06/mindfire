import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Route protection, first layer.
 *
 * The previous version matched `/api/properties`, `/api/leads/:path*`, and
 * `/api/blog` but then tested each path against the list
 * `['/admin', '/api/properties/create', '/api/blog/create']` — routes that do
 * not exist. Nothing under `/api` ever satisfied that test, so every write
 * endpoint ran unauthenticated, and `/api/upload` (which holds the Supabase
 * service-role key and bypasses RLS) was never matched at all.
 *
 * Two changes: the matcher now covers every admin surface, and the decision is
 * "everything matched here needs a session" rather than a second, divergent
 * allowlist. Public reads that live under a protected prefix are named
 * explicitly in PUBLIC_READS.
 *
 * This is a redirect/short-circuit layer, not the authorisation boundary — the
 * route handlers and server actions call `requireAdmin()` themselves. Edge
 * middleware alone cannot protect server actions, and a matcher is one forgotten
 * entry away from a hole.
 */

/** Method + path pairs that stay open even though their prefix is protected. */
const PUBLIC_READS: { method: string; pattern: RegExp }[] = [
    { method: 'GET', pattern: /^\/api\/properties(\/[^/]+)?$/ },
    { method: 'GET', pattern: /^\/api\/blog(\/[^/]+)?$/ },
    // Public forms create leads; only reading and mutating them is restricted.
    { method: 'POST', pattern: /^\/api\/leads$/ },
]

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    if (path.startsWith('/admin/login')) return NextResponse.next()

    const isPublicRead = PUBLIC_READS.some(
        ({ method, pattern }) => request.method === method && pattern.test(path),
    )
    if (isPublicRead) return NextResponse.next()

    const token = await getToken({ req: request })
    if (token) return NextResponse.next()

    if (path.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL('/admin/login', request.url)
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/properties/:path*',
        '/api/leads/:path*',
        '/api/blog/:path*',
        '/api/upload/:path*',
    ],
}
