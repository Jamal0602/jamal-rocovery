import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const fallbackSupabaseUrl = "https://fzjbaiggpjcvecyelzqf.supabase.co"
const fallbackSupabaseAnonKey = "sb_publishable_KLMtL5U2DUjrp5A1JGFatA_E6Mp5jER"

const getSupabaseConfig = (url?: string, key?: string) => ({
  url: url && url.length > 0 ? url : fallbackSupabaseUrl,
  key: key && key.length > 0 ? key : fallbackSupabaseAnonKey,
})

// Create a single Supabase client for the browser. During static prerendering
// Vercel may not have Supabase env vars yet; use harmless placeholders so
// imports do not crash the build. Runtime requests will still require real envs.
const publicConfig = getSupabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const isSupabaseConfigured =
  publicConfig.url !== fallbackSupabaseUrl && publicConfig.key !== fallbackSupabaseAnonKey

export const supabase = createClient<Database>(publicConfig.url, publicConfig.key)

// Create a server-side client (for server components and API routes).
export const createServerSupabaseClient = () => {
  const serverConfig = getSupabaseConfig(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  return createClient<Database>(serverConfig.url, serverConfig.key)
// Create a single supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Create a server-side client (for server components and API routes)
export const createServerSupabaseClient = () => {
  return createClient<Database>(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
}

// Helper functions for authentication
export async function signIn(password: string) {
 
  if (!isSupabaseConfigured) {
    return { success: false, error: "Supabase is not configured" }
  }


, we're using a simplified auth approach
  // Get the admin password from settings
  const { data, error } = await supabase.from("settings").select("value").eq("key", "admin").single()

  if (error) {
    console.error("Error fetching admin settings:", error)
    return { success: false, error: "Authentication failed" }
  }

  // Compare passwords (in a real app, use proper password hashing)
  if (data.value.password === password || data.value.pin === password) {
    // Set a session in localStorage
    localStorage.setItem(
      "adminSession",
      JSON.stringify({
        isAdmin: true,
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }),
    )
    return { success: true }
  }

  return { success: false, error: "Invalid credentials" }
}

export function signOut() {
  localStorage.removeItem("adminSession")
  return { success: true }
}

export function getSession() {
  const session = localStorage.getItem("adminSession")
  if (!session) return null

  try {
    const parsedSession = JSON.parse(session)
    if (parsedSession.expires < Date.now()) {
      localStorage.removeItem("adminSession")
      return null
    }
    return parsedSession
  } catch (error) {
    localStorage.removeItem("adminSession")
    return null
  }
}
