/**
 * DeafAUTH Default Configuration Constants
 *
 * Centralized default values for accessibility profiles and settings.
 * These values are used when creating new profiles or when specific
 * preferences haven't been set by the user.
 */

export const DEFAULT_ACCESSIBILITY_CONFIG = {
  // Language settings
  preferredLanguage: "en",

  // Primary support type
  primarySupport: "captions" as const,

  // Caption settings
  captions: {
    enabled: true,
    language: "en",
    size: "medium" as const,
  },

  // Interpreter settings
  interpreterNeeded: false,

  // Pace settings
  pacePreference: "normal" as const,

  // Device settings
  deviceTypes: ["desktop"] as const,

  // Confirmation status
  accessibilityConfirmed: true,
} as const

/**
 * Primary support types available in DeafAUTH
 */
export const PRIMARY_SUPPORT_OPTIONS = [
  "sign-language",
  "captions",
  "text-only",
  "none",
] as const

/**
 * Pace preference options
 */
export const PACE_PREFERENCE_OPTIONS = ["normal", "slow", "manual"] as const

/**
 * Font size options
 */
export const FONT_SIZE_OPTIONS = ["small", "medium", "large"] as const

/**
 * Device type options
 */
export const DEVICE_TYPE_OPTIONS = ["vr-headset", "desktop", "mobile"] as const

/**
 * Type definitions derived from constants
 */
export type PrimarySupport = (typeof PRIMARY_SUPPORT_OPTIONS)[number]
export type PacePreference = (typeof PACE_PREFERENCE_OPTIONS)[number]
export type FontSize = (typeof FONT_SIZE_OPTIONS)[number]
export type DeviceType = (typeof DEVICE_TYPE_OPTIONS)[number]

/**
 * Device detection utility
 */
export function detectDeviceType(): DeviceType {
  if (typeof navigator === "undefined") {
    return "desktop"
  }

  const userAgent = navigator.userAgent.toLowerCase()

  // Check for VR/XR devices
  if (
    userAgent.includes("quest") ||
    userAgent.includes("oculus") ||
    userAgent.includes("vive") ||
    userAgent.includes("xr")
  ) {
    return "vr-headset"
  }

  // Check for mobile devices
  if (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    )
  ) {
    return "mobile"
  }

  return "desktop"
}
