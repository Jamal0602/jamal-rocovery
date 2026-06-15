"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useOffline } from "@/hooks/use-offline"
import OfflinePage from "@/components/offline-page"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Sparkles, Brain, Code, Palette, Wrench, Zap, Star } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { subscribeToTable } from "@/lib/realtime"

interface Skill {
  id: string
  name: string
  category: string | null
  proficiency: number | null
}

interface Task {
  id: string
  title: string
  description: string
  status: string | null
  completion: number | null
  tags: string[] | null
  timeline: string | null
  client: string | null
}

export default function SkillsPage() {
  const isOffline = useOffline()
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [skills, setSkills] = useState<Record<string, Skill[]>>({
    frontend: [],
    backend: [],
    design: [],
    other: [],
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingSkills, setIsLoadingSkills] = useState(true)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)

  useEffect(() => {
    setIsLoaded(true)
    fetchSkills()
    fetchTasks()

    // Set up real-time subscriptions
    const skillsChannel = subscribeToTable("skills_star", fetchSkills)
    const tasksChannel = subscribeToTable("tasks_star", fetchTasks)

    return () => {
      supabase.removeChannel(skillsChannel)
      supabase.removeChannel(tasksChannel)
    }
  }, [])

  const fetchSkills = async () => {
    try {
      setIsLoadingSkills(true)
      const { data, error } = await supabase.from("skills_star").select("*").order("proficiency", { ascending: false })

      if (error) throw error

      // Group skills by category
      const groupedSkills: Record<string, Skill[]> = {
        frontend: [],
        backend: [],
        design: [],
        other: [],
      }

      data?.forEach((skill) => {
        const category = skill.category?.toLowerCase() || "other"
        if (groupedSkills[category]) {
          groupedSkills[category].push(skill)
        } else {
          groupedSkills.other.push(skill)
        }
      })

      setSkills(groupedSkills)
    } catch (error) {
      console.error("Error fetching skills:", error)
    } finally {
      setIsLoadingSkills(false)
    }
  }

  const fetchTasks = async () => {
    try {
      setIsLoadingTasks(true)
      const { data, error } = await supabase.from("tasks_star").select("*").order("completion", { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  if (isOffline) {
    return <OfflinePage />
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

  const getSkillIcon = (category: string) => {
    switch (category) {
      case "frontend":
        return <Code className="h-5 w-5" />
      case "backend":
        return <Brain className="h-5 w-5" />
      case "design":
        return <Palette className="h-5 w-5" />
      case "other":
        return <Wrench className="h-5 w-5" />
      default:
        return <Sparkles className="h-5 w-5" />
    }
  }

  const getSkillColor = (level: number) => {
    if (level >= 90) return "from-green-500 to-green-600"
    if (level >= 80) return "from-blue-500 to-blue-600"
    if (level >= 70) return "from-yellow-500 to-yellow-600"
    return "from-orange-500 to-orange-600"
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
        <section className="py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Skills & Tasks</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A comprehensive overview of my technical expertise, professional skills, and current projects I'm
                working on. <span className="hidden md:inline">Explore what I can bring to your next project!</span> ✨
              </p>
            </motion.div>

            <Tabs defaultValue="skills" className="w-full mb-12">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="skills" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Skills
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <Star className="h-4 w-4" /> Current Tasks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skills">
                <Tabs defaultValue="frontend" className="w-full">
                  <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-8">
                    <TabsTrigger value="frontend" className="flex items-center gap-1">
                      <Code className="h-3.5 w-3.5" /> Frontend
                    </TabsTrigger>
                    <TabsTrigger value="backend" className="flex items-center gap-1">
                      <Brain className="h-3.5 w-3.5" /> Backend
                    </TabsTrigger>
                    <TabsTrigger value="design" className="flex items-center gap-1">
                      <Palette className="h-3.5 w-3.5" /> Design
                    </TabsTrigger>
                    <TabsTrigger value="other" className="flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5" /> Other
                    </TabsTrigger>
                  </TabsList>

                  {isLoadingSkills ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array(6)
                        .fill(0)
                        .map((_, index) => (
                          <Card
                            key={index}
                            className="animate-pulse backdrop-blur-sm bg-background/80 border-primary/20"
                          >
                            <CardContent className="p-6 space-y-4">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 bg-muted rounded-md"></div>
                                  <div className="h-4 bg-muted rounded-md w-24"></div>
                                </div>
                                <div className="h-4 bg-muted rounded-md w-12"></div>
                              </div>
                              <div className="h-2 bg-muted rounded-md w-full"></div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    ["frontend", "backend", "design", "other"].map((category) => (
                      <TabsContent key={category} value={category}>
                        <motion.div
                          className={`grid grid-cols-1 ${isMobile ? "sm:grid-cols-1" : "sm:grid-cols-2 md:grid-cols-2"} gap-6`}
                          variants={container}
                          initial="hidden"
                          animate="show"
                        >
                          {skills[category]?.map((skill) => (
                            <motion.div key={skill.id} variants={item}>
                              <Card className="overflow-hidden hover:shadow-md transition-shadow border-primary/10">
                                <CardContent className="p-6">
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <span className="bg-primary/10 p-1.5 rounded-md text-primary">
                                          {getSkillIcon(category)}
                                        </span>
                                        <span className="font-medium">{skill.name}</span>
                                      </div>
                                      <span className="text-muted-foreground font-medium">{skill.proficiency}%</span>
                                    </div>
                                    <Progress
                                      value={skill.proficiency || 0}
                                      className="h-2"
                                      indicatorClassName={`bg-gradient-to-r ${getSkillColor(skill.proficiency || 0)}`}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </motion.div>
                      </TabsContent>
                    ))
                  )}
                </Tabs>
              </TabsContent>

              <TabsContent value="tasks">
                {isLoadingTasks ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array(4)
                      .fill(0)
                      .map((_, index) => (
                        <Card key={index} className="animate-pulse backdrop-blur-sm bg-background/80 border-primary/20">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="h-6 bg-muted rounded-md w-3/4"></div>
                              <div className="h-6 bg-muted rounded-md w-20"></div>
                            </div>
                            <div className="h-4 bg-muted rounded-md w-full"></div>
                            <div className="h-4 bg-muted rounded-md w-full"></div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <div className="h-4 bg-muted rounded-md w-24"></div>
                                <div className="h-4 bg-muted rounded-md w-12"></div>
                              </div>
                              <div className="h-2 bg-muted rounded-md w-full"></div>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-6 bg-muted rounded-md w-20"></div>
                              <div className="h-6 bg-muted rounded-md w-20"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <motion.div
                    className={`grid grid-cols-1 ${isMobile ? "sm:grid-cols-1" : "sm:grid-cols-2 md:grid-cols-2"} gap-8`}
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {tasks.map((task) => (
                      <motion.div key={task.id} variants={item}>
                        <Card className="overflow-hidden h-full border-primary/10 hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-xl font-semibold">{task.title}</h3>
                              <Badge
                                className={
                                  task.status === "Completed"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : task.status === "In Progress"
                                      ? "bg-amber-500 hover:bg-amber-600"
                                      : task.status === "Planning"
                                        ? "bg-blue-500 hover:bg-blue-600"
                                        : "bg-slate-500 hover:bg-slate-600"
                                }
                              >
                                {task.status} {task.status === "Completed" ? "✓" : ""}
                              </Badge>
                            </div>

                            <p className="text-muted-foreground mb-4">{task.description}</p>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Completion</span>
                                <span className="text-sm font-medium">{task.completion}%</span>
                              </div>
                              <Progress
                                value={task.completion || 0}
                                className="h-2"
                                indicatorClassName={
                                  task.completion === 100
                                    ? "bg-green-500"
                                    : task.completion && task.completion > 50
                                      ? "bg-amber-500"
                                      : "bg-blue-500"
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium">Timeline</p>
                                <p className="text-sm text-muted-foreground">{task.timeline}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Client</p>
                                <p className="text-sm text-muted-foreground">{task.client}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                              {task.tags &&
                                task.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="bg-primary/5">
                                    {tag}
                                  </Badge>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
      <Footer />
    </motion.main>
  )
}

