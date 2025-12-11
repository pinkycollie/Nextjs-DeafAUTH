"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase"

export interface AccessibilityProfile {
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
}

export interface DeafAuthProfile {
  user: User | null
  accessibility: AccessibilityProfile | null
  accessibilityConfirmed: boolean
}

export interface AccommodationEvent {
  eventType:
    | "accessibility_profile_submitted"
    | "accommodation_offered"
    | "accommodation_accepted"
    | "accommodation_declined"
    | "accommodation_delivered"
    | "training_module_completed"
    | "accessibility_issue_reported"
  context?: {
    moduleId?: string
    page?: string
    device?: string
  }
  metadata?: Record<string, unknown>
  timestamp?: string
}

interface UseDeafAuthReturn {
  profile: DeafAuthProfile | null
  loading: boolean
  error: string | null
  promptAccessibility: (options?: { context?: string; moduleId?: string }) => Promise<void>
  recordEvent: (eventType: AccommodationEvent["eventType"], metadata?: Record<string, unknown>) => Promise<void>
  updateProfile: (updates: Partial<AccessibilityProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useDeafAuth(): UseDeafAuthReturn {
  const [profile, setProfile] = useState<DeafAuthProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(userError.message)
      }

      if (!user) {
        setProfile(null)
        return
      }

      // Fetch accessibility profile from database
      const { data: accessibilityData } = await supabase
        .from("accessibility_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      // Map database profile to AccessibilityProfile interface
      const accessibility: AccessibilityProfile | null = accessibilityData
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
        : null

      setProfile({
        user,
        accessibility,
        accessibilityConfirmed: accessibility?.accessibilityConfirmed ?? false,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch profile"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const promptAccessibility = useCallback(
    async (options?: { context?: string; moduleId?: string }) => {
      // This would typically show a modal or redirect to a profile setup page
      // For now, we just log and could dispatch a custom event
      console.log("Prompting accessibility preferences", options)

      // Dispatch custom event for UI to listen to
      window.dispatchEvent(
        new CustomEvent("deafauth:prompt-accessibility", {
          detail: options,
        }),
      )
    },
    [],
  )

  const recordEvent = useCallback(
    async (eventType: AccommodationEvent["eventType"], metadata?: Record<string, unknown>) => {
      if (!profile?.user) {
        console.warn("Cannot record event: No authenticated user")
        return
      }

      const event: AccommodationEvent = {
        eventType,
        context: {
          page: typeof window !== "undefined" ? window.location.pathname : undefined,
          device: typeof navigator !== "undefined" ? (navigator.userAgent.includes("Mobile") ? "mobile" : "desktop") : undefined,
        },
        metadata,
        timestamp: new Date().toISOString(),
      }

      console.log("Recording accommodation event:", event)

      // In a real implementation, this would send to an analytics endpoint
      // or store in the database
      window.dispatchEvent(
        new CustomEvent("deafauth:event", {
          detail: event,
        }),
      )
    },
    [profile],
  )

  const updateProfile = useCallback(
    async (updates: Partial<AccessibilityProfile>) => {
      if (!profile?.user) {
        throw new Error("No authenticated user")
      }

      try {
        const { error: updateError } = await supabase.from("accessibility_profiles").upsert({
          user_id: profile.user.id,
          font_size: updates.captions?.size || "medium",
          updated_at: new Date().toISOString(),
        })

        if (updateError) {
          throw new Error(updateError.message)
        }

        // Refresh the profile
        await fetchProfile()

        // Record the update event
        await recordEvent("accessibility_profile_submitted", { updates })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update profile"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [profile, supabase, fetchProfile, recordEvent],
  )

  const refreshProfile = useCallback(async () => {
    await fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    promptAccessibility,
    recordEvent,
    updateProfile,
    refreshProfile,
  }
}
