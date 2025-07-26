import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ["/dashboard"]
  const publicRoutes = ["/", "/auth"]

  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // Redirect to dashboard if user is authenticated and on public route
  if (session && isPublicRoute && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Redirect to home if user is not authenticated and on protected route
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
