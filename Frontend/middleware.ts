import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check if the user is authenticated
  const isAuthenticated = !!token

  // Paths that require authentication but don't require role selection
  const authRequiredPaths = ["/dashboard", "/role-selection"]

  // Logged in users trying to access login page should be redirected to dashboard
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Users without role trying to access dashboard should be redirected to role selection
  if (isAuthenticated && pathname.startsWith("/dashboard") && !token.role) {
    return NextResponse.redirect(new URL("/role-selection", request.url))
  }

  // Users with roles trying to access role selection should be redirected to dashboard
  if (isAuthenticated && pathname === "/role-selection" && token.role) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Non-authenticated users trying to access protected pages
  if (!isAuthenticated && authRequiredPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/role-selection"],
}

