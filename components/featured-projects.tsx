"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Github, ExternalLink, ArrowRight, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { subscribeToTable } from "@/lib/realtime"
import Link from "next/link"
import AdvancedPopup from "@/components/advanced-popup"
import { useToast } from "@/hooks/use-toast"

interface Project {
  id: string
  title: string
  description: string
  image_url: string | null
  technologies: string[] | null
  github_url: string | null
  demo_url: string | null
  featured: boolean | null
  likes: number
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [likedProjects, setLikedProjects] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
    loadLikedProjects()

    // Set up real-time subscription
    const channel = subscribeToTable("projects_star", fetchProjects)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("projects_star")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Add likes field if it doesn't exist
      const projectsWithLikes = (data || []).map((project) => ({
        ...project,
        likes: project.likes || Math.floor(Math.random() * 50) + 5,
      }))

      setProjects(projectsWithLikes)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadLikedProjects = () => {
    try {
      const storedLikedProjects = localStorage.getItem("likedProjects")
      if (storedLikedProjects) {
        setLikedProjects(JSON.parse(storedLikedProjects))
      }
    } catch (error) {
      console.error("Error loading liked projects:", error)
    }
  }

  const handleLike = async (projectId: string, currentLikes: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the popup when clicking like button

    try {
      const isLiked = likedProjects.includes(projectId)
      let newLikedProjects = [...likedProjects]
      let newLikesCount = currentLikes

      if (isLiked) {
        // Unlike
        newLikedProjects = newLikedProjects.filter((id) => id !== projectId)
        newLikesCount -= 1
      } else {
        // Like
        newLikedProjects.push(projectId)
        newLikesCount += 1
        toast({
          title: "Project liked!",
          description: "This project has been added to your liked projects.",
        })
      }

      // Update local storage
      localStorage.setItem("likedProjects", JSON.stringify(newLikedProjects))
      setLikedProjects(newLikedProjects)

      // Update projects state
      setProjects((prevProjects) =>
        prevProjects.map((project) => (project.id === projectId ? { ...project, likes: newLikesCount } : project)),
      )

      // Update database
      const { error } = await supabase.from("projects_star").update({ likes: newLikesCount }).eq("id", projectId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  const handleOpenPopup = (project: Project) => {
    setSelectedProject(project)
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
    <section className="py-16 bg-gradient-to-b from-background/80 to-background">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Featured Projects</h2>
            <p className="text-muted-foreground max-w-2xl">
              A selection of my recent work, personal projects, and open-source contributions.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button variant="outline" className="mt-4 md:mt-0" asChild>
              <Link href="">
                View All Projects <ArrowRight className="ml-2 h-4 w-4" />
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
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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
            {projects.map((project) => (
              <motion.div key={project.id} variants={item}>
                <Card
                  className="overflow-hidden h-full flex flex-col backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
                  onClick={() => handleOpenPopup(project)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={project.image_url || "/placeholder.svg?height=300&width=600"}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-muted-foreground mb-4 flex-1">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies &&
                        project.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="bg-primary/10">
                            {tech}
                          </Badge>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={(e) => handleLike(project.id, project.likes, e)}
                      >
                        <Heart
                          className={`h-4 w-4 ${likedProjects.includes(project.id) ? "fill-red-500 text-red-500" : ""}`}
                        />
                        <span>{project.likes}</span>
                      </Button>
                      <div className="flex gap-3">
                        {project.github_url && (
                          <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-2" /> GitHub
                            </a>
                          </Button>
                        )}
                        {project.demo_url && (
                          <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                            <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" /> Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {selectedProject && (
        <AdvancedPopup isOpen={isPopupOpen} onClose={handleClosePopup} item={selectedProject} type="project" />
      )}
    </section>
  )
}

