import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Client-side Supabase client
export const createClient = () => createClientComponentClient()

// Database types (you can generate these with Supabase CLI)
export type Database = {
  public: {
    Tables: {
      accessibility_profiles: {
        Row: {
          id: string
          user_id: string
          high_contrast: boolean
          haptic_feedback: boolean
          audio_feedback: boolean
          font_size: "small" | "medium" | "large"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          high_contrast?: boolean
          haptic_feedback?: boolean
          audio_feedback?: boolean
          font_size?: "small" | "medium" | "large"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          high_contrast?: boolean
          haptic_feedback?: boolean
          audio_feedback?: boolean
          font_size?: "small" | "medium" | "large"
          created_at?: string
          updated_at?: string
        }
      }
      auth_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          device_info: unknown
          ip_address: string
          user_agent: string
          is_active: boolean
          last_activity: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          device_info?: unknown
          ip_address?: string
          user_agent?: string
          is_active?: boolean
          last_activity?: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          device_info?: unknown
          ip_address?: string
          user_agent?: string
          is_active?: boolean
          last_activity?: string
          created_at?: string
          expires_at?: string
        }
      }
    }
  }
}
