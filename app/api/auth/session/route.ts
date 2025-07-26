import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    // Get user accessibility preferences
    const { data: profile } = await supabase
      .from("accessibility_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single()

    return NextResponse.json({
      user: session.user,
      accessibility_preferences: profile || {
        high_contrast: false,
        haptic_feedback: true,
        audio_feedback: true,
        font_size: "medium",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
