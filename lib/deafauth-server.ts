import { createServerClient } from "@/lib/supabase-server"
import type { Database } from "@/lib/supabase"

export interface DeafAuthProfile {
  user: {
    id: string
    email: string
    name?: string
    createdAt: string
  }
  accessibility: {
    userId: string
    preferredLanguage: string
    primarySupport: "sign-language" | "captions" | "text-only" | "none"
    captions: {
      enabled: boolean
      language: string
      size?: "small" | "medium" | "large"
    }
    interpreterNeeded: boolean
    pacePreference: "normal" | "slow" | "manual"
    deviceTypes: ("vr-headset" | "desktop" | "mobile")[]
    accessibilityConfirmed: boolean
    lastUpdatedAt: string
  } | null
}

/**
 * Get the current user's DeafAuth profile from the server
 *
 * @example
 * ```tsx
 * // app/dashboard/page.tsx
 * import { getDeafAuthProfile } from '@/lib/deafauth-server'
 *
 * export default async function DashboardPage() {
 *   const profile = await getDeafAuthProfile()
 *   return <Dashboard user={profile.user} accessibility={profile.accessibility} />
 * }
 * ```
 */
export async function getDeafAuthProfile(): Promise<DeafAuthProfile | null> {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    // Fetch accessibility profile
    const { data: accessibilityData } = await supabase
      .from("accessibility_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    return {
      user: {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name,
        createdAt: user.created_at,
      },
      accessibility: accessibilityData
        ? {
            userId: user.id,
            preferredLanguage: "en",
            primarySupport: "captions",
            captions: {
              enabled: true,
              language: "en",
              size: accessibilityData.font_size || "medium",
            },
            interpreterNeeded: false,
            pacePreference: "normal",
            deviceTypes: ["desktop"],
            accessibilityConfirmed: true,
            lastUpdatedAt: accessibilityData.updated_at,
          }
        : null,
    }
  } catch (error) {
    console.error("Error fetching DeafAuth profile:", error)
    return null
  }
}

/**
 * Check if the current user has confirmed their accessibility preferences
 */
export async function hasConfirmedAccessibility(): Promise<boolean> {
  const profile = await getDeafAuthProfile()
  return profile?.accessibility?.accessibilityConfirmed ?? false
}

/**
 * Record an accommodation event (server-side)
 */
export async function recordAccommodationEvent(
  eventType: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const profile = await getDeafAuthProfile()

  if (!profile?.user) {
    console.warn("Cannot record event: No authenticated user")
    return
  }

  // Log the event (in production, this would go to an analytics service)
  console.log("Accommodation event recorded:", {
    eventType,
    userId: profile.user.id,
    timestamp: new Date().toISOString(),
    metadata,
  })
}
