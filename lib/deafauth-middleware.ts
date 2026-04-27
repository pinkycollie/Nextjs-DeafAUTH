import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export interface DeafAuthMiddlewareOptions {
  /** Prompt user on first visit if no accessibility profile exists */
  promptOnFirstVisit?: boolean
  /** Routes to skip middleware processing */
  skip?: string[]
  /** Routes that require authentication */
  protectedRoutes?: string[]
  /** Routes that are always public */
  publicRoutes?: string[]
  /** Custom redirect URL for unauthenticated users */
  loginRedirect?: string
  /** Custom redirect URL after login */
  dashboardRedirect?: string
}

const defaultOptions: DeafAuthMiddlewareOptions = {
  promptOnFirstVisit: true,
  skip: ["/api", "/_next", "/favicon.ico", "/public", "/health"],
  protectedRoutes: ["/dashboard"],
  publicRoutes: ["/", "/auth"],
  loginRedirect: "/",
  dashboardRedirect: "/dashboard",
}

/**
 * DeafAuth Middleware wrapper
 *
 * Hydrates identity and accessibility profile, handles route protection,
 * and optionally redirects to prompt flows for first-time users.
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { withDeafAuth } from '@/lib/deafauth-middleware'
 *
 * export default withDeafAuth({
 *   promptOnFirstVisit: true,
 *   skip: ['/public', '/health'],
 * })
 * ```
 */
export function withDeafAuth(options: DeafAuthMiddlewareOptions = {}) {
  const config = { ...defaultOptions, ...options }

  return async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const pathname = req.nextUrl.pathname

    // Skip middleware for configured routes
    if (config.skip?.some((route) => pathname.startsWith(route))) {
      return res
    }

    // Create Supabase middleware client
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const isProtectedRoute = config.protectedRoutes?.some((route) => pathname.startsWith(route))
    const isPublicRoute = config.publicRoutes?.includes(pathname)

    // Redirect authenticated users from public routes to dashboard
    if (session && isPublicRoute && pathname === "/") {
      return NextResponse.redirect(new URL(config.dashboardRedirect!, req.url))
    }

    // Redirect unauthenticated users from protected routes to login
    if (!session && isProtectedRoute) {
      return NextResponse.redirect(new URL(config.loginRedirect!, req.url))
    }

    // Set user info in headers for server components
    if (session?.user) {
      res.headers.set("x-deafauth-user-id", session.user.id)
      res.headers.set("x-deafauth-user-email", session.user.email || "")
    }

    return res
  }
}

// Re-export for convenient default usage
export { withDeafAuth as default }
