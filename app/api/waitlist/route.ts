import { type NextRequest, NextResponse } from "next/server"
import { createWaitlistUser } from "@/lib/kv"

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
      // Create new user
      const user = await createWaitlistUser({
        email,
        username: username || undefined,
        referredBy,
        completedTasks,
      })

      return NextResponse.json({
        success: true,
        message: "Successfully joined waitlist",
        referralCode: user.referralCode,
      })
    } catch (err: any) {
      console.error("Error creating user:", err)
      return NextResponse.json({ error: err.message || "Failed to join waitlist" }, { status: 400 })
    }
  } catch (error) {
    console.error("Waitlist registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

