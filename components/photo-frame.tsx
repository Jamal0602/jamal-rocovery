"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Heart, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import AlbumPopup from "./album-popup"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface ImageData {
  id: string
  title: string
  url: string
  category: string
  created_at: string
  likes: number
}

interface AlbumData {
  id: string
  title: string
  description: string
  cover_image_url: string
  created_at: string
  featured: boolean
  image_count?: number
}

export default function PhotoFrame() {
  const [displayMode, setDisplayMode] = useState<"albums" | "images">("albums")
  const [featuredAlbums, setFeaturedAlbums] = useState<AlbumData[]>([])
  const [images, setImages] = useState<ImageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [likedImages, setLikedImages] = useState<string[]>([])
  const { toast } = useToast()

  const fetchFeaturedAlbums = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("featured", true)
        .limit(4)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get image count for each album
      const albumsWithCount = await Promise.all(
        (data || []).map(async (album) => {
          const { count, error: countError } = await supabase
            .from("album_images")
            .select("*", { count: "exact", head: true })
            .eq("album_id", album.id)

          if (countError) throw countError

          return {
            ...album,
            image_count: count || 0,
          }
        }),
      )

      setFeaturedAlbums(albumsWithCount)

      // If no featured albums, fall back to showing images
      if (albumsWithCount.length === 0) {
        setDisplayMode("images")
        fetchRandomImages()
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error fetching featured albums:", error)
      // Fallback to images if album fetch fails
      setDisplayMode("images")
      fetchRandomImages()
    }
  }, [])

  const fetchRandomImages = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .limit(4)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Add likes field if it doesn't exist
      const imagesWithLikes = (data || []).map((image) => ({
        ...image,
        likes: image.likes || Math.floor(Math.random() * 20) + 1,
      }))

      setImages(imagesWithLikes)
    } catch (error) {
      console.error("Error fetching images:", error)
      // Fallback images if database fetch fails
      setImages([
        {
          id: "1",
          title: "Golden Hour Sunset",
          url: "https://images.unsplash.com/photo-1506815444479-bfdb1e96c566?q=80&w=1000",
          category: "Sunset",
          created_at: new Date().toISOString(),
          likes: 42,
        },
        {
          id: "2",
          title: "Beach Sunset",
          url: "https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=1000",
          category: "Sunset",
          created_at: new Date().toISOString(),
          likes: 38,
        },
        {
          id: "3",
          title: "Mountain Silhouette",
          url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=1000",
          category: "Sunset",
          created_at: new Date().toISOString(),
          likes: 56,
        },
        {
          id: "4",
          title: "Ocean Horizon",
          url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000",
          category: "Sunset",
          created_at: new Date().toISOString(),
          likes: 29,
        },
      ])
    } finally {
      setTimeout(() => setIsLoading(false), 300) // Quick loading
    }
  }, [])

  useEffect(() => {
    if (displayMode === "albums") {
      fetchFeaturedAlbums()
    } else {
      fetchRandomImages()
    }
    loadLikedImages()
  }, [fetchFeaturedAlbums, fetchRandomImages, displayMode])

  const loadLikedImages = () => {
    try {
      const storedLikedImages = localStorage.getItem("likedImages")
      if (storedLikedImages) {
        setLikedImages(JSON.parse(storedLikedImages))
      }
    } catch (error) {
      console.error("Error loading liked images:", error)
    }
  }

  const handleLike = async (imageId: string, currentLikes: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the popup when clicking like button

    try {
      const isLiked = likedImages.includes(imageId)
      let newLikedImages = [...likedImages]
      let newLikesCount = currentLikes

      if (isLiked) {
        // Unlike
        newLikedImages = newLikedImages.filter((id) => id !== imageId)
        newLikesCount -= 1
      } else {
        // Like
        newLikedImages.push(imageId)
        newLikesCount += 1
        toast({
          title: "Image liked!",
          description: "This image has been added to your liked images.",
        })
      }

      // Update local storage
      localStorage.setItem("likedImages", JSON.stringify(newLikedImages))
      setLikedImages(newLikedImages)

      // Update images state
      setImages((prevImages) =>
        prevImages.map((image) => (image.id === imageId ? { ...image, likes: newLikesCount } : image)),
      )

      // Update database
      const { error } = await supabase.from("images").update({ likes: newLikesCount }).eq("id", imageId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  const handleOpenPopup = (image: ImageData) => {
    setSelectedImage(image)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-background/90">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
              {displayMode === "albums" ? "Featured Albums" : "Photo Gallery"}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {displayMode === "albums"
                ? "Explore my curated collections of photography and visual art."
                : "A glimpse into my photography collection. Explore more in the full album."}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button variant="outline" className="mt-4 md:mt-0" asChild>
              <Link href="/album">
                View All Albums <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="overflow-hidden backdrop-blur-sm bg-background/80 border-primary/20">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <Skeleton className="absolute inset-0" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : displayMode === "albums" ? (
          // Albums Grid
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {featuredAlbums.map((album, index) => (
              <motion.div key={album.id} variants={item}>
                <Card
                  className={`overflow-hidden backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                  asChild
                >
                  <Link href={`/album?albumId=${album.id}`}>
                    <div className="aspect-square relative">
                      <Image
                        src={album.cover_image_url || "/placeholder.svg?height=400&width=400"}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <h3 className="text-white font-medium truncate">{album.title}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="secondary" className="bg-primary/30 backdrop-blur-md">
                            {album.image_count || 0} Photos
                          </Badge>
                          <Badge variant="secondary" className="bg-amber-500/30 backdrop-blur-md">
                            Featured
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // Images Grid
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {images.map((image, index) => (
              <motion.div key={image.id} variants={item}>
                <Card
                  className={`overflow-hidden backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                  onClick={() => handleOpenPopup(image)}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={image.url || "/placeholder.svg?height=400&width=400"}
                      alt={image.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <h3 className="text-white font-medium truncate">{image.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="secondary" className="bg-primary/30 backdrop-blur-md">
                          {image.category}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white gap-1.5 hover:bg-white/20"
                          onClick={(e) => handleLike(image.id, image.likes, e)}
                        >
                          <Heart
                            className={`h-4 w-4 ${likedImages.includes(image.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                          />
                          <span>{image.likes}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedImage && (
          <AlbumPopup
            isOpen={isPopupOpen}
            onClose={handleClosePopup}
            image={selectedImage}
            onLike={(imageId, likes) => handleLike(imageId, likes, { stopPropagation: () => {} } as any)}
            isLiked={likedImages.includes(selectedImage.id)}
          />
        )}
      </div>
    </section>
  )
}

