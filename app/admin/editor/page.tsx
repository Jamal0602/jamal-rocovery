"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/admin/admin-provider"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Save, Code, Layout, Layers, PenTool, Eye, Undo, Redo, Plus, Trash } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminEditor() {
  const { isAuthenticated, content, updateContent } = useAdmin()
  const router = useRouter()
  const { toast } = useToast()

  const [activeSection, setActiveSection] = useState("hero")
  const [editorMode, setEditorMode] = useState<"visual" | "code">("visual")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [htmlCode, setHtmlCode] = useState("")
  const [cssCode, setCssCode] = useState("")

  // Visual editor state
  const [visualContent, setVisualContent] = useState({
    hero: {
      title: "JAMAL ASRAF",
      subtitle: "SINCE - 2008",
      description:
        "Welcome to my personal portfolio showcasing my skills, projects, and professional journey. Founder of Cubiz Group's of Technology.",
      image: "/placeholder.svg?height=400&width=400",
    },
    about: {
      name: "JAMAL ASRAF",
      title: "Full Stack Developer & UI/UX Designer",
      interests: "Web Development, UI/UX, AI",
      experience: "10+ Years",
      education: "Computer Science, MIT",
      awards: "Best Developer 2022",
      bio: [
        "Hello! I'm Jamal Asraf, a passionate Full Stack Developer and UI/UX Designer with over 10 years of experience in creating beautiful, functional, and user-centered digital experiences.",
        "Throughout my career, I've worked with a diverse range of clients from startups to large enterprises, helping them build products that not only look great but also solve real problems for their users.",
        "My approach combines technical expertise with creative thinking. I believe that the best digital products are those that find the perfect balance between user needs, business goals, and technical feasibility.",
        "When I'm not coding or designing, you can find me exploring new technologies, contributing to open-source projects, or sharing my knowledge through writing and speaking at industry events.",
      ],
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/auth")
    }

    // Load content
    if (content) {
      if (content.hero) {
        setVisualContent((prev) => ({ ...prev, hero: content.hero }))
      }
      if (content.about) {
        setVisualContent((prev) => ({ ...prev, about: content.about }))
      }
    }
  }, [isAuthenticated, router, content])

  const handleVisualChange = (section: string, field: string, value: any) => {
    setVisualContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleBioChange = (index: number, value: string) => {
    const newBio = [...visualContent.about.bio]
    newBio[index] = value

    setVisualContent((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        bio: newBio,
      },
    }))
  }

  const addBioParagraph = () => {
    setVisualContent((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        bio: [...prev.about.bio, "New paragraph"],
      },
    }))
  }

  const removeBioParagraph = (index: number) => {
    const newBio = [...visualContent.about.bio]
    newBio.splice(index, 1)

    setVisualContent((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        bio: newBio,
      },
    }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)

    try {
      if (editorMode === "visual") {
        // Save visual content
        updateContent("hero", visualContent.hero)
        updateContent("about", visualContent.about)
      } else {
        // Save code content
        // In a real app, this would parse and save the HTML/CSS
        console.log("Saving code:", { html: htmlCode, css: cssCode })
      }

      toast({
        title: "Content saved",
        description: "Your changes have been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving content",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Content Editor</h1>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Undo className="h-4 w-4 mr-1" /> Undo
            </Button>
            <Button variant="outline" size="sm">
              <Redo className="h-4 w-4 mr-1" /> Redo
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" /> Preview
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting} className="btn-hover">
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={activeSection === "hero" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("hero")}
                  >
                    <Layout className="h-4 w-4 mr-2" /> Hero Section
                  </Button>
                  <Button
                    variant={activeSection === "about" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("about")}
                  >
                    <Layers className="h-4 w-4 mr-2" /> About Section
                  </Button>
                  <Button
                    variant={activeSection === "skills" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("skills")}
                  >
                    <PenTool className="h-4 w-4 mr-2" /> Skills Section
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Editor Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant={editorMode === "visual" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setEditorMode("visual")}
                  >
                    <Layout className="h-4 w-4 mr-2" /> Visual Editor
                  </Button>
                  <Button
                    variant={editorMode === "code" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setEditorMode("code")}
                  >
                    <Code className="h-4 w-4 mr-2" /> Code Editor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeSection === "hero" && "Hero Section"}
                  {activeSection === "about" && "About Section"}
                  {activeSection === "skills" && "Skills Section"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editorMode === "visual" ? (
                  <>
                    {/* Visual Editor */}
                    {activeSection === "hero" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="hero-title">Title</Label>
                          <Input
                            id="hero-title"
                            value={visualContent.hero.title}
                            onChange={(e) => handleVisualChange("hero", "title", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hero-subtitle">Subtitle</Label>
                          <Input
                            id="hero-subtitle"
                            value={visualContent.hero.subtitle}
                            onChange={(e) => handleVisualChange("hero", "subtitle", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hero-description">Description</Label>
                          <Textarea
                            id="hero-description"
                            value={visualContent.hero.description}
                            onChange={(e) => handleVisualChange("hero", "description", e.target.value)}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hero-image">Image URL</Label>
                          <Input
                            id="hero-image"
                            value={visualContent.hero.image}
                            onChange={(e) => handleVisualChange("hero", "image", e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {activeSection === "about" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="about-name">Name</Label>
                          <Input
                            id="about-name"
                            value={visualContent.about.name}
                            onChange={(e) => handleVisualChange("about", "name", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="about-title">Title</Label>
                          <Input
                            id="about-title"
                            value={visualContent.about.title}
                            onChange={(e) => handleVisualChange("about", "title", e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="about-interests">Interests</Label>
                            <Input
                              id="about-interests"
                              value={visualContent.about.interests}
                              onChange={(e) => handleVisualChange("about", "interests", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="about-experience">Experience</Label>
                            <Input
                              id="about-experience"
                              value={visualContent.about.experience}
                              onChange={(e) => handleVisualChange("about", "experience", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="about-education">Education</Label>
                            <Input
                              id="about-education"
                              value={visualContent.about.education}
                              onChange={(e) => handleVisualChange("about", "education", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="about-awards">Awards</Label>
                            <Input
                              id="about-awards"
                              value={visualContent.about.awards}
                              onChange={(e) => handleVisualChange("about", "awards", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Bio Paragraphs</Label>
                            <Button variant="outline" size="sm" onClick={addBioParagraph}>
                              <Plus className="h-4 w-4 mr-1" /> Add Paragraph
                            </Button>
                          </div>

                          {visualContent.about.bio.map((paragraph, index) => (
                            <div key={index} className="flex gap-2">
                              <Textarea
                                value={paragraph}
                                onChange={(e) => handleBioChange(index, e.target.value)}
                                rows={3}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeBioParagraph(index)}
                                className="h-10 w-10 shrink-0"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSection === "skills" && (
                      <div className="flex items-center justify-center h-40 border rounded-md">
                        <p className="text-muted-foreground">Skills section editor coming soon</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Code Editor */}
                    <Tabs defaultValue="html">
                      <TabsList className="mb-4">
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="css">CSS</TabsTrigger>
                      </TabsList>

                      <TabsContent value="html">
                        <Textarea
                          value={htmlCode}
                          onChange={(e) => setHtmlCode(e.target.value)}
                          rows={20}
                          className="font-mono"
                          placeholder="Enter HTML code here..."
                        />
                      </TabsContent>

                      <TabsContent value="css">
                        <Textarea
                          value={cssCode}
                          onChange={(e) => setCssCode(e.target.value)}
                          rows={20}
                          className="font-mono"
                          placeholder="Enter CSS code here..."
                        />
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

