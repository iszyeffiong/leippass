import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Skip for API routes, _next, and other system routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/" ||
    pathname === "/waitlist" ||
    pathname === "/favicon.ico" ||
    pathname === "/" ||
    pathname === "/waitlist" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return NextResponse.next()
  }

  // Extract the username from the path (remove leading slash)
  const username = pathname.substring(1)

  // Redirect to waitlist with ref parameter
  url.pathname = "/waitlist"
  url.searchParams.set("ref", username)

  return NextResponse.redirect(url)
}

// Only run the middleware on specific paths
export const config = {
  matcher: [
    // Skip static files, api routes, etc.
    "/((?!api|_next/static|_next/image|images|favicon.ico).*)",
  ],
}

