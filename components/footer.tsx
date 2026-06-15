"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { motion } from "framer-motion"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [lockClicks, setLockClicks] = useState(0)
  const router = useRouter()
  const { isAuthenticated } = useApp()
  const appVersion = "v.beta.legacy" // Updated version number

  const handleLockClick = () => {
    const newCount = lockClicks + 1
    setLockClicks(newCount)

    if (newCount === 5) {
      router.push("/admin/auth")
      setLockClicks(0)
    }
  }

  return (
    <footer className="border-t py-8 md:py-12 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="text-xl font-bold">
              <motion.span className="text-primary" whileHover={{ scale: 1.05 }}>
                JAMAL
              </motion.span>{" "}
              ASRAF
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Founder of Cubiz Group&apos;s of Technology
            </p>
            <Link
              href="https://www.cubiz.space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              www.cubiz.space
            </Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/about">About</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/skills">Skills</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/events">Events</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/connect">Connect</Link>
              </Button>
              {isAuthenticated && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/dashboard">Admin</Link>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">© {currentYear} Jamal Asraf. All rights reserved.</p>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLockClick}>
                <Lock className="h-4 w-4" />
                <span className="sr-only">Admin Access</span>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Powered by <span className="font-medium">Cubiz Group&apos;s Technology</span> | Made with ❤️ by MPA |{" "}
              <span className="text-primary">{appVersion}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

