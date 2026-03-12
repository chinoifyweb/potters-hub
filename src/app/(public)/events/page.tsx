"use client";

import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const upcomingEvents = [
  {
    id: "1",
    title: "Easter Sunday Celebration",
    date: "April 5, 2026",
    day: "5",
    month: "APR",
    time: "8:00 AM & 10:30 AM",
    location: "Main Sanctuary",
    description:
      "Join us for a glorious Easter service filled with worship, drama performances, and a powerful message of resurrection hope. Special children's program available.",
    category: "Service",
  },
  {
    id: "2",
    title: "Youth Conference 2026",
    date: "April 18-19, 2026",
    day: "18",
    month: "APR",
    time: "9:00 AM - 5:00 PM",
    location: "Church Auditorium",
    description:
      "An empowering two-day conference for young people ages 13-25. Featured speakers, worship sessions, breakout workshops, and networking opportunities.",
    category: "Conference",
  },
  {
    id: "3",
    title: "Marriage Enrichment Retreat",
    date: "May 2, 2026",
    day: "2",
    month: "MAY",
    time: "10:00 AM - 4:00 PM",
    location: "Grace Conference Center",
    description:
      "A full day dedicated to strengthening marriages with practical teaching, guided activities, and quality time with your spouse. Lunch provided.",
    category: "Retreat",
  },
  {
    id: "4",
    title: "Community Outreach Day",
    date: "May 10, 2026",
    day: "10",
    month: "MAY",
    time: "7:00 AM - 2:00 PM",
    location: "Various Locations",
    description:
      "Serve our local community through food distribution, health screenings, and children's activities. Volunteers needed in multiple areas.",
    category: "Outreach",
  },
  {
    id: "5",
    title: "Women's Prayer Breakfast",
    date: "May 17, 2026",
    day: "17",
    month: "MAY",
    time: "8:00 AM",
    location: "Fellowship Hall",
    description:
      "A morning of prayer, worship, and fellowship for women of all ages. Guest speaker Deaconess Sarah Nwosu. Breakfast served.",
    category: "Fellowship",
  },
];

const pastEvents = [
  {
    id: "p1",
    title: "New Year Revival Service",
    date: "January 1-3, 2026",
    location: "Main Sanctuary",
  },
  {
    id: "p2",
    title: "Leadership Summit",
    date: "February 8, 2026",
    location: "Church Auditorium",
  },
  {
    id: "p3",
    title: "Valentine's Couples Dinner",
    date: "February 14, 2026",
    location: "Fellowship Hall",
  },
];

export default function EventsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-700 to-red-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Events</h1>
          <p className="text-red-100 mt-3 max-w-xl mx-auto">
            Stay connected with what&apos;s happening at The Potter&apos;s House Church. Find events,
            register, and join our community gatherings.
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Upcoming Events</h2>
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Date Badge */}
                    <div className="sm:w-28 shrink-0 bg-primary text-white flex flex-row sm:flex-col items-center justify-center p-4 gap-2 sm:gap-0">
                      <span className="text-sm font-semibold uppercase">
                        {event.month}
                      </span>
                      <span className="text-3xl font-bold">{event.day}</span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {event.category}
                          </span>
                          <h3 className="font-semibold text-xl mt-2">
                            {event.title}
                          </h3>
                        </div>
                        <Button size="sm" className="shrink-0 hidden sm:flex">
                          RSVP
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.location}
                        </span>
                      </div>
                      <Button size="sm" className="sm:hidden">
                        RSVP
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <Card key={event.id} className="opacity-75">
                <CardContent className="p-5">
                  <h3 className="font-semibold">{event.title}</h3>
                  <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
