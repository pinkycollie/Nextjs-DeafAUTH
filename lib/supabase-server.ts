import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./supabase"

// Server-side Supabase client (for use in Server Components only)
export const createServerClient = () => createServerComponentClient<Database>({ cookies })
