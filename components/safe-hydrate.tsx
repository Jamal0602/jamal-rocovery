"use client"

import { useEffect, useState, type ReactNode } from "react"

export default function SafeHydrate({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return <>{children}</>
}

