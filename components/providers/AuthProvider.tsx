'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

/**
 * Makes the NextAuth session available to admin client components.
 *
 * Without it `useSession()` returns `{ data: null, status: 'unauthenticated' }`
 * forever, which is why the sidebar shipped with a hardcoded "Admin User" and
 * a stock avatar instead of the person who actually signed in.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>
}
