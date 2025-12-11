/**
 * DeafAUTH - Accessible Authentication for Next.js
 *
 * This module provides authentication and accessibility features
 * specifically designed for Deaf and hard-of-hearing users.
 *
 * @packageDocumentation
 */

// Re-export middleware utilities
export { withDeafAuth } from "./deafauth-middleware"
export type { DeafAuthMiddlewareOptions } from "./deafauth-middleware"

// Re-export server utilities
export {
  getDeafAuthProfile,
  hasConfirmedAccessibility,
  recordAccommodationEvent,
} from "./deafauth-server"
export type { DeafAuthProfile } from "./deafauth-server"

// Re-export client utilities
export { signUp, signIn, signOut, resetPassword, getCurrentUser, getSupabaseClient } from "./auth"

// Re-export Supabase utilities
export { createClient } from "./supabase"
export type { Database } from "./supabase"

// Re-export utility functions
export { cn } from "./utils"
