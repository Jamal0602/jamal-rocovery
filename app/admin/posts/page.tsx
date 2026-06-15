"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, RefreshCw, Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { uploadFile } from "@/lib/file-upload"

export default function AdminPosts() {
  const { isAuthenticated } = useApp()
  const router = useRouter()
  const { toast } = useToast()

  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [currentPost, setCurrentPost] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/auth")
      return
    }

    fetchPosts()
  }, [isAuthenticated, router])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("posts_star").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setPosts(data || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchPosts()
    setIsRefreshing(false)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleCreateNew = () => {
    setCurrentPost({
      title: "",
      description: "",
      content: "",
      image_url: "",
      category: [],
      tags: [],
      published: false,
      featured: false,
    })
    setIsEditing(true)
  }

  const handleEdit = (post: any) => {
    setCurrentPost({ ...post })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentPost(null)
    setImageFile(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentPost((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setCurrentPost((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !currentPost.tags.includes(newTag.trim())) {
      setCurrentPost((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setCurrentPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((t: string) => t !== tag),
    }))
  }

  const handleAddCategory = () => {
    if (newTag.trim() && !currentPost.category.includes(newTag.trim())) {
      setCurrentPost((prev) => ({
        ...prev,
        category: [...prev.category, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setCurrentPost((prev) => ({
      ...prev,
      category: prev.category.filter((c: string) => c !== category),
    }))
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)

      // Validate required fields
      if (!currentPost.title) {
        toast({
          title: "Validation Error",
          description: "Title is required",
          variant: "destructive",
        })
        return
      }

      // Upload image if selected
      let imageUrl = currentPost.image_url
      if (imageFile) {
        const uploadResult = await uploadFile(imageFile, "portfolio", "posts")
        if (uploadResult) {
          imageUrl = uploadResult.url
        }
      }

      const postData = {
        ...currentPost,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      }

      if (currentPost.id) {
        // Update existing post
        const { error } = await supabase.from("posts").update(postData).eq("id", currentPost.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Post updated successfully",
        })
      } else {
        // Create new post
        const { error } = await supabase.from("posts").insert([
          {
            ...postData,
            created_at: new Date().toISOString(),
            views: 0,
            likes: 0,
            comments: 0,
          },
        ])

        if (error) throw error

        toast({
          title: "Success",
          description: "Post created successfully",
        })
      }

      // Refresh posts and reset form
      await fetchPosts()
      setIsEditing(false)
      setCurrentPost(null)
      setImageFile(null)
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const { error } = await supabase.from("posts").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Post deleted successfully",
      })

      await fetchPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      })
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ published: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Post ${currentStatus ? "unpublished" : "published"} successfully`,
      })

      await fetchPosts()
    } catch (error) {
      console.error("Error toggling publish status:", error)
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Posts</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {isEditing ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{currentPost.id ? "Edit Post" : "Create New Post"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" value={currentPost.title} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Featured Image</Label>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                    {currentPost.image_url && (
                      <p className="text-xs text-muted-foreground">
                        Current image: {currentPost.image_url.split("/").pop()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={currentPost.description || ""}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={currentPost.content || ""}
                    onChange={handleInputChange}
                    rows={10}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {currentPost.category &&
                        currentPost.category.map((cat: string) => (
                          <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                            {cat}
                            <button
                              onClick={() => handleRemoveCategory(cat)}
                              className="ml-1 rounded-full hover:bg-muted p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add category..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                      />
                      <Button type="button" size="sm" onClick={handleAddCategory}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {currentPost.tags &&
                        currentPost.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="flex items-center gap-1">
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 rounded-full hover:bg-muted p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" size="sm" onClick={handleAddTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={currentPost.published}
                      onCheckedChange={(checked) => handleSwitchChange("published", checked)}
                    />
                    <Label htmlFor="published">Published</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={currentPost.featured}
                      onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={handleSearch}
                className="max-w-md"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded-md w-3/4 mb-4"></div>
                      <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded-md w-2/3 mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-8 bg-muted rounded-md w-20"></div>
                        <div className="h-8 bg-muted rounded-md w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <div className="relative h-40 bg-muted">
                      {post.image_url && (
                        <img
                          src={post.image_url || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {post.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                        <Badge className={post.published ? "bg-green-500" : "bg-red-500"}>
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1">{post.title}</h3>
                      {post.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.category &&
                          post.category.map((cat: string) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {post.views || 0}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePublish(post.id, post.published)}
                            title={post.published ? "Unpublish" : "Publish"}
                          >
                            {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(post)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(post.id)}
                            title="Delete"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found</p>
                <Button onClick={handleCreateNew} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Post
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

