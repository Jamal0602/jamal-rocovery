"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { motion } from "framer-motion"
import { Lock, Key, Loader2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AdminAuth() {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPinMode, setIsPinMode] = useState(false)
  const [pin, setPin] = useState(["", "", "", ""])
  const [isInitializing, setIsInitializing] = useState(true)
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const router = useRouter()
  const { toast } = useToast()
  const { login, isAuthenticated, refreshData } = useApp()

  // Reset admin credentials on first load
  useEffect(() => {
    const initializeAdminCredentials = async () => {
      try {
        setIsInitializing(true)

        // Check if the settings table exists
        const { data: tableData, error: tableError } = await supabase.from("settings").select("count").limit(1)

        if (tableError && tableError.code === "42P01") {
          // Table doesn't exist, create it
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS settings (
              id SERIAL PRIMARY KEY,
              key TEXT NOT NULL UNIQUE,
              value JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `

          await supabase.rpc("execute_sql", { query: createTableQuery })

          toast({
            title: "Database initialized",
            description: "Settings table created successfully",
          })
        }

        // Now check for admin settings
        const { data, error } = await supabase.from("settings").select("*").eq("key", "admin").single()

        const adminValue = {
          password: "admin123",
          pin: "0602",
        }

        if (error) {
          if (error.code === "PGRST116") {
            // Record not found, insert it
            await supabase.from("settings").insert([{ key: "admin", value: adminValue }])

            console.log("Admin credentials created successfully")
          } else {
            console.error("Error fetching admin settings:", error)
            toast({
              title: "Connection Error",
              description: "Could not connect to the database. Please try again later.",
              variant: "destructive",
            })
          }
        } else {
          // Update existing record
          await supabase.from("settings").update({ value: adminValue }).eq("key", "admin")

          console.log("Admin credentials updated successfully")
        }

        // Refresh app data
        await refreshData()
      } catch (error) {
        console.error("Error initializing admin credentials:", error)
        toast({
          title: "Setup Error",
          description: "Could not initialize admin settings. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAdminCredentials()
  }, [toast, refreshData])

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/dashboard")
    }
  }, [isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      let passwordToUse = password

      if (isPinMode) {
        passwordToUse = pin.join("")
      }

      // For direct login during development
      if (passwordToUse === "admin123" || passwordToUse === "0602") {
        // Create a session directly
        localStorage.setItem(
          "adminSession",
          JSON.stringify({
            isAdmin: true,
            expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          }),
        )

        toast({
          title: "Login successful",
          description: "Welcome to the admin panel",
        })

        // Force page reload to update authentication state
        window.location.href = "/admin/dashboard"
        return
      }

      const success = await login(passwordToUse)

      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel",
        })
        router.push("/admin/dashboard")
      } else {
        setError("Invalid credentials")
        toast({
          title: "Login failed",
          description: "Invalid password or PIN",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login")
      toast({
        title: "Login error",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    // Auto-focus next input
    if (value && index < 3) {
      pinInputRefs[index + 1].current?.focus()
    }

    // Auto-submit when all digits are filled
    if (value && index === 3) {
      const form = pinInputRefs[index].current?.form
      if (form) {
        setTimeout(() => form.requestSubmit(), 100)
      }
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!pin[index] && index > 0) {
        pinInputRefs[index - 1].current?.focus()
      }
    }
  }

  const togglePinMode = () => {
    setIsPinMode(!isPinMode)
    setError("")
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Initializing admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
          <CardHeader className="text-center pb-0">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold mb-2">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4 px-8">
            <p className="text-muted-foreground text-center mb-6">Enter your credentials to access the admin panel</p>

            {isPinMode ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">PIN</label>
                  <div className="flex justify-center gap-3">
                    {pin.map((digit, index) => (
                      <input
                        key={index}
                        ref={pinInputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        className="w-12 h-12 text-center text-lg font-medium border rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(index, e)}
                        required
                      />
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button type="submit" className="w-full btn-hover" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="text-center">
                  <Button type="button" variant="link" onClick={togglePinMode} className="text-sm">
                    Use Password Instead
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button type="submit" className="w-full btn-hover" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="text-center">
                  <Button type="button" variant="link" onClick={togglePinMode} className="text-sm">
                    <Key className="h-3 w-3 mr-1" /> Use PIN Instead
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          Default credentials: Password <span className="font-mono bg-muted px-1 py-0.5 rounded">admin123</span> or PIN{" "}
          <span className="font-mono bg-muted px-1 py-0.5 rounded">0602</span>
        </p>
      </div>
    </div>
  )
}

