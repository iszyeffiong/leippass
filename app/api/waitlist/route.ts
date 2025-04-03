import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    // Ensure we can parse the request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error("Error parsing request body:", e)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { email, username, referredBy, completedTasks } = body

    // Basic validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from("waitlist_users")
        .select("*")
        .eq("email", email)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        console.error("Error checking existing user:", checkError)
        return NextResponse.json({ error: "Failed to check existing user" }, { status: 500 })
      }

      if (existingUser) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 })
      }

      // Generate a unique referral code
      const referralCode = username ? `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${nanoid(6)}` : nanoid(10)

      // Insert new user
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from("waitlist_users")
        .insert([
          {
            email,
            username: username || null,
            referral_code: referralCode,
            referred_by: referredBy || null,
            completed_tasks: completedTasks || [],
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error("Error inserting user:", insertError)
        return NextResponse.json({ error: "Failed to register" }, { status: 500 })
      }

      // If this user was referred by someone, increment their referral count
      if (referredBy) {
        const { data: referrer, error: referrerError } = await supabaseAdmin
          .from("waitlist_users")
          .select("id")
          .eq("referral_code", referredBy)
          .single()

        if (referrer && !referrerError) {
          await supabaseAdmin.rpc("increment_referral_count", { user_id: referrer.id })
        }
      }

      return NextResponse.json({
        success: true,
        message: "Successfully joined waitlist",
        referralCode,
      })
    } catch (err: any) {
      console.error("Database operation error:", err)
      return NextResponse.json({ error: "Failed to save user data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Waitlist registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

