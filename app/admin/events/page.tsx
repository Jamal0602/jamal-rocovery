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
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, RefreshCw, Save, X, Calendar, MapPin, LinkIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { uploadFile } from "@/lib/file-upload"
import { format, parseISO, isAfter } from "date-fns"

export default function AdminEvents() {
  const { isAuthenticated } = useApp()
  const router = useRouter()
  const { toast } = useToast()

  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/auth")
      return
    }

    fetchEvents()
  }, [isAuthenticated, router])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("events").select("*").order("start_date", { ascending: false })

      if (error) throw error

      setEvents(data || [])
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchEvents()
    setIsRefreshing(false)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleCreateNew = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    setCurrentEvent({
      title: "",
      description: "",
      content: "",
      location: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: tomorrow.toISOString().split("T")[0],
      image_url: "",
      event_url: "",
      category: [],
      tags: [],
      published: false,
    })
    setIsEditing(true)
  }

  const handleEdit = (event: any) => {
    // Format dates for input fields
    const formattedEvent = {
      ...event,
      start_date: event.start_date ? event.start_date.split("T")[0] : "",
      end_date: event.end_date ? event.end_date.split("T")[0] : "",
    }
    setCurrentEvent(formattedEvent)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentEvent(null)
    setImageFile(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentEvent((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setCurrentEvent((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !currentEvent.tags.includes(newTag.trim())) {
      setCurrentEvent((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setCurrentEvent((prev) => ({
      ...prev,
      tags: prev.tags.filter((t: string) => t !== tag),
    }))
  }

  const handleAddCategory = () => {
    if (newTag.trim() && !currentEvent.category.includes(newTag.trim())) {
      setCurrentEvent((prev) => ({
        ...prev,
        category: [...prev.category, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setCurrentEvent((prev) => ({
      ...prev,
      category: prev.category.filter((c: string) => c !== category),
    }))
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)

      // Validate required fields
      if (!currentEvent.title || !currentEvent.start_date) {
        toast({
          title: "Validation Error",
          description: "Title and start date are required",
          variant: "destructive",
        })
        return
      }

      // Upload image if selected
      let imageUrl = currentEvent.image_url
      if (imageFile) {
        const uploadResult = await uploadFile(imageFile, "portfolio", "events")
        if (uploadResult) {
          imageUrl = uploadResult.url
        }
      }

      const eventData = {
        ...currentEvent,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      }

      if (currentEvent.id) {
        // Update existing event
        const { error } = await supabase.from("events").update(eventData).eq("id", currentEvent.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Event updated successfully",
        })
      } else {
        // Create new event
        const { error } = await supabase.from("events").insert([
          {
            ...eventData,
            created_at: new Date().toISOString(),
          },
        ])

        if (error) throw error

        toast({
          title: "Success",
          description: "Event created successfully",
        })
      }

      // Refresh events and reset form
      await fetchEvents()
      setIsEditing(false)
      setCurrentEvent(null)
      setImageFile(null)
    } catch (error) {
      console.error("Error saving event:", error)
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const { error } = await supabase.from("events").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Event deleted successfully",
      })

      await fetchEvents()
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      })
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ published: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Event ${currentStatus ? "unpublished" : "published"} successfully`,
      })

      await fetchEvents()
    } catch (error) {
      console.error("Error toggling publish status:", error)
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive",
      })
    }
  }

  const isUpcoming = (date: string) => {
    return isAfter(parseISO(date), new Date())
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {isEditing ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{currentEvent.id ? "Edit Event" : "Create New Event"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" name="title" value={currentEvent.title} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Event Image</Label>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                    {currentEvent.image_url && (
                      <p className="text-xs text-muted-foreground">
                        Current image: {currentEvent.image_url.split("/").pop()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={currentEvent.description || ""}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={currentEvent.location || ""}
                      onChange={handleInputChange}
                      placeholder="Event location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_url">Event URL</Label>
                    <Input
                      id="event_url"
                      name="event_url"
                      value={currentEvent.event_url || ""}
                      onChange={handleInputChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={currentEvent.start_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={currentEvent.end_date || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={currentEvent.content || ""}
                    onChange={handleInputChange}
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {currentEvent.category &&
                        currentEvent.category.map((cat: string) => (
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
                      {currentEvent.tags &&
                        currentEvent.tags.map((tag: string) => (
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={currentEvent.published}
                    onCheckedChange={(checked) => handleSwitchChange("published", checked)}
                  />
                  <Label htmlFor="published">Published</Label>
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
                        Save Event
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
                placeholder="Search events..."
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
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className="relative h-40 bg-muted">
                      {event.image_url && (
                        <img
                          src={event.image_url || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className={isUpcoming(event.start_date) ? "bg-blue-500" : "bg-gray-500"}>
                          {isUpcoming(event.start_date) ? "Upcoming" : "Past"}
                        </Badge>
                        <Badge className={event.published ? "bg-green-500" : "bg-red-500"}>
                          {event.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1">{event.title}</h3>
                      <div className="flex flex-col gap-1 mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(parseISO(event.start_date), "MMM d, yyyy")}
                            {event.end_date && ` - ${format(parseISO(event.end_date), "MMM d, yyyy")}`}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                        {event.event_url && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            <a
                              href={event.event_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline line-clamp-1"
                            >
                              Event Link
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {event.category &&
                          event.category.map((cat: string) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(event.id, event.published)}
                          title={event.published ? "Unpublish" : "Publish"}
                        >
                          {event.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(event.id)}
                          title="Delete"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found</p>
                <Button onClick={handleCreateNew} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Event
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

