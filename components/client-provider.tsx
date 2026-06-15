"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/contexts/app-context"
import { AdminProvider } from "@/components/admin/admin-provider"
import { Toaster } from "@/components/ui/toaster"

export function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AppProvider>
        <AdminProvider>
          {children}
          <Toaster />
        </AdminProvider>
      </AppProvider>
    </ThemeProvider>
  )
}

