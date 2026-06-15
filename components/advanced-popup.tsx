"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink, Calendar, Clock, MapPin, User, Github, Heart, Bookmark, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format, parseISO } from "date-fns"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface AdvancedPopupProps {
  isOpen: boolean
  onClose: () => void
  item: any
  type: "post" | "project" | "event"
}

export default function AdvancedPopup({ isOpen, onClose, item, type }: AdvancedPopupProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(item?.likes || Math.floor(Math.random() * 50) + 5)
  const popupRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if item is liked or bookmarked from localStorage
    if (item?.id) {
      try {
        const likedItems = JSON.parse(
          localStorage.getItem(`liked${type.charAt(0).toUpperCase() + type.slice(1)}s`) || "[]",
        )
        const bookmarkedItems = JSON.parse(localStorage.getItem("bookmarkedItems") || "[]")

        setIsLiked(likedItems.includes(item.id))
        setIsBookmarked(bookmarkedItems.includes(`${type}-${item.id}`))
        setLikeCount(item.likes || likeCount)
      } catch (error) {
        console.error("Error loading liked/bookmarked items:", error)
      }
    }

    // Add event listener for escape key
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    // Add event listener for clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
      document.addEventListener("mousedown", handleClickOutside)
      // Prevent body scrolling when popup is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
      document.removeEventListener("mousedown", handleClickOutside)
      // Restore body scrolling when popup is closed
      document.body.style.overflow = "auto"
    }
  }, [isOpen, item, onClose, type, likeCount])

  const handleLike = async () => {
    try {
      const storageKey = `liked${type.charAt(0).toUpperCase() + type.slice(1)}s`
      const likedItems = JSON.parse(localStorage.getItem(storageKey) || "[]")
      let newLikedItems = [...likedItems]
      let newLikesCount = likeCount

      if (isLiked) {
        // Unlike
        newLikedItems = newLikedItems.filter((id) => id !== item.id)
        newLikesCount -= 1
      } else {
        // Like
        newLikedItems.push(item.id)
        newLikesCount += 1
        toast({
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} liked!`,
          description: `This ${type} has been added to your liked items.`,
        })
      }

      // Update local storage
      localStorage.setItem(storageKey, JSON.stringify(newLikedItems))
      setIsLiked(!isLiked)
      setLikeCount(newLikesCount)

      // Update database
      const { error } = await supabase.from(`${type}s_star`).update({ likes: newLikesCount }).eq("id", item.id)

      if (error) throw error
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  const handleBookmark = () => {
    try {
      const bookmarkedItems = JSON.parse(localStorage.getItem("bookmarkedItems") || "[]")
      const itemId = `${type}-${item.id}`

      if (isBookmarked) {
        // Remove bookmark
        const updatedBookmarkedItems = bookmarkedItems.filter((id: string) => id !== itemId)
        localStorage.setItem("bookmarkedItems", JSON.stringify(updatedBookmarkedItems))
      } else {
        // Add bookmark
        bookmarkedItems.push(itemId)
        localStorage.setItem("bookmarkedItems", JSON.stringify(bookmarkedItems))

        toast({
          title: "Bookmarked!",
          description: `This ${type} has been added to your bookmarks.`,
        })
      }

      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error("Error updating bookmarked items:", error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: item?.title,
          text: item?.description || item?.excerpt || "",
          url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error))
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      })
    }
  }

  // Function to render HTML content safely
  const renderHTML = (content: string) => {
    // Add image placeholders to content
    const contentWithImages = content.replace(/\[IMAGE:(\d+)\]/g, (match, index) => {
      return `<div class="my-6">
        <img src="/placeholder.svg?height=400&width=800" alt="Image ${index}" class="rounded-md w-full h-auto" />
      </div>`
    })

    // Convert newlines to paragraphs
    const htmlContent = contentWithImages
      .split("\n\n")
      .map((paragraph) => `<p class="mb-4">${paragraph}</p>`)
      .join("")

    return { __html: htmlContent }
  }

  if (!item) return null

  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              ref={popupRef}
              className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
            >
              {/* Header with image */}
              <div className="relative w-full aspect-video">
                <Image
                  src={item.image_url || "/placeholder.svg?height=600&width=1200"}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{item.title}</h2>

                  <div className="flex flex-wrap gap-3 mt-3">
                    {type === "post" &&
                      item.tags &&
                      item.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="bg-primary/30 backdrop-blur-md">
                          {tag}
                        </Badge>
                      ))}

                    {type === "project" &&
                      item.technologies &&
                      item.technologies.map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="bg-primary/30 backdrop-blur-md">
                          {tech}
                        </Badge>
                      ))}

                    {type === "event" &&
                      item.tags &&
                      item.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="bg-primary/30 backdrop-blur-md">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {type === "post" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{format(parseISO(item.created_at), "MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-primary" />
                        <span>Jamal Asraf</span>
                      </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                      {item.excerpt && <p className="text-lg font-medium text-muted-foreground">{item.excerpt}</p>}
                      <div className="mt-4" dangerouslySetInnerHTML={renderHTML(item.content)} />
                    </div>
                  </div>
                )}

                {type === "project" && (
                  <div className="space-y-6">
                    <div
                      className="text-lg text-muted-foreground"
                      dangerouslySetInnerHTML={renderHTML(item.description)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-muted/50">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-3">Technologies</h3>
                          <div className="flex flex-wrap gap-2">
                            {item.technologies &&
                              item.technologies.map((tech: string) => (
                                <Badge key={tech} variant="outline" className="bg-primary/5">
                                  {tech}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </Card>

                      <Card className="bg-muted/50">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-3">Links</h3>
                          <div className="flex flex-col gap-2">
                            {item.github_url && (
                              <Button variant="outline" size="sm" className="justify-start" asChild>
                                <a href={item.github_url} target="_blank" rel="noopener noreferrer">
                                  <Github className="h-4 w-4 mr-2" /> GitHub Repository
                                </a>
                              </Button>
                            )}
                            {item.demo_url && (
                              <Button variant="outline" size="sm" className="justify-start" asChild>
                                <a href={item.demo_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" /> Live Demo
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {type === "event" && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Date</p>
                          <p className="text-muted-foreground">
                            {format(parseISO(item.start_date), "MMMM d, yyyy")}
                            {item.end_date && ` - ${format(parseISO(item.end_date), "MMMM d, yyyy")}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Time</p>
                          <p className="text-muted-foreground">{format(parseISO(item.start_date), "h:mm a")}</p>
                        </div>
                      </div>

                      {item.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-muted-foreground">{item.location}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-3">About this event</h3>
                      <div className="text-muted-foreground" dangerouslySetInnerHTML={renderHTML(item.description)} />
                    </div>

                    {item.event_url && (
                      <div>
                        <Button className="w-full" asChild>
                          <a href={item.event_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" /> Register for Event
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleLike}>
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    <span>{likeCount}</span>
                  </Button>

                  <Button variant="ghost" size="sm" onClick={handleBookmark}>
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share className="h-4 w-4 mr-1.5" /> Share
                  </Button>

                  <Button variant="default" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

