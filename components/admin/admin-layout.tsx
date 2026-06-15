"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import {
  LayoutDashboard,
  FileText,
  Layers,
  PenTool,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Calendar,
  WorkflowIcon as Widgets,
  Info,
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { isAuthenticated, logout } = useApp()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/auth")
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/")
  }

  if (!isAuthenticated) {
    return null
  }

  const menuItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", href: "/admin/dashboard" },
    { icon: <FileText className="h-5 w-5" />, label: "Pages", href: "/admin/pages" },
    { icon: <Layers className="h-5 w-5" />, label: "Posts", href: "/admin/posts" },
    { icon: <Calendar className="h-5 w-5" />, label: "Events", href: "/admin/events" },
    { icon: <Widgets className="h-5 w-5" />, label: "Widgets", href: "/admin/widgets" },
    { icon: <PenTool className="h-5 w-5" />, label: "Editor", href: "/admin/editor" },
    { icon: <Bell className="h-5 w-5" />, label: "Notifications", href: "/admin/notifications" },
    { icon: <Info className="h-5 w-5" />, label: "Info", href: "/admin/info" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/admin/settings" },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-muted/30">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
        <Link href="/admin/dashboard" className="font-bold text-xl">
          Admin Panel
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-0 z-40 lg:relative lg:z-0 
          ${isSidebarOpen ? "block" : "hidden lg:block"}
          w-64 border-r bg-background transition-all duration-300
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="hidden lg:flex items-center justify-between p-4 border-b">
            <Link href="/admin/dashboard" className="font-bold text-xl">
              Admin Panel
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-primary"
              >
                <Home className="h-5 w-5" />
                <span>View Site</span>
              </Link>

              <div className="h-px bg-border my-4"></div>

              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}

