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
    console.log("Received submission:", {
      email,
      username,
      referredBy,
      completedTasksCount: completedTasks?.length,
    })

    // Basic validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if Supabase is properly initialized
    if (!supabaseAdmin) {
      console.error("Supabase admin client is not initialized")

      // Log environment variables (without revealing full values)
      const envStatus = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
      }

      console.error("Environment variable check:", envStatus)

      return NextResponse.json(
        {
          error: "Database connection error",
          details: "Supabase admin client is not initialized. Please check your environment variables.",
          envStatus,
        },
        { status: 500 },
      )
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

    if (codeError && codeError.code !== "PGRST116") {
      console.error("Error checking existing referral code:", codeError)
    }

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
    console.log("Inserting new user with data:", {
      email,
      username,
      referral_code: referralCode,
      referred_by: referredBy,
      completed_tasks: formattedTasks,
    })

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

      // First, try to find the referrer by their referral code
      const { data: referrer, error: referrerError } = await supabaseAdmin
        .from("waitlist_users")
        .select("id, referral_count")
        .eq("referral_code", referredBy)
        .single()

      if (referrerError) {
        console.error("Error finding referrer by referral_code:", referrerError)

        // If we can't find by referral_code, try by username (for backward compatibility)
        console.log("Trying to find referrer by username:", referredBy)
        const { data: referrerByUsername, error: usernameError } = await supabaseAdmin
          .from("waitlist_users")
          .select("id, referral_count")
          .eq("username", referredBy)
          .single()

        if (usernameError) {
          console.error("Error finding referrer by username:", usernameError)
        } else if (referrerByUsername) {
          // Found by username, update referral count
          console.log("Found referrer by username:", referrerByUsername.id)
          await updateReferralCount(referrerByUsername.id, referrerByUsername.referral_count)
        }
      } else if (referrer) {
        // Found by referral_code, update referral count
        console.log("Found referrer by referral_code:", referrer.id)
        await updateReferralCount(referrer.id, referrer.referral_count)
      }
    }

    console.log("Waitlist submission completed successfully")
    return NextResponse.json({
      success: true,
      message: "Successfully joined waitlist",
      referralCode,
    })
  }

  // Helper function to update referral count
  async function updateReferralCount(referrerId: string, currentCount: number) {
    console.log(`Updating referral count for user ${referrerId} from ${currentCount} to ${currentCount + 1}`)

    // Direct update using the update method instead of RPC
    const { error: updateError } = await supabaseAdmin
      .from("waitlist_users")
      .update({ referral_count: currentCount + 1 })
      .eq("id", referrerId)

    if (updateError) {
      console.error("Error updating referral count:", updateError)
    } else {
      console.log("Referral count updated successfully")
    }
  }
}

