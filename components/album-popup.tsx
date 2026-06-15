"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, Share, Download, Info, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface AlbumPopupProps {
  isOpen: boolean
  onClose: () => void
  image: {
    id: string
    title: string
    url: string
    category: string
    created_at: string
    likes: number
  }
  onLike: (imageId: string, likes: number) => void
  isLiked: boolean
}

export default function AlbumPopup({ isOpen, onClose, image, onLike, isLiked }: AlbumPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
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
  }, [isOpen, onClose])

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: image.title,
          text: `Check out this image: ${image.title}`,
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

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = image.url
    link.download = `${image.title.replace(/\s+/g, "-").toLowerCase()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your image is being downloaded.",
    })
  }

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const imageVariants = {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
        >
          <motion.div
            ref={popupRef}
            className="relative max-w-4xl w-full max-h-[85vh] flex flex-col md:flex-row bg-background rounded-xl overflow-hidden shadow-2xl"
            variants={imageVariants}
          >
            {/* Image */}
            <div className="relative flex-1 min-h-[300px] md:min-h-[500px]">
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.title}
                fill
                className="object-contain bg-black/30"
              />
            </div>

            {/* Info sidebar */}
            <div className="w-full md:w-72 flex flex-col border-l">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{image.title}</h3>
                    <Badge variant="outline" className="bg-primary/5">
                      {image.category}
                    </Badge>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {format(parseISO(image.created_at), "MMMM d, yyyy")}
                </p>
              </div>

              <div className="flex-1 p-4">
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start" onClick={() => onLike(image.id, image.likes)}>
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    {isLiked ? "Liked" : "Like"} ({image.likes})
                  </Button>

                  <Button variant="outline" className="justify-start" onClick={handleShare}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  <Button variant="outline" className="justify-start" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Info className="h-4 w-4" />
                    <span>Image Information</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Category:</span> {image.category}
                    </p>
                    <p>
                      <span className="font-medium">ID:</span> {image.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t">
                <Button className="w-full" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

