import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "@/lib/supabase"
import { compare } from "bcryptjs"

const handler = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/admin/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null
                    }

                    const { data: user, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', credentials.email)
                        .single()

                    if (error) {
                        console.error('NextAuth Supabase Error:', error)
                        return null
                    }

                    if (!user) {
                        console.warn('NextAuth Login Failed: User not found', credentials.email)
                        return null
                    }

                    const isPasswordValid = await compare(credentials.password, user.passwordHash)

                    if (!isPasswordValid) {
                        console.warn('NextAuth Login Failed: Invalid password', credentials.email)
                        return null
                    }

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
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    role: token.role as string,
                }
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string
                token.role = (user as any).role
            }
            return token
        }
    }
})

export { handler as GET, handler as POST }
