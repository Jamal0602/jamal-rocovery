"use client"

import type React from "react"

import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useOffline } from "@/hooks/use-offline"
import OfflinePage from "@/components/offline-page"
import { Users, Briefcase, Rocket, MessageSquare, CheckCircle, Clock, Calendar, Send } from "lucide-react"

export default function CollabPage() {
  const { toast } = useToast()
  const isOffline = useOffline()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Collaboration request sent!",
        description: "Thank you for your interest. I'll get back to you soon to discuss the project.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        projectType: "",
        budget: "",
        timeline: "",
        description: "",
      })
    } catch (error) {
      toast({
        title: "Error sending request",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
        <section className="py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Collaborate With Me</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Let's work together to bring your ideas to life. As the founder of Cubiz Group's of Technology, I bring
                expertise and innovation to every project.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Team Collaboration</h3>
                    <p className="text-muted-foreground flex-1">
                      Join forces with Cubiz Group's team of experts to tackle complex projects and deliver exceptional
                      results.
                    </p>
                    <div className="mt-4">
                      <Badge variant="outline">Agile Methodology</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Business Solutions</h3>
                    <p className="text-muted-foreground flex-1">
                      Custom digital solutions tailored to your business needs, from web applications to enterprise
                      systems.
                    </p>
                    <div className="mt-4">
                      <Badge variant="outline">ROI Focused</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Startup Acceleration</h3>
                    <p className="text-muted-foreground flex-1">
                      Leverage my experience as a founder to accelerate your startup's growth with technical expertise
                      and strategic guidance.
                    </p>
                    <div className="mt-4">
                      <Badge variant="outline">Growth Oriented</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Tabs defaultValue="services" className="w-full mb-12">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="process">Process</TabsTrigger>
              </TabsList>

              <TabsContent value="services">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Web Development</h3>
                      <p className="text-muted-foreground mb-4">
                        Custom websites and web applications built with modern technologies and best practices.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Responsive Design</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Performance Optimization</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>SEO Best Practices</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Accessibility Compliance</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Mobile App Development</h3>
                      <p className="text-muted-foreground mb-4">
                        Cross-platform and native mobile applications for iOS and Android.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>User-Centered Design</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Offline Capabilities</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Push Notifications</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>App Store Optimization</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">UI/UX Design</h3>
                      <p className="text-muted-foreground mb-4">
                        User-centered design that enhances user experience and drives engagement.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>User Research</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Wireframing & Prototyping</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Usability Testing</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Design Systems</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">E-commerce Solutions</h3>
                      <p className="text-muted-foreground mb-4">
                        Custom online stores and marketplace platforms that drive sales.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Payment Integration</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Inventory Management</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Customer Analytics</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Marketing Tools</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Enterprise Solutions</h3>
                      <p className="text-muted-foreground mb-4">
                        Scalable applications and systems for large organizations.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Custom CRM/ERP</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Data Analytics</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Process Automation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Legacy System Integration</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">Technical Consultation</h3>
                      <p className="text-muted-foreground mb-4">
                        Expert advice on technology strategy and implementation.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Technology Assessment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Architecture Planning</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Security Audits</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Digital Transformation</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="process">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-3">1. Discovery</h3>
                      <p className="text-muted-foreground">
                        We start with a detailed discussion to understand your goals, requirements, and vision for the
                        project.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-3">2. Planning</h3>
                      <p className="text-muted-foreground">
                        We create a detailed project plan with timelines, milestones, and deliverables based on your
                        requirements.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <Rocket className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-3">3. Execution</h3>
                      <p className="text-muted-foreground">
                        Our team works diligently to develop your solution, with regular updates and opportunities for
                        feedback.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-3">4. Delivery & Support</h3>
                      <p className="text-muted-foreground">
                        We deliver the final product and provide ongoing support to ensure everything runs smoothly.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="max-w-3xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-center">Start a Collaboration</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Your Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Your Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium">
                          Company Name
                        </label>
                        <Input
                          id="company"
                          name="company"
                          placeholder="Your Company"
                          value={formData.company}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="projectType" className="text-sm font-medium">
                          Project Type
                        </label>
                        <select
                          id="projectType"
                          name="projectType"
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={formData.projectType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Project Type</option>
                          <option value="Web Development">Web Development</option>
                          <option value="Mobile App">Mobile App</option>
                          <option value="UI/UX Design">UI/UX Design</option>
                          <option value="E-commerce">E-commerce</option>
                          <option value="Enterprise Solution">Enterprise Solution</option>
                          <option value="Consultation">Consultation</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="budget" className="text-sm font-medium">
                          Budget Range
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={formData.budget}
                          onChange={handleChange}
                        >
                          <option value="">Select Budget Range</option>
                          <option value="Less than $5,000">Less than $5,000</option>
                          <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                          <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                          <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                          <option value="$50,000+">$50,000+</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="timeline" className="text-sm font-medium">
                          Expected Timeline
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="timeline"
                            name="timeline"
                            placeholder="e.g., 2-3 months"
                            className="pl-10"
                            value={formData.timeline}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Project Description
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Tell us about your project and what you're looking to achieve..."
                        rows={6}
                        value={formData.description}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full btn-pulse btn-hover" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>Sending Request...</>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" /> Submit Collaboration Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </motion.main>
  )
}

