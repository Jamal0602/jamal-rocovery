"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

type AdminContextType = {
  isAuthenticated: boolean
  isAdmin: boolean
  login: (credentials: { username: string; password: string }) => Promise<boolean>
  logout: () => void
  content: any
  settings: any
  updateContent: (section: string, data: any) => void
  updateSettings: (data: any) => void
  showAdminAuth: boolean
  setShowAdminAuth: (show: boolean) => void
  showRealTimePassword: () => void
}

const defaultSettings = {
  youtubeLink: "https://www.youtube.com/channel/UCubiz",
  usePin: false,
  pin: "1234",
  password: "admin123",
  siteName: "Jamal Asraf | Cubiz Group's of Technology",
  siteDescription: "Personal portfolio of Jamal Asraf, founder of Cubiz Group's of Technology",
  contactEmail: "ja.jamalasraf@gmail.com",
  contactPhone: "+91 9********",
  socialLinks: {
    linkedin: "https://linkedin.com/in/jamalasraf",
    github: "https://github.com/jamalasraf",
    twitter: "https://twitter.com/jamalasraf",
    instagram: "https://instagram.com/jamalasraf",
  },
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [content, setContent] = useState<any>({})
  const [settings, setSettings] = useState(defaultSettings)
  const [showAdminAuth, setShowAdminAuth] = useState(false)
  const { toast } = useToast()

  // Check for existing session
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession")
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession)
        if (session.expires > Date.now()) {
          setIsAuthenticated(true)
          setIsAdmin(session.isAdmin)
        } else {
          localStorage.removeItem("adminSession")
        }
      } catch (error) {
        localStorage.removeItem("adminSession")
      }
    }

    // Load content and settings from localStorage if available
    const savedContent = localStorage.getItem("adminContent")
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent))
      } catch (error) {
        console.error("Error loading content:", error)
      }
    }

    const savedSettings = localStorage.getItem("adminSettings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }
  }, [])

  const login = async (credentials: { username: string; password: string }) => {
    // In a real app, this would be an API call
    // For demo purposes, we're using hardcoded credentials
    const validCredentials =
      credentials.username === "admin" &&
      (credentials.password === settings.password || credentials.password === settings.pin)

    if (validCredentials) {
      const session = {
        isAdmin: true,
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }
      localStorage.setItem("adminSession", JSON.stringify(session))
      setIsAuthenticated(true)
      setIsAdmin(true)
      return true
    }

    return false
  }

  const logout = () => {
    localStorage.removeItem("adminSession")
    setIsAuthenticated(false)
    setIsAdmin(false)
  }

  const updateContent = (section: string, data: any) => {
    const newContent = { ...content, [section]: data }
    setContent(newContent)
    localStorage.setItem("adminContent", JSON.stringify(newContent))
  }

  const updateSettings = (data: any) => {
    const newSettings = { ...settings, ...data }
    setSettings(newSettings)
    localStorage.setItem("adminSettings", JSON.stringify(newSettings))
  }

  const showRealTimePassword = () => {
    toast({
      title: "Password Recovery",
      description: `Current password: ${settings.password}${settings.usePin ? ` | PIN: ${settings.pin}` : ""}`,
      duration: 5000,
    })
  }

  const contextValue: AdminContextType = {
    isAuthenticated,
    isAdmin,
    login,
    logout,
    content,
    settings,
    updateContent,
    updateSettings,
    showAdminAuth,
    setShowAdminAuth,
    showRealTimePassword,
  }

  return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}

