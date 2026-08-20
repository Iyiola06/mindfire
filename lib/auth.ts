import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { supabase } from '@/lib/supabase'

/**
 * The NextAuth configuration, defined here rather than inside the route
 * handler so that server components, server actions, and route handlers can
 * all call `getServerSession(authOptions)`.
 *
 * While it lived inside `app/api/auth/[...nextauth]/route.ts` there was no way
 * to read the session anywhere else, which is why every mutating endpoint and
 * every server action in this codebase shipped without an authorisation check.
 */
export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt' },
    pages: { signIn: '/admin/login' },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) return null

                    const { data: user, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', credentials.email.toLowerCase().trim())
                        .single()

                    if (error) {
                        console.error('NextAuth Supabase Error:', error)
                        return null
                    }
                    if (!user) return null

                    const isPasswordValid = await compare(credentials.password, user.passwordHash)
                    if (!isPasswordValid) return null

                    // Best-effort: a failed timestamp write must not block a
                    // valid sign-in, so the result is deliberately unchecked.
                    await supabase
                        .from('users')
                        .update({ lastLogin: new Date().toISOString() })
                        .eq('id', user.id)

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    }
                } catch (err) {
                    console.error('NextAuth Internal Error:', err)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    role: token.role as string,
                },
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string
                token.role = (user as { role?: string }).role
            }
            return token
        },
    },
}

export interface AdminSessionUser {
    id: string
    name?: string | null
    email?: string | null
    role?: string | null
}

/**
 * Returns the signed-in admin, or null.
 *
 * Every write path calls this. Middleware alone is not sufficient: its matcher
 * has to enumerate paths, it silently stopped covering `/api/properties/[id]`
 * and `/api/blog/[id]` when those routes were added, and it does not run for
 * server actions at all — which is how `sendBulkEmail` came to be callable by
 * anyone who could POST to the site.
 */
export async function getAdmin(): Promise<AdminSessionUser | null> {
    const session = await getServerSession(authOptions)
    const user = session?.user as AdminSessionUser | undefined
    return user?.id ? user : null
}

/** Thrown by `requireAdmin`. Caught by `withAdmin` and turned into a 401. */
export class UnauthorizedError extends Error {
    constructor() {
        super('Unauthorized')
        this.name = 'UnauthorizedError'
    }
}

export async function requireAdmin(): Promise<AdminSessionUser> {
    const admin = await getAdmin()
    if (!admin) throw new UnauthorizedError()
    return admin
}
