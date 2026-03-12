"use client"

import React, { useState } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ChurchEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  endTime: string
  location: string
  type: string
  attendees: number
  rsvpStatus: "going" | "interested" | "not_going" | null
  image?: string
}

const events: ChurchEvent[] = [
  {
    id: "1",
    title: "Sunday Worship Service",
    description: "Join us for a powerful time of worship, praise, and the preaching of the Word. This week, Pastor James will continue the Prayer Series with a message on intercessory prayer.",
    date: "2026-03-15",
    time: "9:00 AM",
    endTime: "11:30 AM",
    location: "Main Sanctuary",
    type: "Worship",
    attendees: 245,
    rsvpStatus: "going",
  },
  {
    id: "2",
    title: "Youth Fellowship Night",
    description: "A special evening for the youth to fellowship, play games, and hear a powerful message about standing strong in faith. Snacks will be provided!",
    date: "2026-03-17",
    time: "6:00 PM",
    endTime: "8:30 PM",
    location: "Youth Hall",
    type: "Fellowship",
    attendees: 67,
    rsvpStatus: null,
  },
  {
    id: "3",
    title: "Women's Prayer Breakfast",
    description: "Ladies, come together for a beautiful morning of prayer, worship, and fellowship over breakfast. Guest speaker: Sister Ruth Adebayo.",
    date: "2026-03-20",
    time: "7:30 AM",
    endTime: "10:00 AM",
    location: "Fellowship Hall",
    type: "Prayer",
    attendees: 38,
    rsvpStatus: "interested",
  },
  {
    id: "4",
    title: "Marriage Enrichment Seminar",
    description: "Strengthen your marriage with practical wisdom from God's Word. Open to all married couples and those preparing for marriage.",
    date: "2026-03-22",
    time: "10:00 AM",
    endTime: "2:00 PM",
    location: "Main Sanctuary",
    type: "Seminar",
    attendees: 54,
    rsvpStatus: null,
  },
  {
    id: "5",
    title: "Community Outreach Day",
    description: "Be the hands and feet of Jesus! Join us as we serve our local community through food distribution, clean-up, and sharing the Gospel.",
    date: "2026-03-29",
    time: "8:00 AM",
    endTime: "3:00 PM",
    location: "Church Grounds",
    type: "Outreach",
    attendees: 92,
    rsvpStatus: null,
  },
  {
    id: "6",
    title: "Easter Sunday Celebration",
    description: "Celebrate the resurrection of our Lord Jesus Christ with special music, drama, and a powerful Easter message.",
    date: "2026-04-05",
    time: "8:00 AM",
    endTime: "12:00 PM",
    location: "Main Sanctuary",
    type: "Special",
    attendees: 320,
    rsvpStatus: "going",
  },
]

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    day: d.getDate(),
    month: d.toLocaleString("en-US", { month: "short" }),
    weekday: d.toLocaleString("en-US", { weekday: "long" }),
    full: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  }
}

const typeColors: Record<string, string> = {
  Worship: "bg-red-100 text-red-700",
  Fellowship: "bg-green-100 text-green-700",
  Prayer: "bg-purple-100 text-purple-700",
  Seminar: "bg-amber-100 text-amber-700",
  Outreach: "bg-rose-100 text-rose-700",
  Special: "bg-orange-100 text-orange-700",
}

export default function EventsPage() {
  const [eventList, setEventList] = useState(events)
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upcoming")

  const handleRsvp = (eventId: string, status: "going" | "interested" | "not_going") => {
    setEventList((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, rsvpStatus: e.rsvpStatus === status ? null : status }
          : e
      )
    )
    const labels = { going: "Going", interested: "Interested", not_going: "Not going" }
    toast.success(`RSVP updated: ${labels[status]}`)
  }

  const addToCalendar = (event: ChurchEvent) => {
    toast.success(`"${event.title}" — calendar event details copied!`)
  }

  const myRsvps = eventList.filter((e) => e.rsvpStatus === "going" || e.rsvpStatus === "interested")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Events</h2>
        <p className="text-muted-foreground">Stay connected with what is happening at church.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="my-rsvps">
            My RSVPs
            {myRsvps.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 min-w-[20px] px-1 text-[10px]">
                {myRsvps.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <div className="space-y-4">
            {eventList.map((event) => {
              const { day, month, weekday, full } = formatEventDate(event.date)
              const isExpanded = expandedEvent === event.id
              return (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center bg-primary/5 p-4 min-w-[80px]">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {month}
                        </span>
                        <span className="text-2xl font-bold">{day}</span>
                        <span className="text-[10px] text-muted-foreground">{weekday}</span>
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {event.time} - {event.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {event.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {event.attendees} attending
                              </span>
                            </div>
                          </div>
                          <Badge className={cn("text-[10px] shrink-0", typeColors[event.type] || "")}>
                            {event.type}
                          </Badge>
                        </div>

                        {/* Expandable Details */}
                        <button
                          className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                          onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                        >
                          {isExpanded ? "Show less" : "Show details"}
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-3">
                            <Separator />
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {event.description}
                            </p>
                          </div>
                        )}

                        {/* RSVP Buttons */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant={event.rsvpStatus === "going" ? "default" : "outline"}
                            className="text-xs h-8"
                            onClick={() => handleRsvp(event.id, "going")}
                          >
                            Going
                          </Button>
                          <Button
                            size="sm"
                            variant={event.rsvpStatus === "interested" ? "default" : "outline"}
                            className="text-xs h-8"
                            onClick={() => handleRsvp(event.id, "interested")}
                          >
                            Interested
                          </Button>
                          <Button
                            size="sm"
                            variant={event.rsvpStatus === "not_going" ? "secondary" : "ghost"}
                            className="text-xs h-8"
                            onClick={() => handleRsvp(event.id, "not_going")}
                          >
                            Not Going
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-8 ml-auto"
                            onClick={() => addToCalendar(event)}
                          >
                            <CalendarPlus className="h-3.5 w-3.5 mr-1" /> Add to Calendar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="my-rsvps" className="mt-4">
          {myRsvps.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No RSVPs yet.</p>
              <Button variant="outline" className="mt-3" onClick={() => setActiveTab("upcoming")}>
                Browse Events
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myRsvps.map((event) => {
                const { day, month } = formatEventDate(event.date)
                return (
                  <Card key={event.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/50 p-2 min-w-[52px]">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">{month}</span>
                        <span className="text-lg font-bold leading-tight">{day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.time} &middot; {event.location}
                        </p>
                      </div>
                      <Badge variant={event.rsvpStatus === "going" ? "default" : "secondary"} className="text-xs">
                        {event.rsvpStatus === "going" ? "Going" : "Interested"}
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
