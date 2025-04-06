import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Log initialization attempt
console.log("Initializing Supabase clients with:", {
  url: supabaseUrl ? "URL is set" : "URL is missing",
  anonKey: supabaseAnonKey ? "Anon key is set" : "Anon key is missing",
  serviceKey: supabaseServiceKey ? "Service key is set" : "Service key is missing",
})

// Create clients with better error handling
let supabase = null
let supabaseAdmin = null

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log("Supabase client initialized successfully")
  } else {
    console.error("Cannot initialize Supabase client: missing URL or anon key")
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
    console.log("Supabase admin client initialized successfully")
  } else {
    console.error("Cannot initialize Supabase admin client: missing URL or service key")
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

