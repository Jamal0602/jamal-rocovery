"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/contexts/app-context"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, FileText, Eye, X } from "lucide-react"

interface AdminContentProps {
  defaultContent: any
  imageClicks: number
  setImageClicks: (count: number) => void
}

export function AdminContent({ defaultContent, imageClicks, setImageClicks }: AdminContentProps) {
  const [content, setContent] = useState(defaultContent)
  const [isLoaded, setIsLoaded] = useState(false)
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=400&width=400")
  const [idCardUrl, setIdCardUrl] = useState("")
  const [cvUrl, setCvUrl] = useState("")
  const [isIdCardDialogOpen, setIsIdCardDialogOpen] = useState(false)
  const { settings } = useApp()

  useEffect(() => {
    setIsLoaded(true)

    // Load profile image
    const loadProfileImage = async () => {
      try {
        const { data, error } = await supabase
          .from("images")
          .select("*")
          .eq("category", "profile")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error loading profile image:", error)
          return
        }

        if (data) {
          setProfileImage(data.url)
        }
      } catch (error) {
        console.error("Error loading profile image:", error)
      }
    }

    loadProfileImage()

    // Load ID card and CV URLs from settings
    if (settings.documents) {
      setIdCardUrl(settings.documents.idUrl || "")
      setCvUrl(settings.documents.cvUrl || "")
    }
  }, [settings])

  const handleImageClick = () => {
    setImageClicks(imageClicks + 1)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isLoaded ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="md:col-span-1"
      >
        <div className="flex flex-col items-center md:items-start gap-6">
          <div className="relative w-64 h-64 overflow-hidden">
            <Image
              src={profileImage || "/placeholder.svg"}
              alt={content.name}
              fill
              className="object-cover rounded-full border-4 border-primary/20 hover:border-primary/50 transition-all cursor-pointer"
              onClick={handleImageClick}
              priority
            />
          </div>

          <div className="space-y-4 w-full">
            <div className="space-y-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{content.name}</h1>
              <p className="text-muted-foreground">{content.title}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge variant="outline" className="bg-primary/5">
                {content.interests.split(",")[0]}
              </Badge>
              <Badge variant="outline" className="bg-primary/5">
                {content.interests.split(",")[1]}
              </Badge>
              <Badge variant="outline" className="bg-primary/5">
                {content.interests.split(",")[2]}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Experience</p>
                <p className="text-sm text-muted-foreground">{content.experience}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Education</p>
                <p className="text-sm text-muted-foreground">{content.education}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Awards</p>
                <p className="text-sm text-muted-foreground">{content.awards}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              {idCardUrl && (
                <Dialog open={isIdCardDialogOpen} onOpenChange={setIsIdCardDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" /> View ID Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>ID Card</DialogTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsIdCardDialogOpen(false)}
                        className="absolute right-4 top-4"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogHeader>
                    <div className="relative w-full h-[400px]">
                      <Image src={idCardUrl || "/placeholder.svg"} alt="ID Card" fill className="object-contain" />
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {cvUrl && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                    {cvUrl.endsWith(".pdf") ? (
                      <>
                        <FileText className="h-4 w-4 mr-2" /> View CV
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" /> Download CV
                      </>
                    )}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isLoaded ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="md:col-span-2"
      >
        <Tabs defaultValue="bio" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bio">Biography</TabsTrigger>
            <TabsTrigger value="approach">Approach</TabsTrigger>
          </TabsList>
          <TabsContent value="bio" className="mt-6">
            <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">About Me</h2>
                  {content.bio.map((paragraph: string, index: number) => (
                    <p key={index} className="text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="approach" className="mt-6">
            <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">My Approach</h2>
                  {content.approach.slice(0, 2).map((paragraph: string, index: number) => (
                    <p key={index} className="text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                  <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                    {content.approach[2].slice(0, 6).map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-bold mb-2">Quotes</h3>
                    <ul className="space-y-2 italic">
                      {content.approach[2].slice(8).map((quote: string, index: number) => (
                        <li key={index} className="text-muted-foreground">
                          "{quote.substring(3)}"
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

export default AdminContent

