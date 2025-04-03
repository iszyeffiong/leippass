import { type NextRequest, NextResponse } from "next/server"
import { getAllWaitlistUsers } from "@/lib/kv"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""

    // Get users with pagination
    const { users, total } = await getAllWaitlistUsers(page, limit, search)

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

