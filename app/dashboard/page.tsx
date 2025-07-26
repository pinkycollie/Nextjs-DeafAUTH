import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import { DashboardContent } from "@/components/dashboard-content"

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

  return <DashboardContent user={session.user} accessibilityProfile={accessibilityProfile} />
}
