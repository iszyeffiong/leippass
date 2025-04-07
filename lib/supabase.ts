import { createClient } from "@supabase/supabase-js"

// Get environment variables directly from process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Create clients with better error handling
let supabase = null
let supabaseAdmin = null

// Only create in a try-catch to prevent runtime errors
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error)
}

try {
  if (supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
} catch (error) {
  console.error("Failed to initialize Supabase admin client:", error)
}

export { supabase, supabaseAdmin }

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

