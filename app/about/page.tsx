"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useOffline } from "@/hooks/use-offline"
import OfflinePage from "@/components/offline-page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { GraduationCap, Briefcase, Heart, Coffee, Music, Book, Globe, Calendar, MapPin } from "lucide-react"

type Profile = {
  id: string
  full_name: string
  title: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  website: string | null
  apology: string | null
  interests: string[] | null
}

type Education = {
  id: string
  institution: string
  degree: string
  field_of_study: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  location: string | null
}

type Experience = {
  id: string
  company: string
  position: string
  start_date: string | null
  end_date: string | null
  current: boolean | null
  description: string | null
  location: string | null
}

type Skill = {
  id: string
  name: string
  category: string | null
  proficiency: number | null
}

export default function AboutPage() {
  const [imageClicks, setImageClicks] = useState(0)
  const isOffline = useOffline()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [education, setEducation] = useState<Education[]>([])
  const [experience, setExperience] = useState<Experience[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase.from("profiles_star").select("*").single()

        if (profileError) throw profileError
        setProfile(profileData)

        // Fetch education data
        const { data: educationData, error: educationError } = await supabase
          .from("education_star")
          .select("*")
          .eq("profile_id", profileData.id)
          .order("start_date", { ascending: false })

        if (educationError) throw educationError
        setEducation(educationData)

        // Fetch experience data
        const { data: experienceData, error: experienceError } = await supabase
          .from("experience_star")
          .select("*")
          .eq("profile_id", profileData.id)
          .order("start_date", { ascending: false })

        if (experienceError) throw experienceError
        setExperience(experienceData)

        // Fetch skills data
        const { data: skillsData, error: skillsError } = await supabase
          .from("skills_star")
          .select("*")
          .eq("profile_id", profileData.id)
          .order("proficiency", { ascending: false })

        if (skillsError) throw skillsError
        setSkills(skillsData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load profile data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleImageClick = () => {
    const newCount = imageClicks + 1
    setImageClicks(newCount)
  }

  // Default content as fallback
  const defaultProfile = {
    full_name: "JAMAL ASRAF",
    title: "Founder of Cubiz Group's of Technology",
    bio: "Hello! I'm Jamal Asraf, Founder of [CGT] Cubiz Group's of Technology. It is a startup community to all innovation around your environment. Also Technical Innovative IOT & Arduino Project in school sponsored by ATAL TINKERING TECHNOLOGY.",
    location: "Cheranmahadevi, Tirunelveli, TamilNadu",
    avatar_url:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhPBX8QsC1Sl5RLkWvjC6xsq2bL7a7PrZu1C1N0IMBeTWpQXZrQUb6VH0JSVvKD6b82vSF06j1-FeNbE78ipjx-iwieXzJLHD3hQOOf3POVKHjP_Jr5qMuMgFJF5SubICSgbyyo-bn-e7tNeuUkfMnUtdByY6fUc3j6TqUH_yvNsz6u3VQ/s1600/IMG_20250324_223115.jpg",
    apology: "I apologize for any inconvenience. I am constantly working to improve and provide better services.",
    interests: [
      "Technology Innovation",
      "Startup Ecosystem",
      "IoT",
      "AI/ML",
      "Reading",
      "Music",
      "Travel",
      "Photography",
    ],
  }

  if (isOffline) {
    return <OfflinePage />
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
        <section className="py-12 md:py-16 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">About Me</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Learn more about my background, skills, and the passion that drives my work. ✨
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="loading-animation">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-destructive">{error}</p>
              </div>
            ) : (
              <>
                {/* Profile Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  {/* Profile Image */}
                  <div className="md:col-span-1 flex flex-col items-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-64 h-64 rounded-full overflow-hidden mb-6"
                      onClick={handleImageClick}
                    >
                      {/* Animated border */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 via-blue-500 to-purple-500 rounded-full animate-border-rotate"></div>

                      {/* Image container */}
                      <div className="absolute inset-1 rounded-full overflow-hidden">
                        <Image
                          src={profile?.avatar_url || defaultProfile.avatar_url}
                          alt={profile?.full_name || defaultProfile.full_name}
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    </motion.div>

                    {/* Location */}
                    {(profile?.location || defaultProfile.location) && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{profile?.location || defaultProfile.location}</span>
                      </div>
                    )}

                    {/* Interests/Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {(profile?.interests || defaultProfile.interests)?.map((interest, index) => (
                        <Badge key={index} variant="outline" className="bg-primary/10 hover:bg-primary/20">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Bio and Info */}
                  <div className="md:col-span-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <h2 className="text-3xl font-bold mb-2">{profile?.full_name || defaultProfile.full_name}</h2>
                      <p className="text-primary text-xl mb-6">{profile?.title || defaultProfile.title}</p>

                      <div className="prose dark:prose-invert max-w-none mb-8">
                        <h3 className="text-xl font-semibold mb-3">Biography</h3>
                        <p className="text-muted-foreground">{profile?.bio || defaultProfile.bio}</p>
                      </div>

                      {/* Skills Section */}
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.length > 0
                            ? skills.map((skill) => (
                                <Badge key={skill.id} className="bg-primary/20 hover:bg-primary/30 text-foreground">
                                  {skill.name}
                                </Badge>
                              ))
                            : [
                                "JavaScript",
                                "React",
                                "Node.js",
                                "HTML/CSS",
                                "UI/UX Design",
                                "IoT Development",
                                "Arduino",
                                "Problem Solving",
                                "Project Management",
                              ].map((skill, index) => (
                                <Badge key={index} className="bg-primary/20 hover:bg-primary/30 text-foreground">
                                  {skill}
                                </Badge>
                              ))}
                        </div>
                      </div>

                      {/* Apology Section (if exists) */}
                      {(profile?.apology || defaultProfile.apology) && (
                        <div className="p-4 border border-primary/20 rounded-md bg-primary/5 mb-6">
                          <h3 className="text-lg font-medium mb-2">My Apology</h3>
                          <p className="text-muted-foreground">{profile?.apology || defaultProfile.apology}</p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Tabs for Education and Experience */}
                <div className="mt-16">
                  <Tabs defaultValue="education" className="w-full">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-background/50 backdrop-blur-sm">
                      <TabsTrigger
                        value="education"
                        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <GraduationCap className="h-4 w-4" /> Education
                      </TabsTrigger>
                      <TabsTrigger
                        value="experience"
                        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <Briefcase className="h-4 w-4" /> Experience
                      </TabsTrigger>
                      <TabsTrigger
                        value="interests"
                        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        <Heart className="h-4 w-4" /> Interests
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="education" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {education.length > 0
                          ? education.map((edu) => (
                              <motion.div
                                key={edu.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                              >
                                <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all">
                                  <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-start gap-4 mb-4">
                                      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 rounded-full">
                                        <GraduationCap className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <h3 className="text-xl font-bold">{edu.institution}</h3>
                                        <p className="text-primary font-medium">{edu.degree}</p>
                                        {edu.field_of_study && (
                                          <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {edu.start_date ? new Date(edu.start_date).getFullYear() : ""} -{" "}
                                        {edu.end_date ? new Date(edu.end_date).getFullYear() : "Present"}
                                      </span>
                                    </div>
                                    {edu.location && (
                                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{edu.location}</span>
                                      </div>
                                    )}
                                    <p className="text-muted-foreground">{edu.description}</p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))
                          : // Fallback education data
                            [
                              {
                                id: "1",
                                institution: "Higher Secondary School",
                                degree: "Computer Science",
                                field_of_study: "Computer Science",
                                start_date: "2018-01-01",
                                end_date: "2020-01-01",
                                description:
                                  "Completed higher secondary education with a focus on computer science and mathematics.",
                                location: "Tirunelveli, India",
                              },
                              {
                                id: "2",
                                institution: "ATAL Tinkering Lab",
                                degree: "Technical Training",
                                field_of_study: "IoT and Arduino",
                                start_date: "2019-01-01",
                                end_date: "2019-12-31",
                                description:
                                  "Participated in technical training programs focused on IoT and Arduino projects.",
                                location: "Tirunelveli, India",
                              },
                              {
                                id: "3",
                                institution: "Online Courses",
                                degree: "Web Development & Programming",
                                field_of_study: "Full Stack Development",
                                start_date: "2020-01-01",
                                end_date: null,
                                description:
                                  "Continuously learning through online platforms like Coursera, Udemy, and freeCodeCamp.",
                                location: "Online",
                              },
                            ].map((edu) => (
                              <motion.div
                                key={edu.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                              >
                                <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all">
                                  <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-start gap-4 mb-4">
                                      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 rounded-full">
                                        <GraduationCap className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <h3 className="text-xl font-bold">{edu.institution}</h3>
                                        <p className="text-primary font-medium">{edu.degree}</p>
                                        {edu.field_of_study && (
                                          <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {edu.start_date ? new Date(edu.start_date).getFullYear() : ""} -{" "}
                                        {edu.end_date ? new Date(edu.end_date).getFullYear() : "Present"}
                                      </span>
                                    </div>
                                    {edu.location && (
                                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{edu.location}</span>
                                      </div>
                                    )}
                                    <p className="text-muted-foreground">{edu.description}</p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {experience.length > 0
                          ? experience.map((exp) => (
                              <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                              >
                                <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all">
                                  <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-start gap-4 mb-4">
                                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 rounded-full">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <h3 className="text-xl font-bold">{exp.company}</h3>
                                        <p className="text-primary font-medium">{exp.position}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {exp.start_date ? new Date(exp.start_date).getFullYear() : ""} -{" "}
                                        {exp.current
                                          ? "Present"
                                          : exp.end_date
                                            ? new Date(exp.end_date).getFullYear()
                                            : ""}
                                      </span>
                                    </div>
                                    {exp.location && (
                                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{exp.location}</span>
                                      </div>
                                    )}
                                    <p className="text-muted-foreground">{exp.description}</p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))
                          : // Fallback experience data
                            [
                              {
                                id: "1",
                                company: "Cubiz Group's of Technology",
                                position: "Founder",
                                start_date: "2021-01-01",
                                end_date: null,
                                current: true,
                                description:
                                  "Leading a startup community focused on innovation and technology solutions.",
                                location: "Tirunelveli, India",
                              },
                              {
                                id: "2",
                                company: "Freelance",
                                position: "Web Developer",
                                start_date: "2020-01-01",
                                end_date: "2021-01-01",
                                current: false,
                                description:
                                  "Worked on various web development projects for clients across different industries.",
                                location: "Remote",
                              },
                              {
                                id: "3",
                                company: "School Tech Club",
                                position: "Project Lead",
                                start_date: "2019-01-01",
                                end_date: "2020-01-01",
                                current: false,
                                description:
                                  "Led a team of students in developing innovative IoT projects for school exhibitions.",
                                location: "Tirunelveli, India",
                              },
                            ].map((exp) => (
                              <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                              >
                                <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all">
                                  <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-start gap-4 mb-4">
                                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 rounded-full">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <h3 className="text-xl font-bold">{exp.company}</h3>
                                        <p className="text-primary font-medium">{exp.position}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {exp.start_date ? new Date(exp.start_date).getFullYear() : ""} -{" "}
                                        {exp.current
                                          ? "Present"
                                          : exp.end_date
                                            ? new Date(exp.end_date).getFullYear()
                                            : ""}
                                      </span>
                                    </div>
                                    {exp.location && (
                                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{exp.location}</span>
                                      </div>
                                    )}
                                    <p className="text-muted-foreground">{exp.description}</p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="interests" className="mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {(profile?.interests || defaultProfile.interests)?.map((interest, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.05 * index }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                          >
                            <Card className="h-full backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all">
                              <CardContent className="p-4 flex flex-col items-center text-center">
                                <div className="bg-gradient-to-br from-green-500/20 to-yellow-500/20 p-3 rounded-full mb-3">
                                  {index % 4 === 0 && <Globe className="h-5 w-5 text-primary" />}
                                  {index % 4 === 1 && <Book className="h-5 w-5 text-primary" />}
                                  {index % 4 === 2 && <Coffee className="h-5 w-5 text-primary" />}
                                  {index % 4 === 3 && <Music className="h-5 w-5 text-primary" />}
                                </div>
                                <h3 className="font-medium">{interest}</h3>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </motion.main>
  )
}

