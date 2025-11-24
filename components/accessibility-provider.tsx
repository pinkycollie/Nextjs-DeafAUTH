"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface AccessibilityContextType {
  highContrast: boolean
  hapticFeedback: boolean
  audioFeedback: boolean
  fontSize: "small" | "medium" | "large"
  toggleHighContrast: () => void
  toggleHapticFeedback: () => void
  toggleAudioFeedback: () => void
  setFontSize: (size: "small" | "medium" | "large") => void
  triggerHaptic: (type: "success" | "error" | "warning") => void
  announceToScreenReader: (message: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false)
  const [hapticFeedback, setHapticFeedback] = useState(true)
  const [audioFeedback, setAudioFeedback] = useState(true)
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium")

  useEffect(() => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem("deafauth-accessibility")
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs)
      setHighContrast(prefs.highContrast || false)
      // Deaf-first: Haptic is supplementary, not primary
      setHapticFeedback(prefs.hapticFeedback !== false)
      // Deaf-first: Audio is supplementary, not primary
      setAudioFeedback(prefs.audioFeedback !== false)
      setFontSize(prefs.fontSize || "medium")

      // Apply saved preferences on load
      if (prefs.highContrast) {
        document.documentElement.classList.add("high-contrast")
      }
      document.documentElement.classList.add(`font-${prefs.fontSize || "medium"}`)
    }
  }, [])

  const savePreferences = (prefs: any) => {
    localStorage.setItem("deafauth-accessibility", JSON.stringify(prefs))
  }

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    savePreferences({ highContrast: newValue, hapticFeedback, audioFeedback, fontSize })

    // Apply high contrast styles
    if (newValue) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
  }

  const toggleHapticFeedback = () => {
    const newValue = !hapticFeedback
    setHapticFeedback(newValue)
    savePreferences({ highContrast, hapticFeedback: newValue, audioFeedback, fontSize })
  }

  const toggleAudioFeedback = () => {
    const newValue = !audioFeedback
    setAudioFeedback(newValue)
    savePreferences({ highContrast, hapticFeedback, audioFeedback: newValue, fontSize })
  }

  const updateFontSize = (size: "small" | "medium" | "large") => {
    setFontSize(size)
    savePreferences({ highContrast, hapticFeedback, audioFeedback, fontSize: size })

    // Apply font size classes
    document.documentElement.classList.remove("font-small", "font-medium", "font-large")
    document.documentElement.classList.add(`font-${size}`)
  }

  const triggerHaptic = (type: "success" | "error" | "warning") => {
    if (!hapticFeedback || !navigator.vibrate) return

    const patterns = {
      success: [100, 50, 100],
      error: [200, 100, 200, 100, 200],
      warning: [150],
    }

    navigator.vibrate(patterns[type])
  }

  const announceToScreenReader = (message: string) => {
    // Timeout durations
    const ANNOUNCEMENT_DURATION = 3000 // 3 seconds for visual indicators

    // Deaf-first: Create a visual announcement region as well
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Also create a brief visual indicator
    const visualIndicator = document.createElement("div")
    visualIndicator.setAttribute("role", "status")
    visualIndicator.className =
      "fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium"
    visualIndicator.textContent = message
    document.body.appendChild(visualIndicator)

    setTimeout(() => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement)
      }
      if (visualIndicator.parentNode) {
        document.body.removeChild(visualIndicator)
      }
    }, ANNOUNCEMENT_DURATION)
  }

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        hapticFeedback,
        audioFeedback,
        fontSize,
        toggleHighContrast,
        toggleHapticFeedback,
        toggleAudioFeedback,
        setFontSize: updateFontSize,
        triggerHaptic,
        announceToScreenReader,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}
