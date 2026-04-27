import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import { DashboardContent } from "@/components/dashboard-content"
import { AccessibilityProvider } from "@/components/accessibility-provider"

// Force dynamic rendering - this page requires authentication
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Fetch user's accessibility preferences
  const { data: accessibilityProfile } = await supabase
    .from("accessibility_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  return (
    <AccessibilityProvider>
      <DashboardContent user={session.user} accessibilityProfile={accessibilityProfile} />
    </AccessibilityProvider>
  )
}
