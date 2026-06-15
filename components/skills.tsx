"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Sample data for skills
const skillCategories = [
  {
    id: "technical",
    name: "Technical Skills",
    skills: [
      { name: "JavaScript", level: 90 },
      { name: "React.js", level: 85 },
      { name: "Node.js", level: 80 },
      { name: "TypeScript", level: 75 },
      { name: "Next.js", level: 85 },
      { name: "HTML/CSS", level: 95 },
    ],
  },
  {
    id: "design",
    name: "Design Skills",
    skills: [
      { name: "UI Design", level: 85 },
      { name: "UX Research", level: 75 },
      { name: "Figma", level: 90 },
      { name: "Adobe XD", level: 80 },
      { name: "Responsive Design", level: 95 },
    ],
  },
  {
    id: "soft",
    name: "Soft Skills",
    skills: [
      { name: "Communication", level: 90 },
      { name: "Team Leadership", level: 85 },
      { name: "Problem Solving", level: 95 },
      { name: "Time Management", level: 80 },
      { name: "Adaptability", level: 90 },
    ],
  },
]

// Sample data for tasks/projects
const tasks = [
  {
    id: 1,
    title: "E-commerce Website Redesign",
    status: "Completed",
    completion: 100,
    tags: ["UI/UX", "React", "Node.js"],
  },
  {
    id: 2,
    title: "Mobile App Development",
    status: "In Progress",
    completion: 65,
    tags: ["React Native", "Firebase"],
  },
  {
    id: 3,
    title: "Dashboard Analytics Platform",
    status: "In Progress",
    completion: 40,
    tags: ["Next.js", "TypeScript", "D3.js"],
  },
  {
    id: 4,
    title: "API Integration & Documentation",
    status: "Planning",
    completion: 10,
    tags: ["REST API", "Swagger", "Node.js"],
  },
]

export default function Skills() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Skills & Tasks</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            An overview of my technical expertise and current projects I'm working on.
          </p>
        </motion.div>

        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="tasks">Current Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="skills">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {skillCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * categoryIndex }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-6">{category.name}</h3>
                      <div className="space-y-6">
                        {category.skills.map((skill) => (
                          <div key={skill.name} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{skill.name}</span>
                              <span className="text-muted-foreground">{skill.level}%</span>
                            </div>
                            <Progress value={skill.level} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task, taskIndex) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * taskIndex }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold">{task.title}</h3>
                        <Badge
                          className={
                            task.status === "Completed"
                              ? "bg-green-500 hover:bg-green-600"
                              : task.status === "In Progress"
                                ? "bg-amber-500 hover:bg-amber-600"
                                : "bg-blue-500 hover:bg-blue-600"
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Completion</span>
                          <span className="text-sm font-medium">{task.completion}%</span>
                        </div>
                        <Progress value={task.completion} className="h-2" />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

