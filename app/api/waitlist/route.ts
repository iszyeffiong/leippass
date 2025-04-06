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
    console.log("Received submission:", { email, username, referredBy, completedTasksCount: completedTasks?.length })

    // Basic validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if Supabase is properly initialized
    if (!supabaseAdmin) {
      console.error("Supabase admin client is not initialized")
      return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    }

    // Check if user already exists
    console.log("Checking if user exists...")
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
      console.log("User already exists:", existingUser.email)
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Generate a referral code - just use the username if provided, otherwise generate a random one
    const referralCode = username ? username.toLowerCase().replace(/[^a-z0-9]/g, "") : nanoid(10)

    console.log("Generated referral code:", referralCode)

    // Check if referral code already exists
    const { data: existingCode, error: codeError } = await supabaseAdmin
      .from("waitlist_users")
      .select("id")
      .eq("referral_code", referralCode)
      .single()

    if (existingCode) {
      console.log("Referral code already exists, generating a unique one")
      // If username is already taken as a referral code, append a random string
      const uniqueReferralCode = `${referralCode}-${nanoid(4)}`
      return createUser(email, username, referredBy, completedTasks, uniqueReferralCode)
    }

    return createUser(email, username, referredBy, completedTasks, referralCode)
  } catch (error) {
    console.error("Waitlist registration error:", error)
    // Return a more detailed error message for debugging
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }

  // Helper function to create a user
  async function createUser(
    email: string,
    username: string | null,
    referredBy: string | null,
    completedTasks: string[] | null,
    referralCode: string,
  ) {
    // Format completed tasks as an array if it's not already
    const formattedTasks = Array.isArray(completedTasks) ? completedTasks : []

    // Insert new user
    console.log("Inserting new user...")
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("waitlist_users")
      .insert([
        {
          email,
          username: username || null,
          referral_code: referralCode,
          referred_by: referredBy || null,
          completed_tasks: formattedTasks,
        },
      ])
      .select()

    if (insertError) {
      console.error("Error inserting user:", insertError)
      return NextResponse.json(
        {
          error: `Failed to register: ${insertError.message || insertError.code || "Unknown error"}`,
        },
        { status: 500 },
      )
    }

    console.log("User inserted successfully:", newUser?.[0]?.id)

    // If this user was referred by someone, increment their referral count
    if (referredBy) {
      console.log("Processing referral for:", referredBy)
      const { data: referrer, error: referrerError } = await supabaseAdmin
        .from("waitlist_users")
        .select("id")
        .eq("referral_code", referredBy)
        .single()

      if (referrerError) {
        console.error("Error finding referrer:", referrerError)
      }

      if (referrer && !referrerError) {
        console.log("Incrementing referral count for referrer:", referrer.id)
        const { error: incrementError } = await supabaseAdmin.rpc("increment_referral_count", { user_id: referrer.id })

        if (incrementError) {
          console.error("Error incrementing referral count:", incrementError)
        }
      }
    }

    console.log("Waitlist submission completed successfully")
    return NextResponse.json({
      success: true,
      message: "Successfully joined waitlist",
      referralCode,
    })
  }
}