"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import {
  Plus,
  Trash2,
  RefreshCw,
  Upload,
  LinkIcon,
  Copy,
  ImageIcon,
  Grid2X2,
  LayoutList,
  Search,
  Filter,
} from "lucide-react"
import { uploadFile } from "@/lib/file-upload"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminAlbum() {
  const { isAuthenticated } = useApp()
  const router = useRouter()
  const { toast } = useToast()

  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [imageUrl, setImageUrl] = useState("")
  const [imageTitle, setImageTitle] = useState("")
  const [imageCategory, setImageCategory] = useState("general")

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setIsUploading(true)

      try {
        for (const file of acceptedFiles) {
          // Check if file is an image
          if (!file.type.startsWith("image/")) {
            toast({
              title: "Invalid file type",
              description: `${file.name} is not an image file.`,
              variant: "destructive",
            })
            continue
          }

          // Upload the file
          const result = await uploadFile(file, "portfolio", "album")

          if (result) {
            // Add to database
            const { error } = await supabase.from("images").insert([
              {
                title: file.name.split(".")[0],
                url: result.url,
                category: "uploads",
                created_at: new Date().toISOString(),
              },
            ])

            if (error) throw error

            toast({
              title: "Upload successful",
              description: `${file.name} has been uploaded.`,
            })
          }
        }

        // Refresh the image list
        fetchImages()
      } catch (error) {
        console.error("Error uploading files:", error)
        toast({
          title: "Upload failed",
          description: "An error occurred while uploading the files.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    },
    [toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/auth")
      return
    }

    fetchImages()
  }, [isAuthenticated, router])

  const fetchImages = async () => {
    try {
      setIsLoading(true)

      // Check if images table exists
      try {
        const { count, error } = await supabase.from("images").select("*", { count: "exact", head: true })

        if (error && error.code === "42P01") {
          // Table doesn't exist, create it
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS images (
              id SERIAL PRIMARY KEY,
              title TEXT NOT NULL,
              url TEXT NOT NULL,
              category TEXT DEFAULT 'general',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
          await supabase.rpc("execute_sql", { query: createTableQuery })

          toast({
            title: "Database initialized",
            description: "Images table created successfully",
          })
        }
      } catch (error) {
        console.error("Error checking images table:", error)
      }

      const { data, error } = await supabase.from("images").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setImages(data || [])
    } catch (error) {
      console.error("Error fetching images:", error)
      toast({
        title: "Error",
        description: "Failed to fetch images",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchImages()
    setIsRefreshing(false)
  }

  const handleAddImageUrl = async () => {
    if (!imageUrl || !imageTitle) {
      toast({
        title: "Validation Error",
        description: "Image URL and title are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      const { error } = await supabase.from("images").insert([
        {
          title: imageTitle,
          url: imageUrl,
          category: imageCategory,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Image added successfully",
      })

      // Reset form and refresh images
      setImageUrl("")
      setImageTitle("")
      setImageCategory("general")
      fetchImages()
    } catch (error) {
      console.error("Error adding image:", error)
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const { error } = await supabase.from("images").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Image deleted successfully",
      })

      await fetchImages()
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "URL Copied",
      description: "Image URL has been copied to clipboard",
    })
  }

  const filteredImages = images.filter((image) => {
    const matchesSearch = image.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || image.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ["all", ...new Set(images.map((image) => image.category))]

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Image Album</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Images</TabsTrigger>
            <TabsTrigger value="upload">Upload Images</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                />
              </div>

              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div
                className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}
              >
                {Array(8)
                  .fill(0)
                  .map((_, i) =>
                    viewMode === "grid" ? (
                      <Card key={i} className="animate-pulse">
                        <div className="aspect-square bg-muted"></div>
                        <CardFooter className="p-2">
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </CardFooter>
                      </Card>
                    ) : (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/3"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )}
              </div>
            ) : filteredImages.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden group">
                      <div className="aspect-square relative">
                        <Image src={image.url || "/placeholder.svg"} alt={image.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white/20 hover:bg-white/40"
                            onClick={() => handleCopyUrl(image.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white/20 hover:bg-white/40 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardFooter className="p-2 flex justify-between items-center">
                        <div className="truncate text-sm">{image.title}</div>
                        <div className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                          {image.category}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredImages.map((image) => (
                    <Card key={image.id}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 relative rounded overflow-hidden">
                          <Image
                            src={image.url || "/placeholder.svg"}
                            alt={image.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{image.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{image.url}</div>
                          <div className="text-xs mt-1">
                            <span className="px-2 py-0.5 bg-muted rounded-full">{image.category}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleCopyUrl(image.url)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No images found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/20 hover:border-primary/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    {isDragActive ? (
                      <p className="text-primary">Drop the files here...</p>
                    ) : (
                      <>
                        <p className="text-muted-foreground mb-2">
                          Drag & drop image files here, or click to select files
                        </p>
                        <p className="text-xs text-muted-foreground">Supports: JPG, PNG, GIF, WebP</p>
                      </>
                    )}
                  </div>

                  {isUploading && (
                    <div className="mt-4 p-4 bg-muted rounded-lg flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <span>Uploading images...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Image by URL</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image-title">Image Title</Label>
                      <Input
                        id="image-title"
                        value={imageTitle}
                        onChange={(e) => setImageTitle(e.target.value)}
                        placeholder="Enter image title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-url">Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="image-url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          prefix={<LinkIcon className="h-4 w-4 text-muted-foreground" />}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-category">Category</Label>
                      <Select value={imageCategory} onValueChange={setImageCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="profile">Profile</SelectItem>
                          <SelectItem value="projects">Projects</SelectItem>
                          <SelectItem value="events">Events</SelectItem>
                          <SelectItem value="blog">Blog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleAddImageUrl}
                      disabled={isUploading || !imageUrl || !imageTitle}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Image
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

