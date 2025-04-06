import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Log environment variables (without revealing full values)
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
    }

    console.log("Environment variables status:", envStatus)

    // Check if Supabase admin is initialized
    if (!supabaseAdmin) {
      console.error("Supabase admin client is not initialized")
      return NextResponse.json(
        {
          error: "Supabase admin not initialized",
          envStatus,
        },
        { status: 500 },
      )
    }

    // Try a simple query
    const { data, error } = await supabaseAdmin.from("waitlist_users").select("count").limit(1)

    if (error) {
      console.error("Supabase query error:", error)
      return NextResponse.json(
        {
          error: error.message,
          details: error,
          envStatus,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      data,
      envStatus,
    })
  } catch (error) {
    console.error("Test endpoint error:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

