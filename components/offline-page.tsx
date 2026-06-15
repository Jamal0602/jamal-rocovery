"use client"

import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-primary"
            >
              <Wifi className="h-24 w-24 opacity-20" />
            </motion.div>
            <WifiOff className="h-16 w-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">You're Offline</h1>
        <p className="text-muted-foreground mb-8">
          It looks like you've lost your internet connection. The content you're trying to access is not available
          offline.
        </p>

        <div className="space-y-4">
          <Button onClick={handleRefresh} className="w-full btn-hover" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <p className="text-sm text-muted-foreground">
            Some features of this site are available offline. Check back when you have an internet connection to access
            all content.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

