import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, WaitlistUser } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const order = searchParams.get("order") || "desc"
    const search = searchParams.get("search") || ""

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build query
    let query = {}

    // Add search if provided
    if (search) {
      query = {
        $or: [{ email: { $regex: search, $options: "i" } }, { username: { $regex: search, $options: "i" } }],
      }
    }

    // Execute query with pagination
    const users = await WaitlistUser.find(query)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const total = await WaitlistUser.countDocuments(query)

    return NextResponse.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error in waitlist users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

