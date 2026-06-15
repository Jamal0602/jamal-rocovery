"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useApp } from "@/contexts/app-context"
import Link from "next/link"

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { profile } = useApp()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Default content if profile is not loaded yet
  const heroContent = {
    title: profile?.full_name || "JAMAL ASRAF",
    subtitle: profile?.title || "SINCE - 2008",
    description:
      profile?.description ||
      "I am a passionate technologist and innovator dedicated to creating solutions that make a difference. With expertise in web development, IoT, and Arduino projects, I strive to build technology that is both functional and user-friendly.",
    image:
      profile?.avatar_url ||
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPBX8QsC1Sl5RLkWvjC6xsq2bL7a7PrZu1C1N0IMBeTWpQXZrQUb6VH0JSVvKD6b82vSF06j1-FeNbE78ipjx-iwieXzJLHD3hQOOf3POVKHjP_Jr5qMuMgFJF5SubICSgbyyo-bn-e7tNeuUkfMnUtdByY6fUc3j6TqUH_yvNsz6u3VQ/s1600/IMG_20250324_223115.jpg",
    buttons: [
      { label: "About Me", href: "/about", variant: "default" },
      { label: "Connect", href: "/connect", variant: "outline" },
    ],
  }

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-60 h-60 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-60 h-60 bg-gradient-to-br from-green-500/20 to-yellow-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <motion.span
                className="text-primary gradient-text"
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                {heroContent.title.split(" ")[0]}
              </motion.span>{" "}
              {heroContent.title.split(" ").length > 1 ? heroContent.title.split(" ").slice(1).join(" ") : ""}
            </h1>
            <p className="text-muted-foreground mb-6">{heroContent.subtitle}</p>
            <p className="text-lg mb-8 max-w-md">{heroContent.description}</p>
            <div className="flex flex-wrap gap-4">
              {heroContent.buttons.map((button, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant={button.variant as "default" | "outline"}
                  className={button.variant === "default" ? "btn-pulse btn-hover" : "gradient-border btn-hover"}
                  asChild
                >
                  <Link href={button.href}>{button.label}</Link>
                </Button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-square rounded-full overflow-hidden">
              {/* Animated border */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 via-blue-500 to-purple-500 rounded-full animate-border-rotate"></div>

              {/* Image container */}
              <div className="absolute inset-1 rounded-full overflow-hidden">
                <Image
                  src={heroContent.image || "/placeholder.svg"}
                  alt="Profile"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

