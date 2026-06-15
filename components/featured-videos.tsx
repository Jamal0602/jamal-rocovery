"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Calendar, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { subscribeToTable } from "@/lib/realtime"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Video {
  id: string
  title: string
  description: string
  video_id: string
  thumbnail_url: string | null
  category: string | null
  published_at: string
  likes: number
  featured: boolean | null
}

export default function FeaturedVideos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedVideos, setLikedVideos] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchVideos()
    loadLikedVideos()

    // Set up real-time subscription
    const channel = subscribeToTable("videos_star", fetchVideos)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchVideos = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("videos_star")
        .select("*")
        .eq("featured", true)
        .order("published_at", { ascending: false })
        .limit(3)

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error("Error fetching videos:", error)
      // Fallback data if database fetch fails
      setVideos([
        {
          id: "1",
          title: "Introduction to Web Development",
          description: "Learn the basics of web development with HTML, CSS, and JavaScript.",
          video_id: "dQw4w9WgXcQ",
          thumbnail_url: "/placeholder.svg?height=300&width=600",
          category: "Tutorial",
          published_at: new Date().toISOString(),
          likes: 42,
          featured: true,
        },
        {
          id: "2",
          title: "Advanced React Patterns",
          description: "Discover advanced patterns for building scalable React applications.",
          video_id: "dQw4w9WgXcQ",
          thumbnail_url: "/placeholder.svg?height=300&width=600",
          category: "Tutorial",
          published_at: new Date().toISOString(),
          likes: 38,
          featured: true,
        },
        {
          id: "3",
          title: "Building a Portfolio Website",
          description: "Step-by-step guide to creating your own portfolio website.",
          video_id: "dQw4w9WgXcQ",
          thumbnail_url: "/placeholder.svg?height=300&width=600",
          category: "Tutorial",
          published_at: new Date().toISOString(),
          likes: 56,
          featured: true,
        },
      ])
    } finally {
      // Make loading quicker
      setTimeout(() => setIsLoading(false), 500)
    }
  }

  const loadLikedVideos = () => {
    try {
      const storedLikedVideos = localStorage.getItem("likedVideos")
      if (storedLikedVideos) {
        setLikedVideos(JSON.parse(storedLikedVideos))
      }
    } catch (error) {
      console.error("Error loading liked videos:", error)
    }
  }

  const handleLike = async (videoId: string, currentLikes: number) => {
    try {
      const isLiked = likedVideos.includes(videoId)
      let newLikedVideos = [...likedVideos]
      let newLikesCount = currentLikes

      if (isLiked) {
        // Unlike
        newLikedVideos = newLikedVideos.filter((id) => id !== videoId)
        newLikesCount -= 1
      } else {
        // Like
        newLikedVideos.push(videoId)
        newLikesCount += 1
        toast({
          title: "Video liked!",
          description: "This video has been added to your liked videos.",
        })
      }

      // Update local storage
      localStorage.setItem("likedVideos", JSON.stringify(newLikedVideos))
      setLikedVideos(newLikedVideos)

      // Update videos state
      setVideos((prevVideos) =>
        prevVideos.map((video) => (video.id === videoId ? { ...video, likes: newLikesCount } : video)),
      )

      // Update database
      const { error } = await supabase.from("videos_star").update({ likes: newLikesCount }).eq("id", videoId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  const openYouTubeVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background/80 to-background">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Featured Videos</h2>
            <p className="text-muted-foreground max-w-2xl">
              Watch tutorials, presentations, and other video content from my YouTube channel.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button variant="outline" className="mt-4 md:mt-0" asChild>
              <Link href="https://www.youtube.com/channel/UCxxxxxxxx" target="_blank" rel="noopener noreferrer">
                Visit Channel <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Ad placement */}
        <div className="w-full bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-muted-foreground text-sm">Advertisement</p>
          <div className="h-[90px] flex items-center justify-center">
            <p className="text-muted-foreground/50">Ad Space (728x90)</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="animate-pulse backdrop-blur-sm bg-background/80 border-primary/20">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Animation%20-%201743734436715-lMmSr5uEKw8jf3dI6z8yDhFgUpbbtC.gif"
                        alt="Loading"
                        className="w-12 h-12"
                      />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-muted rounded-md w-3/4"></div>
                      <div className="h-4 bg-muted rounded-md w-1/2"></div>
                      <div className="h-4 bg-muted rounded-md w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {videos.map((video) => (
              <motion.div key={video.id} variants={item}>
                <Card className="overflow-hidden h-full flex flex-col backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
                  <div
                    className="relative aspect-video overflow-hidden cursor-pointer group"
                    onClick={() => openYouTubeVideo(video.video_id)}
                  >
                    <img
                      src={video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{format(parseISO(video.published_at), "MMMM d, yyyy")}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">{video.description}</p>
                    {video.category && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-primary/10">
                          {video.category}
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(video.id, video.likes)
                        }}
                      >
                        <Heart
                          className={`h-4 w-4 ${likedVideos.includes(video.id) ? "fill-red-500 text-red-500" : ""}`}
                        />
                        <span>{video.likes}</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openYouTubeVideo(video.video_id)}>
                        Watch Video <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

