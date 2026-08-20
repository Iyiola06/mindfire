import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * The configuration itself lives in `lib/auth.ts` so that server components,
 * server actions, and other route handlers can read the session from it. This
 * file is only the HTTP surface.
 */
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
