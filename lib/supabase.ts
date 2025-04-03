import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with the anonymous key for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type WaitlistUser = {
  id: string
  email: string
  username: string | null
  referral_code: string
  referred_by: string | null
  referral_count: number
  completed_tasks: string[]
  created_at: string
}

