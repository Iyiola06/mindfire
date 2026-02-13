import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(
    supabaseUrl,
    // Use service key on server if available, otherwise use anon key (standard for client)
    typeof window === 'undefined' ? (supabaseServiceKey || supabaseAnonKey) : supabaseAnonKey
)
