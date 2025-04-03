import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
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
    const sortBy = searchParams.get("sortBy") || "created_at"
    const order = searchParams.get("order") || "desc"
    const search = searchParams.get("search") || ""

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query
    let query = supabaseAdmin
      .from("waitlist_users")
      .select("*", { count: "exact" })
      .order(sortBy, { ascending: order === "asc" })
      .range(from, to)

    // Add search if provided
    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%`)
    }

    const { data, count, error } = await query

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json({
      users: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Error in waitlist users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

