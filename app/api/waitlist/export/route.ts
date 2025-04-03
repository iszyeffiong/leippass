import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
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

    // Get all users
    const { data, error } = await supabaseAdmin
      .from("waitlist_users")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users for export:", error)
      return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
    }

    // Convert to CSV
    const fields = [
      "id",
      "email",
      "username",
      "referral_code",
      "referred_by",
      "referral_count",
      "completed_tasks",
      "created_at",
    ]
    const csv = parse(data, { fields })

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

