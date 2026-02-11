import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Define paths that require authentication
    const protectedPaths = ['/admin', '/api/properties/create', '/api/blog/create']
    const isProtected = protectedPaths.some(prefix => path.startsWith(prefix) && !path.startsWith('/admin/login'))

    if (isProtected) {
        const token = await getToken({ req: request })

        if (!token) {
            if (path.startsWith('/api')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            const url = new URL('/admin/login', request.url)
            url.searchParams.set('callbackUrl', path)
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/properties',
        '/api/leads/:path*',
        '/api/blog',
    ],
}
