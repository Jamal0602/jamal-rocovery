"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Heart, Search, Filter, Grid3X3, Grid2X2, ArrowRight, Camera, ImageIcon, FolderOpen } from "lucide-react"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import { subscribeToTable } from "@/lib/realtime"
import { useToast } from "@/hooks/use-toast"
import AlbumPopup from "@/components/album-popup"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function AlbumPage() {
  const [activeTab, setActiveTab] = useState<"albums" | "photos">("albums")
  const [albums, setAlbums] = useState<AlbumData[]>([])
  const [images, setImages] = useState<ImageData[]>([])
  const [albumImages, setAlbumImages] = useState<{ [key: string]: ImageData[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid3" | "grid2">("grid3")
  const [categories, setCategories] = useState<string[]>(["all"])
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [likedImages, setLikedImages] = useState<string[]>([])
  const { toast } = useToast()

  const fetchAlbums = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("albums").select("*").order("created_at", { ascending: false })

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

      setAlbums(albumsWithCount)
    } catch (error) {
      console.error("Error fetching albums:", error)
      toast({
        title: "Error",
        description: "Failed to load albums. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsLoading(false), 300)
    }
  }, [toast])

  const fetchImages = useCallback(
    async (albumId?: string) => {
      try {
        setIsLoading(true)

        let query = supabase.from("images").select("*").order("created_at", { ascending: false })

        if (albumId) {
          // Fetch images for a specific album
          const { data: albumImageData, error: albumImageError } = await supabase
            .from("album_images")
            .select("image_id")
            .eq("album_id", albumId)
            .order("display_order", { ascending: true })

          if (albumImageError) throw albumImageError

          if (albumImageData && albumImageData.length > 0) {
            const imageIds = albumImageData.map((item) => item.image_id)
            query = query.in("id", imageIds)
          } else {
            setImages([])
            setIsLoading(false)
            return
          }
        }

        const { data, error } = await query

        if (error) throw error

        // Add likes field if it doesn't exist
        const imagesWithLikes = (data || []).map((image) => ({
          ...image,
          likes: image.likes || Math.floor(Math.random() * 20) + 1,
        }))

        setImages(imagesWithLikes)

        // Extract unique categories
        const uniqueCategories = ["all", ...new Set(imagesWithLikes.map((image) => image.category).filter(Boolean))]
        setCategories(uniqueCategories)

        if (albumId) {
          setAlbumImages((prev) => ({
            ...prev,
            [albumId]: imagesWithLikes,
          }))
        }
      } catch (error) {
        console.error("Error fetching images:", error)
        toast({
          title: "Error",
          description: "Failed to load images. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setTimeout(() => setIsLoading(false), 300)
      }
    },
    [toast],
  )

  useEffect(() => {
    if (activeTab === "albums") {
      fetchAlbums()
    } else {
      fetchImages(selectedAlbumId || undefined)
    }
    loadLikedImages()

    // Set up real-time subscription
    const albumsChannel = subscribeToTable("albums", fetchAlbums)
    const imagesChannel = subscribeToTable("images", () => fetchImages(selectedAlbumId || undefined))
    const albumImagesChannel = subscribeToTable("album_images", () => {
      if (selectedAlbumId) {
        fetchImages(selectedAlbumId)
      }
    })

    return () => {
      supabase.removeChannel(albumsChannel)
      supabase.removeChannel(imagesChannel)
      supabase.removeChannel(albumImagesChannel)
    }
  }, [fetchAlbums, fetchImages, activeTab, selectedAlbumId])

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
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOpenPopup = (image: ImageData) => {
    setSelectedImage(image)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
  }

  const handleSelectAlbum = (albumId: string) => {
    setSelectedAlbumId(albumId)
    setActiveTab("photos")
    fetchImages(albumId)
  }

  const handleBackToAlbums = () => {
    setSelectedAlbumId(null)
    setActiveTab("albums")
  }

  const filteredAlbums = albums.filter((album) => album.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredImages = images.filter((image) => {
    const matchesSearch = image.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || image.category === categoryFilter
    return matchesSearch && matchesCategory
  })

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {selectedAlbumId && activeTab === "photos"
                  ? albums.find((a) => a.id === selectedAlbumId)?.title || "Album Photos"
                  : "Photo Albums"}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                {selectedAlbumId && activeTab === "photos"
                  ? albums.find((a) => a.id === selectedAlbumId)?.description || "Browse photos in this album"
                  : "A collection of my photography, design work, and visual inspirations."}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 md:mt-0"
            >
              {selectedAlbumId && activeTab === "photos" ? (
                <Button variant="outline" onClick={handleBackToAlbums}>
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Back to Albums
                </Button>
              ) : (
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  <Camera className="h-3.5 w-3.5 mr-1.5" />
                  <span>{activeTab === "albums" ? `${albums.length} Albums` : `${images.length} Photos`}</span>
                </Badge>
              )}
            </motion.div>
          </div>

          <div className="mb-8">
            {!selectedAlbumId && (
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "albums" | "photos")}
                className="mb-6"
              >
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="albums">Albums</TabsTrigger>
                  <TabsTrigger value="photos">All Photos</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === "albums" ? "Search albums..." : "Search images..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9"
                />
              </div>

              <div className="flex gap-2">
                {activeTab === "photos" && (
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === "grid3" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("grid3")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid2" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("grid2")}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Ad placement */}
            <div className="w-full bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg p-4 mb-8 text-center">
              <p className="text-muted-foreground text-sm">Advertisement</p>
              <div className="h-[90px] flex items-center justify-center">
                <p className="text-muted-foreground/50">Ad Space (728x90)</p>
              </div>
            </div>

            {isLoading ? (
              <div className={`grid grid-cols-1 ${viewMode === "grid3" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}>
                {Array(9)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index} className="overflow-hidden backdrop-blur-sm bg-background/80 border-primary/20">
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <Skeleton className="absolute inset-0" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : activeTab === "albums" ? (
              // Albums Grid
              filteredAlbums.length > 0 ? (
                <motion.div
                  className={`grid grid-cols-1 ${viewMode === "grid3" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredAlbums.map((album, index) => (
                    <motion.div key={album.id} variants={item}>
                      <Card
                        className={`overflow-hidden backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group ${
                          index === 0 && viewMode === "grid3" ? "md:col-span-2 md:row-span-2" : ""
                        }`}
                        onClick={() => handleSelectAlbum(album.id)}
                      >
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
                              {album.featured && (
                                <Badge variant="secondary" className="bg-amber-500/30 backdrop-blur-md">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No albums found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? "Try adjusting your search criteria" : "There are no albums yet"}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery("")}>
                      Clear search
                    </Button>
                  )}
                </div>
              )
            ) : // Photos Grid
            filteredImages.length > 0 ? (
              <motion.div
                className={`grid grid-cols-1 ${viewMode === "grid3" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredImages.map((image, index) => (
                  <motion.div key={image.id} variants={item}>
                    <Card
                      className={`overflow-hidden backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group ${
                        index === 0 && viewMode === "grid3" ? "md:col-span-2 md:row-span-2" : ""
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
            ) : (
              <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-medium mb-2">No images found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || categoryFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : selectedAlbumId
                      ? "This album doesn't have any photos yet"
                      : "There are no images in the album yet"}
                </p>
                {(searchQuery || categoryFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setCategoryFilter("all")
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {/* Bottom ad placement */}
            <div className="w-full bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg p-4 mt-12 text-center">
              <p className="text-muted-foreground text-sm">Advertisement</p>
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-muted-foreground/50">Ad Space (300x250)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

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
  )
}

