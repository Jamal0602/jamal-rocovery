"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { subscribeToTable } from "@/lib/realtime"

interface Skill {
  id: string
  name: string
  category: string | null
  proficiency: number | null
}

interface SkillsShowcaseProps {
  skills?: Skill[]
}

export default function SkillsShowcase({ skills: initialSkills }: SkillsShowcaseProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills || [])
  const [isLoading, setIsLoading] = useState(!initialSkills)

  useEffect(() => {
    if (!initialSkills) {
      fetchSkills()
    }

    // Set up real-time subscription
    const channel = subscribeToTable("skills_star", fetchSkills)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initialSkills])

  const fetchSkills = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("skills_star")
        .select("*")
        .order("proficiency", { ascending: false })
        .limit(9)

      if (error) throw error
      setSkills(data || [])
    } catch (error) {
      console.error("Error fetching skills:", error)
    } finally {
      setIsLoading(false)
    }
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

  const getCategoryColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case "frontend":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "backend":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      case "design":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400"
      case "programming":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      case "hardware":
        return "bg-red-500/10 text-red-600 dark:text-red-400"
      case "soft skills":
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400"
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-background/80">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Skills & Expertise</h2>
            <p className="text-muted-foreground max-w-2xl">
              A selection of my technical skills, tools, and areas of expertise.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button variant="outline" className="mt-4 md:mt-0" asChild>
              <Link href="/skills">
                View All Skills <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array(9)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="animate-pulse backdrop-blur-sm bg-background/80 border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="h-6 bg-muted rounded-md w-3/4"></div>
                    <div className="h-4 bg-muted rounded-md w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {skills.map((skill) => (
              <motion.div key={skill.id} variants={item}>
                <Card className="backdrop-blur-sm bg-background/80 border-primary/20 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <h3 className="font-medium">{skill.name}</h3>
                      <div className="mt-2">
                        <Badge className={`${getCategoryColor(skill.category)}`}>{skill.category || "Other"}</Badge>
                      </div>
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

