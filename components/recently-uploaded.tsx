"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Eye, Heart, MessageSquare, Clock } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { formatDistanceToNow } from "date-fns"

export default function RecentlyUploaded() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { posts, projects } = useApp()
  const [recentItems, setRecentItems] = useState<any[]>([])

  useEffect(() => {
    setIsLoaded(true)

    // Combine posts and projects, sort by date, and take the most recent 3
    const combinedItems = [
      ...posts.map((post) => ({
        ...post,
        type: "post",
        category: post.category?.[0] || "Blog Post",
        timeAgo: formatDistanceToNow(new Date(post.created_at || Date.now()), { addSuffix: true }),
      })),
      ...projects.map((project) => ({
        ...project,
        type: "project",
        category: project.category?.[0] || "Project",
        timeAgo: formatDistanceToNow(new Date(project.created_at || Date.now()), { addSuffix: true }),
      })),
    ]

    // Sort by created_at (newest first) and take the first 3
    const sortedItems = combinedItems
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 3)

    setRecentItems(sortedItems)
  }, [posts, projects])

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Recently Uploaded</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Check out my latest projects and work that I've recently completed and shared with the community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentItems.length > 0
            ? recentItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="overflow-hidden h-full transition-all hover:shadow-md backdrop-blur-sm bg-background/80 border-primary/20">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={item.image_url || "/placeholder.svg?height=300&width=400"}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary/80 hover:bg-primary">{item.category}</Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> {item.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" /> {item.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" /> {item.comments || 0}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> {item.timeAgo}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            : // Skeleton loading state
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Card className="overflow-hidden h-full transition-all hover:shadow-md backdrop-blur-sm bg-background/80 border-primary/20">
                      <div className="relative aspect-video overflow-hidden bg-muted animate-pulse"></div>
                      <CardContent className="p-5">
                        <div className="h-6 bg-muted rounded-md w-3/4 mb-3 animate-pulse"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-4 bg-muted rounded-md w-16 animate-pulse"></div>
                            <div className="h-4 bg-muted rounded-md w-16 animate-pulse"></div>
                            <div className="h-4 bg-muted rounded-md w-16 animate-pulse"></div>
                          </div>
                          <div className="h-4 bg-muted rounded-md w-24 animate-pulse"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
        </div>
      </div>
    </section>
  )
}

