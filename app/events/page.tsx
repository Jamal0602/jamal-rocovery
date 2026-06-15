"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOffline } from "@/hooks/use-offline"
import OfflinePage from "@/components/offline-page"
import { Calendar, Clock, MapPin, ExternalLink, CalendarDays } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { subscribeToTable } from "@/lib/realtime"
import Image from "next/image"
import { format, parseISO, isFuture, isPast } from "date-fns"
import AdvancedPopup from "@/components/advanced-popup"

interface Event {
  id: string
  title: string
  description: string
  location: string | null
  start_date: string
  end_date: string | null
  image_url: string | null
  event_url: string | null
  tags: string[] | null
  published: boolean
}

export default function EventsPage() {
  const isOffline = useOffline()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  useEffect(() => {
    fetchEvents()

    // Set up real-time subscription
    const channel = subscribeToTable("events_star", fetchEvents)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredEvents(events)
    } else if (activeFilter === "upcoming") {
      setFilteredEvents(events.filter((event) => isFuture(parseISO(event.start_date))))
    } else if (activeFilter === "past") {
      setFilteredEvents(events.filter((event) => isPast(parseISO(event.start_date))))
    }
  }, [activeFilter, events])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("events_star")
        .select("*")
        .eq("published", true)
        .order("start_date", { ascending: true })

      if (error) throw error
      setEvents(data || [])
      setFilteredEvents(data || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenPopup = (event: Event) => {
    setSelectedEvent(event)
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Events</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stay updated with my latest events, workshops, conferences, and speaking engagements.
              </p>
            </motion.div>

            <Tabs defaultValue="all" className="w-full mb-10" onValueChange={setActiveFilter}>
              <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  All Events
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Past Events
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index} className="animate-pulse backdrop-blur-sm bg-background/80 border-primary/20">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Animation%20-%201743734436715-lMmSr5uEKw8jf3dI6z8yDhFgUpbbtC.gif"
                            alt="Loading"
                            className="w-16 h-16"
                          />
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="h-6 bg-muted rounded-md w-3/4"></div>
                          <div className="h-4 bg-muted rounded-md w-1/2"></div>
                          <div className="h-4 bg-muted rounded-md w-full"></div>
                          <div className="h-4 bg-muted rounded-md w-full"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-muted rounded-md w-20"></div>
                            <div className="h-6 bg-muted rounded-md w-20"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * (index % 2) }}
                  >
                    <Card
                      className="overflow-hidden h-full flex flex-col backdrop-blur-sm bg-background/80 border-primary/20 shadow-lg shadow-primary/10 cursor-pointer"
                      onClick={() => handleOpenPopup(event)}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={event.image_url || "/placeholder.svg?height=300&width=600"}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                        {isPast(parseISO(event.start_date)) ? (
                          <Badge className="absolute top-3 left-3 bg-muted text-muted-foreground">Past Event</Badge>
                        ) : (
                          <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary">Upcoming</Badge>
                        )}
                      </div>
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                        <div className="flex flex-col gap-2 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>
                              {format(parseISO(event.start_date), "MMMM d, yyyy")}
                              {event.end_date && ` - ${format(parseISO(event.end_date), "MMMM d, yyyy")}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{format(parseISO(event.start_date), "h:mm a")}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-4 flex-1">{event.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {event.tags &&
                            event.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-auto">
                          {event.event_url && (
                            <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                              <a href={event.event_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" /> Event Details
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${encodeURIComponent(event.start_date)}/${encodeURIComponent(event.end_date || event.start_date)}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location || "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <CalendarDays className="h-4 w-4 mr-2" /> Add to Calendar
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  {activeFilter === "upcoming"
                    ? "There are no upcoming events scheduled at the moment."
                    : activeFilter === "past"
                      ? "There are no past events to display."
                      : "No events found."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />

      {selectedEvent && (
        <AdvancedPopup isOpen={isPopupOpen} onClose={handleClosePopup} item={selectedEvent} type="event" />
      )}
    </motion.main>
  )
}

