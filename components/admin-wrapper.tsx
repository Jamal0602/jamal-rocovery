'use client'

import { type ReactNode, useEffect, useState } from "react"
import { AdminProvider } from "@/components/admin/admin-provider"

export default function AdminWrapper({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return <AdminProvider>{children}</AdminProvider>
}

export { AdminWrapper }

