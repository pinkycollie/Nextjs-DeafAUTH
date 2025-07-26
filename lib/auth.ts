import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a singleton client for client-side operations
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}

export async function signUp(email: string, password: string, name: string) {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          accessibility_preferences: {
            high_contrast: false,
            haptic_feedback: true,
            audio_feedback: true,
            font_size: "medium",
          },
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred during sign up" }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // Redirect to dashboard on successful sign in
    if (data.user) {
      window.location.href = "/dashboard"
    }

    return { data }
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "An unexpected error occurred during sign in" }
  }
}

export async function signOut() {
  try {
    const supabase = getSupabaseClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return { error: "An unexpected error occurred during sign out" }
  }
}

export async function resetPassword(email: string) {
  try {
    const supabase = getSupabaseClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "An unexpected error occurred while sending reset email" }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = getSupabaseClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { error: error.message }
    }

    return { user }
  } catch (error) {
    console.error("Get user error:", error)
    return { error: "An unexpected error occurred while fetching user" }
  }
}
