"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Github } from "lucide-react"
import ContentPopup from "@/components/content-popup"
import { supabase } from "@/lib/supabase"
import { subscribeToTable } from "@/lib/realtime"

export default function Projects() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [projectCategories, setProjectCategories] = useState([{ id: "all", name: "All Projects" }])
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoaded(true)
    fetchProjects()

    // Set up real-time subscription
    const channel = subscribeToTable("projects_star", fetchProjects)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    // Extract unique categories from projects
    const categories = new Set<string>()
    projects.forEach((project) => {
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach((tech: string) => categories.add(tech))
      }
    })

    // Create category objects
    const categoryObjects = [
      { id: "all", name: "All Projects" },
      ...Array.from(categories).map((cat) => ({ id: cat.toLowerCase(), name: cat })),
    ]

    setProjectCategories(categoryObjects)

    // Filter projects based on active category
    filterProjects(activeCategory, projects)
  }, [activeCategory, projects])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("projects_star").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProjects = (category: string, projectsList: any[]) => {
    if (category === "all") {
      setFilteredProjects(projectsList)
    } else {
      setFilteredProjects(
        projectsList.filter(
          (project) =>
            project.technologies &&
            Array.isArray(project.technologies) &&
            project.technologies.some((tech: string) => tech.toLowerCase() === category.toLowerCase()),
        ),
      )
    }
  }

  const handleTagClick = (tag: string) => {
    // Find the category that matches the tag
    const category = projectCategories.find((cat) => cat.name.toLowerCase() === tag.toLowerCase())
    if (category) {
      setActiveCategory(category.id)
    }
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Projects ✨</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore my portfolio of projects spanning web development, mobile applications, and UI/UX design.
          </p>
        </motion.div>

        <Tabs defaultValue="all" className="w-full mb-10" onValueChange={setActiveCategory}>
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent">
            {projectCategories.slice(0, 8).map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category.name}
              </TabsTrigger>
            ))}
            {projectCategories.length > 8 && (
              <TabsTrigger
                value="more"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                More...
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Skeleton loading state
            Array(6)
              .fill(0)
              .map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * (index % 3) }}
                >
                  <Card className="overflow-hidden h-full flex flex-col backdrop-blur-sm bg-background/80 border-primary/20">
                    <div className="relative aspect-video overflow-hidden bg-muted animate-pulse"></div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="h-6 bg-muted rounded-md w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded-md w-full mb-2 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded-md w-full mb-4 animate-pulse"></div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="h-6 bg-muted rounded-md w-16 animate-pulse"></div>
                        <div className="h-6 bg-muted rounded-md w-16 animate-pulse"></div>
                        <div className="h-6 bg-muted rounded-md w-16 animate-pulse"></div>
                      </div>
                      <div className="flex gap-3 mt-auto">
                        <div className="h-9 bg-muted rounded-md w-24 animate-pulse"></div>
                        <div className="h-9 bg-muted rounded-md w-24 animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * (index % 3) }}
              >
                <ContentPopup type="project" item={project} onTagClick={handleTagClick}>
                  <Card className="overflow-hidden h-full flex flex-col backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 cursor-pointer hover:shadow-primary/20 transition-all">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={project.image_url || "/placeholder.svg?height=300&width=500"}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                      {project.featured && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500">Featured</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-muted-foreground mb-4 flex-1 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies &&
                          project.technologies.slice(0, 3).map((tech: string) => (
                            <Badge key={tech} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        {project.technologies && project.technologies.length > 3 && (
                          <Badge variant="outline">+{project.technologies.length - 3}</Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-auto">
                        <div className="flex gap-3">
                          {project.github_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Github className="h-4 w-4 mr-2" /> Code
                              </a>
                            </Button>
                          )}
                          {project.demo_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={project.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" /> Demo
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ContentPopup>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No projects found matching the selected category.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

