"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Calendar, ArrowRight, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { subscribeToTable } from "@/lib/realtime"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import AdvancedPopup from "@/components/advanced-popup"
import { useToast } from "@/hooks/use-toast"

interface Post {
  id: string
  title: string
  excerpt: string | null
  content: string
  image_url: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  likes: number
}

export default function FeaturedPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchPosts()
    loadLikedPosts()

    // Set up real-time subscription
    const channel = subscribeToTable("posts_star", fetchPosts)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("posts_star")
        .select("*")
        .eq("featured", true)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3)

      if (error) throw error

      // Add likes field if it doesn't exist
      const postsWithLikes = (data || []).map((post) => ({
        ...post,
        likes: post.likes || Math.floor(Math.random() * 50) + 5,
      }))

      setPosts(postsWithLikes)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadLikedPosts = () => {
    try {
      const storedLikedPosts = localStorage.getItem("likedPosts")
      if (storedLikedPosts) {
        setLikedPosts(JSON.parse(storedLikedPosts))
      }
    } catch (error) {
      console.error("Error loading liked posts:", error)
    }
  }

  const handleLike = async (postId: string, currentLikes: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the popup when clicking like button

    try {
      const isLiked = likedPosts.includes(postId)
      let newLikedPosts = [...likedPosts]
      let newLikesCount = currentLikes

      if (isLiked) {
        // Unlike
        newLikedPosts = newLikedPosts.filter((id) => id !== postId)
        newLikesCount -= 1
      } else {
        // Like
        newLikedPosts.push(postId)
        newLikesCount += 1
        toast({
          title: "Post liked!",
          description: "This post has been added to your liked posts.",
        })
      }

      // Update local storage
      localStorage.setItem("likedPosts", JSON.stringify(newLikedPosts))
      setLikedPosts(newLikedPosts)

      // Update posts state
      setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, likes: newLikesCount } : post)))

      // Update database
      const { error } = await supabase.from("posts_star").update({ likes: newLikesCount }).eq("id", postId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  const handleOpenPopup = (post: Post) => {
    setSelectedPost(post)
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
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-background/80">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Featured Posts</h2>
            <p className="text-muted-foreground max-w-2xl">
              Insights, tutorials, and thoughts on technology, development, and innovation.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button variant="outline" className="mt-4 md:mt-0" asChild>
              <Link href="">
                View All Posts <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
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
                        className="w-16 h-16"
                      />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-muted rounded-md w-3/4"></div>
                      <div className="h-4 bg-muted rounded-md w-1/2"></div>
                      <div className="h-4 bg-muted rounded-md w-full"></div>
                      <div className="h-4 bg-muted rounded-md w-full"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded-md w-20"></div>
                        <div className="h-6 bg-muted rounded-md w-20"></div>
                      </div>
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
            {posts.map((post, index) => (
              <motion.div key={post.id} variants={item}>
                <Card
                  className="overflow-hidden h-full flex flex-col backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
                  onClick={() => handleOpenPopup(post)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.image_url || "/placeholder.svg?height=300&width=600"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{format(parseISO(post.created_at), "MMMM d, yyyy")}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">
                      {post.excerpt || post.content.substring(0, 150) + "..."}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags &&
                        post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-primary/10">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={(e) => handleLike(post.id, post.likes, e)}
                      >
                        <Heart
                          className={`h-4 w-4 ${likedPosts.includes(post.id) ? "fill-red-500 text-red-500" : ""}`}
                        />
                        <span>{post.likes}</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {selectedPost && (
        <AdvancedPopup isOpen={isPopupOpen} onClose={handleClosePopup} item={selectedPost} type="post" />
      )}
    </section>
  )
}

