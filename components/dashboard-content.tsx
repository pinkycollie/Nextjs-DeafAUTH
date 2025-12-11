"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Settings, LogOut, Palette, Volume2, Vibrate, Type, Loader2 } from "lucide-react"
import { useAccessibility } from "@/components/accessibility-provider"
import { signOut } from "@/lib/auth"
import { createClient } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase"

interface DashboardContentProps {
  user: SupabaseUser
  accessibilityProfile?: Database["public"]["Tables"]["accessibility_profiles"]["Row"] | null
}

export function DashboardContent({ user, accessibilityProfile }: DashboardContentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const {
    highContrast,
    hapticFeedback,
    audioFeedback,
    fontSize,
    toggleHighContrast,
    toggleHapticFeedback,
    toggleAudioFeedback,
    setFontSize,
    triggerHaptic,
    announceToScreenReader,
  } = useAccessibility()

  const supabase = createClient()

  // Sync local preferences with database on load
  useEffect(() => {
    if (accessibilityProfile) {
      // Update local state to match database
      if (accessibilityProfile.high_contrast !== highContrast) {
        toggleHighContrast()
      }
      if (accessibilityProfile.haptic_feedback !== hapticFeedback) {
        toggleHapticFeedback()
      }
      if (accessibilityProfile.audio_feedback !== audioFeedback) {
        toggleAudioFeedback()
      }
      if (accessibilityProfile.font_size !== fontSize) {
        setFontSize(accessibilityProfile.font_size)
      }
    }
  }, [accessibilityProfile])

  const savePreferencesToDatabase = async (
    preferences: Partial<Database["public"]["Tables"]["accessibility_profiles"]["Update"]>,
  ) => {
    setIsSaving(true)
    try {
      const { error } = await supabase.from("accessibility_profiles").upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error saving preferences:", error)
        announceToScreenReader("Error saving preferences")
        triggerHaptic("error")
      } else {
        announceToScreenReader("Preferences saved successfully")
        triggerHaptic("success")
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      announceToScreenReader("Error saving preferences")
      triggerHaptic("error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleHighContrastToggle = () => {
    toggleHighContrast()
    savePreferencesToDatabase({ high_contrast: !highContrast })
  }

  const handleHapticToggle = () => {
    toggleHapticFeedback()
    savePreferencesToDatabase({ haptic_feedback: !hapticFeedback })
  }

  const handleAudioToggle = () => {
    toggleAudioFeedback()
    savePreferencesToDatabase({ audio_feedback: !audioFeedback })
  }

  const handleFontSizeChange = (size: "small" | "medium" | "large") => {
    setFontSize(size)
    savePreferencesToDatabase({ font_size: size })
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    announceToScreenReader("Signing out...")
    const result = await signOut()

    if (result.error) {
      triggerHaptic("error")
      announceToScreenReader(`Error signing out: ${result.error}`)
    } else {
      triggerHaptic("success")
      announceToScreenReader("Successfully signed out")
      window.location.href = "/"
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Visual loading overlay for deaf-first accessibility */}
      {isLoading && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="status"
          aria-live="polite"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl border-4 border-blue-500 flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">Processing...</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">{user.user_metadata?.name || user.email}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2 bg-transparent font-bold"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Signing Out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Sign Out
              </>
            )}
          </Button>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
                <p className="text-lg font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">{user.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</Label>
                <div className="mt-1">
                  <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                    {user.email_confirmed_at ? "Verified" : "Pending Verification"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" aria-hidden="true" />
              Accessibility Preferences
              {isSaving && (
                <Badge variant="secondary" className="ml-2 animate-pulse">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-base">
              Customize your experience for optimal accessibility. Visual feedback is our primary communication method.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* High Contrast Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-gray-600" />
                <div>
                  <Label htmlFor="high-contrast" className="text-base font-medium">
                    High Contrast Mode
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enhance visual contrast for better readability
                  </p>
                </div>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={handleHighContrastToggle}
                disabled={isSaving}
              />
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibrate className="w-5 h-5 text-gray-600" aria-hidden="true" />
                <div>
                  <Label htmlFor="haptic-feedback" className="text-base font-medium">
                    Haptic Feedback (Supplementary)
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Optional: Feel vibrations as additional feedback to visual cues
                  </p>
                </div>
              </div>
              <Switch
                id="haptic-feedback"
                checked={hapticFeedback}
                onCheckedChange={handleHapticToggle}
                disabled={isSaving}
                aria-label="Toggle haptic feedback"
              />
            </div>

            {/* Audio Feedback */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-600" aria-hidden="true" />
                <div>
                  <Label htmlFor="audio-feedback" className="text-base font-medium">
                    Audio Feedback (Supplementary)
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Optional: Enable sound as additional feedback to visual cues
                  </p>
                </div>
              </div>
              <Switch
                id="audio-feedback"
                checked={audioFeedback}
                onCheckedChange={handleAudioToggle}
                disabled={isSaving}
                aria-label="Toggle audio feedback"
              />
            </div>

            {/* Font Size */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-gray-600" />
                <div>
                  <Label htmlFor="font-size" className="text-base font-medium">
                    Font Size
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Adjust text size for comfortable reading</p>
                </div>
              </div>
              <Select value={fontSize} onValueChange={handleFontSizeChange} disabled={isSaving}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* API Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>API Access</CardTitle>
            <CardDescription>Integration details for DeafAuth service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-mono">
                User ID: <span className="text-blue-600 dark:text-blue-400">{user.id}</span>
              </p>
              <p className="text-sm font-mono mt-1">
                Created:{" "}
                <span className="text-green-600 dark:text-green-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </p>
              {accessibilityProfile && (
                <p className="text-sm font-mono mt-1">
                  Preferences Updated:{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    {new Date(accessibilityProfile.updated_at).toLocaleDateString()}
                  </span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
