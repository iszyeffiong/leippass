import { createClient } from "@supabase/supabase-js"

// These would come from environment variables in production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "your-supabase-url"
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "your-supabase-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

