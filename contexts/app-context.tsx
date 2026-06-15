"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { setupMessagesTable } from "@/lib/db-setup"

type AppContextType = {
  isLoading: boolean
  theme: string
  setTheme: (theme: string) => void
  socialLinks: any[]
  profile: any | null
  fetchProfile: () => Promise<void>
  isAuthenticated: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState("light")
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const [profile, setProfile] = useState<any | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }

    // Check authentication status
    const checkAuth = () => {
      const session = localStorage.getItem("adminSession")
      if (session) {
        try {
          const parsedSession = JSON.parse(session)
          if (parsedSession.expires > Date.now()) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem("adminSession")
          }
        } catch (error) {
          localStorage.removeItem("adminSession")
        }
      }
    }

    checkAuth()

    // Load initial data
    fetchInitialData()
  }, [])

  useEffect(() => {
    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Save theme preference
    localStorage.setItem("theme", theme)
  }, [theme])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      // Setup messages table if it doesn't exist
      await setupMessagesTable()

      // Fetch profile data
      await fetchProfile()

      // Fetch social links
      const { data: socialLinksData } = await supabase
        .from("social_links_star")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true })

      if (socialLinksData) {
        setSocialLinks(socialLinksData)
      }
    } catch (error) {
      console.error("Error fetching initial data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles_star").select("*").single()

      if (error) throw error
      setProfile(data)
      return data
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  }

  const login = async (password: string) => {
    try {
      // For this application, we're using a simplified auth approach
      // Get the admin password from settings
      const { data, error } = await supabase.from("settings_star").select("value").eq("key", "admin").single()

      if (error) {
        console.error("Error fetching admin settings:", error)
        return false
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
        setIsAuthenticated(true)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("adminSession")
    setIsAuthenticated(false)
  }

  return (
    <AppContext.Provider
      value={{
        isLoading,
        theme,
        setTheme,
        socialLinks,
        profile,
        fetchProfile,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

