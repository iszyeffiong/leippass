import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, WaitlistUser } from "@/lib/mongodb"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const { email, username, referredBy, completedTasks } = await request.json()

    // Basic validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await WaitlistUser.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Generate a unique referral code
    const referralCode = username ? `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${nanoid(6)}` : nanoid(10)

    // Insert new user
    const newUser = new WaitlistUser({
      email,
      username: username || undefined,
      referralCode,
      referredBy: referredBy || undefined,
      completedTasks: completedTasks || [],
    })

    await newUser.save()

    // If this user was referred by someone, increment their referral count
    if (referredBy) {
      await WaitlistUser.findOneAndUpdate({ referralCode: referredBy }, { $inc: { referralCount: 1 } })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined waitlist",
      referralCode,
    })
  } catch (error) {
    console.error("Waitlist registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

