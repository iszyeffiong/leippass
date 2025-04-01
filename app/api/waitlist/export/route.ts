import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, WaitlistUser } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { parse } from "json2csv"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get all users
    const users = await WaitlistUser.find({}).sort({ createdAt: -1 }).lean()

    // Convert MongoDB _id to string and format dates
    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      username: user.username || "",
      referralCode: user.referralCode,
      referredBy: user.referredBy || "",
      referralCount: user.referralCount,
      completedTasks: user.completedTasks.join(", "),
      createdAt: new Date(user.createdAt).toISOString(),
    }))

    // Convert to CSV
    const fields = [
      "id",
      "email",
      "username",
      "referralCode",
      "referredBy",
      "referralCount",
      "completedTasks",
      "createdAt",
    ]
    const csv = parse(formattedUsers, { fields })

    // Return as downloadable CSV
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leippass-waitlist-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error in waitlist export API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

