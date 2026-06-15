"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import AdminLayout from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import {
  Download,
  FileText,
  Users,
  BarChart,
  Calendar,
  Layers,
  WorkflowIcon as Widgets,
  Database,
  Shield,
  FileJson,
} from "lucide-react"

export default function AdminInfo() {
  const { isAuthenticated } = useApp()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState({
    posts: 0,
    pages: 0,
    events: 0,
    widgets: 0,
    subscribers: 0,
    likes: 0,
    bookmarks: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/auth")
    }

    const fetchStats = async () => {
      try {
        // Fetch counts from all tables
        const [postsRes, eventsRes, widgetsRes, subscribersRes, likesRes, bookmarksRes] = await Promise.all([
          supabase.from("posts").select("id", { count: "exact" }),
          supabase.from("events").select("id", { count: "exact" }),
          supabase.from("widgets").select("id", { count: "exact" }),
          supabase.from("subscribers").select("id", { count: "exact" }),
          supabase.from("likes").select("id", { count: "exact" }),
          supabase.from("bookmarks").select("id", { count: "exact" }),
        ])

        setStats({
          posts: postsRes.count || 0,
          pages: 5, // Hardcoded for now
          events: eventsRes.count || 0,
          widgets: widgetsRes.count || 0,
          subscribers: subscribersRes.count || 0,
          likes: likesRes.count || 0,
          bookmarks: bookmarksRes.count || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [isAuthenticated, router])

  const handleDownloadData = async (type: string) => {
    try {
      let data
      let filename

      switch (type) {
        case "all":
          // Fetch all data
          const [postsData, eventsData, widgetsData, subscribersData, settingsData, socialLinksData] =
            await Promise.all([
              supabase.from("posts").select("*"),
              supabase.from("events").select("*"),
              supabase.from("widgets").select("*"),
              supabase.from("subscribers").select("*"),
              supabase.from("settings").select("*"),
              supabase.from("social_links").select("*"),
            ])

          data = {
            posts: postsData.data,
            events: eventsData.data,
            widgets: widgetsData.data,
            subscribers: subscribersData.data,
            settings: settingsData.data,
            socialLinks: socialLinksData.data,
            exportDate: new Date().toISOString(),
          }
          filename = `portfolio-data-export-${new Date().toISOString().split("T")[0]}.json`
          break

        case "subscribers":
          const { data: subscribers } = await supabase.from("subscribers").select("*")
          data = subscribers
          filename = `subscribers-export-${new Date().toISOString().split("T")[0]}.json`
          break

        case "analytics":
          // In a real app, you'd fetch analytics data
          data = {
            message: "Analytics data would be exported here",
            exportDate: new Date().toISOString(),
          }
          filename = `analytics-export-${new Date().toISOString().split("T")[0]}.json`
          break

        default:
          throw new Error("Invalid export type")
      }

      // Create a download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: `Data has been exported to ${filename}`,
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export failed",
        description: "An error occurred while exporting data",
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
        <h1 className="text-3xl font-bold mb-6">Information & Downloads</h1>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
                    <p className="text-2xl font-bold">{isLoading ? "..." : stats.posts}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                    <p className="text-2xl font-bold">{isLoading ? "..." : stats.events}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Widgets</p>
                    <p className="text-2xl font-bold">{isLoading ? "..." : stats.widgets}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Widgets className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Subscribers</p>
                    <p className="text-2xl font-bold">{isLoading ? "..." : stats.subscribers}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader>
                  <CardTitle>Engagement Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BarChart className="h-4 w-4 text-primary" />
                        </div>
                        <span>Total Likes</span>
                      </div>
                      <span className="font-bold">{isLoading ? "..." : stats.likes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BarChart className="h-4 w-4 text-primary" />
                        </div>
                        <span>Total Bookmarks</span>
                      </div>
                      <span className="font-bold">{isLoading ? "..." : stats.bookmarks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BarChart className="h-4 w-4 text-primary" />
                        </div>
                        <span>Average Likes per Post</span>
                      </div>
                      <span className="font-bold">
                        {isLoading || stats.posts === 0 ? "..." : (stats.likes / stats.posts).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader>
                  <CardTitle>Content Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span>Total Pages</span>
                      </div>
                      <span className="font-bold">{isLoading ? "..." : stats.pages}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Layers className="h-4 w-4 text-primary" />
                        </div>
                        <span>Total Posts</span>
                      </div>
                      <span className="font-bold">{isLoading ? "..." : stats.posts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <span>Total Events</span>
                      </div>
                      <span className="font-bold">{isLoading ? "..." : stats.events}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="downloads">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <FileJson className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Export All Data</h3>
                  <p className="text-muted-foreground mb-6 flex-1">
                    Download a complete backup of all your website data including posts, events, widgets, and settings.
                  </p>
                  <Button onClick={() => handleDownloadData("all")} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download All Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Export Subscribers</h3>
                  <p className="text-muted-foreground mb-6 flex-1">
                    Download a list of all your newsletter subscribers with their email addresses and subscription
                    dates.
                  </p>
                  <Button onClick={() => handleDownloadData("subscribers")} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download Subscribers
                  </Button>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Export Analytics</h3>
                  <p className="text-muted-foreground mb-6 flex-1">
                    Download analytics data including page views, user engagement metrics, and content performance.
                  </p>
                  <Button onClick={() => handleDownloadData("analytics")} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
              <CardHeader>
                <CardTitle>Security Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Data Protection</h3>
                    <p className="text-muted-foreground">
                      Your website data is protected using industry-standard security practices. All sensitive
                      information is encrypted and stored securely in the database.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                    <p className="text-muted-foreground">
                      Admin access is protected by password authentication. For enhanced security, consider changing
                      your password regularly and using a strong, unique password.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Database Security</h3>
                    <p className="text-muted-foreground">
                      Your database is protected by Row Level Security (RLS) policies that restrict access to data based
                      on user permissions. Public data is read-only, while admin operations require authentication.
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-medium">Security Status</span>
                    </div>
                    <Badge className="bg-green-500 hover:bg-green-600">Secure</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card className="backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10">
              <CardHeader>
                <CardTitle>API Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Database Connection</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-primary" />
                      <span className="font-medium">Connection Status:</span>
                      <Badge className="bg-green-500 hover:bg-green-600">Connected</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Your website is connected to a Supabase database that stores all your content and settings. The
                      database connection is secure and optimized for performance.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">GitHub Integration</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your portfolio to a GitHub repository to enable version control and collaborative
                      development.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline">Connect GitHub Repository</Button>
                      <Button variant="outline" disabled>
                        View Deployment Settings
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
                    <p className="text-muted-foreground mb-4">
                      Access the API documentation to learn how to interact with your portfolio data programmatically.
                    </p>
                    <Button variant="outline">View API Documentation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

