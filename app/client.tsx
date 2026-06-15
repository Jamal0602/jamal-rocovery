"use client"

import type React from "react"

import { Inter } from "next/font/google"
import "./globals.css"
import { ClientProvider } from "@/components/client-provider"
import { AnimatePresence } from "framer-motion"
import LoadingScreen from "@/components/loading-screen"
import { useState, useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProvider>
          {loading ? <LoadingScreen /> : <AnimatePresence mode="wait">{children}</AnimatePresence>}
        </ClientProvider>
      </body>
    </html>
  )
}

