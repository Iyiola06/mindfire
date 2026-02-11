# Migration: Prisma to Supabase

The application data layer has been migrated from Prisma to Supabase Client.

## Changes Made
- **Dependencies**: Removed `prisma` and `@prisma/client`. Installed `@supabase/supabase-js`.
- **Configuration**:
  - Created `lib/supabase.ts` for client initialization.
  - Updated `.env.local` to include `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- **API Routes**: Refactored the following routes to use `supabase` client:
  - `app/api/auth/[...nextauth]/route.ts`: Authentication now verifies users against Supabase `users` table.
  - `app/api/properties/route.ts` & `[id]`: CRUD operations for properties.
  - `app/api/leads/route.ts` & `[id]`: CRUD operations for leads.
  - `app/api/blog/route.ts` & `[id]`: CRUD operations for blog posts.
- **Cleanup**: Deleted `lib/prisma.ts`. Removed `postinstall` script from `package.json`.

## Next Steps
1. **Environment Variables**: You MUST populate `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file.
2. **Database Schema**: Ensure your Supabase database has the following tables matching your previous Prisma schema:
   - `properties`
   - `leads`
   - `blog_posts`
   - `users`
   - (Note: `transactions` was not migrated as no API route was using it in the scanned files, but ensure it exists if needed)
3. **RLS Policies**: Since the API routes use the Service Role Key, they bypass RLS. Ensure you manage access control within your API routes or set up appropriate RLS policies if you switch to client-side usage.
