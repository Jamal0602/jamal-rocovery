"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useApp } from "@/contexts/app-context"
import { useOffline } from "@/hooks/use-offline"
import OfflinePage from "@/components/offline-page"
import {
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  Send,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Dribbble,
  Figma,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function ConnectPage() {
  const { socialLinks, profile } = useApp()
  const { toast } = useToast()
  const isOffline = useOffline()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const formInView = useInView(formRef, { once: true, amount: 0.3 })
  const formControls = useAnimation()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    education: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
    if (formInView) {
      formControls.start("visible")
    }
  }, [formInView, formControls])

  if (isOffline) {
    return <OfflinePage />
  }

  // Contact info
  const contactInfo = {
    email: profile?.email || "ja.jamalasraf@gmail.com",
    address: profile?.location || "Cheranmahadevi, India",
    website: profile?.website || "https://www.cubiz.space",
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Save message to Supabase
      const { error } = await supabase.from("messages_star").insert([
        {
          name: formData.name,
          email: formData.email,
          education: formData.education,
          subject: formData.subject,
          message: formData.message,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      // Show success message
      setIsSuccess(true)
      toast({
        title: "Message sent!",
        description: "Thank you for your message. I'll get back to you as soon as possible.",
      })

      // Reset the form
      setFormData({
        name: "",
        email: "",
        education: "",
        subject: "",
        message: "",
      })

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="h-5 w-5" />
      case "github":
        return <Github className="h-5 w-5" />
      case "twitter":
        return <Twitter className="h-5 w-5" />
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "youtube":
        return <Youtube className="h-5 w-5" />
      case "facebook":
        return <Facebook className="h-5 w-5" />
      case "dribbble":
        return <Dribbble className="h-5 w-5" />
      case "figma":
        return <Figma className="h-5 w-5" />
      default:
        return <ExternalLink className="h-5 w-5" />
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24, delay: 0.2 },
    },
  }

  return (
    <motion.main
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <div className="flex-1">
        <section className="py-12 md:py-16 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Connect With Me</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find me on various platforms and social media. Feel free to reach out for collaborations, questions, or
                just to say hello! ✨
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6"
              >
                <motion.div variants={itemVariants}>
                  <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden group">
                    <CardContent className="p-6 flex flex-col h-full relative">
                      <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700"></div>

                      <div className="flex items-start gap-4 mb-4 relative z-10">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Email</h3>
                          <p className="text-muted-foreground">{contactInfo.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-auto relative z-10" asChild>
                        <a href={`mailto:${contactInfo.email}`}>Send Email</a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden group">
                    <CardContent className="p-6 flex flex-col h-full relative">
                      <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700"></div>

                      <div className="flex items-start gap-4 mb-4 relative z-10">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Location</h3>
                          <p className="text-muted-foreground">{contactInfo.address}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-auto relative z-10" asChild>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(contactInfo.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Map
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden group">
                    <CardContent className="p-6 flex flex-col h-full relative">
                      <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700"></div>

                      <div className="flex items-start gap-4 mb-4 relative z-10">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Globe className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Website</h3>
                          <p className="text-muted-foreground">{contactInfo.website}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-auto relative z-10" asChild>
                        <a href={contactInfo.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div ref={formRef} variants={formVariants} initial="hidden" animate={formControls}>
                <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="gradient-text">Send Me a Message</span>
                      <motion.span animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ duration: 0.5, delay: 1 }}>
                        📝
                      </motion.span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSuccess ? (
                      <motion.div
                        className="flex flex-col items-center justify-center py-8 text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      >
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground mb-6">
                          Thank you for reaching out. I'll get back to you as soon as possible.
                        </p>
                        <Button variant="outline" onClick={() => setIsSuccess(false)}>
                          Send Another Message
                        </Button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="border-primary/20 focus:border-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="border-primary/20 focus:border-primary"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="education">Education</Label>
                            <Input
                              id="education"
                              name="education"
                              placeholder="Your education background"
                              value={formData.education}
                              onChange={handleInputChange}
                              className="border-primary/20 focus:border-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                              id="subject"
                              name="subject"
                              placeholder="Message subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              className="border-primary/20 focus:border-primary"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Your message here..."
                            rows={5}
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            className="border-primary/20 focus:border-primary"
                          />
                        </div>

                        <Button type="submit" className="w-full btn-pulse btn-hover" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" /> Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">Social Media</h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {socialLinks.map((link, index) => (
                <motion.div key={link.id} variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                  <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all overflow-hidden group">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                          {getSocialIcon(link.platform)}
                        </div>
                        <h3 className="font-medium">{link.display_name || link.platform}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-auto ml-auto group-hover:text-primary transition-colors"
                        asChild
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" /> Visit
                        </a>
                      </Button>

                      {/* Decorative element */}
                      <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </motion.main>
  )
}

