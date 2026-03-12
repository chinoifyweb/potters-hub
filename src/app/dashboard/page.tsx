"use client"

import React from "react"
import Link from "next/link"
import {
  Heart,
  Video,
  BookOpen,
  Calendar,
  Play,
  ArrowRight,
  Clock,
  MapPin,
  ThumbsUp,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const todaysDevotional = {
  title: "Walking in Faith",
  scripture: "Hebrews 11:1",
  excerpt:
    "Now faith is the substance of things hoped for, the evidence of things not seen. Today, let us reflect on what it means to trust God even when the path ahead is unclear...",
  image: "/images/devotional-faith.jpg",
}

const continueListening = {
  id: "sermon-1",
  title: "The Power of Prayer",
  speaker: "Pastor James Okonkwo",
  series: "Prayer Series",
  progress: 45,
  duration: "48:32",
  elapsed: "21:50",
  thumbnail: "/images/sermon-prayer.jpg",
}

const upcomingEvents = [
  {
    id: "1",
    title: "Sunday Worship Service",
    date: "2026-03-15",
    time: "9:00 AM",
    location: "Main Sanctuary",
    type: "Worship",
  },
  {
    id: "2",
    title: "Youth Fellowship Night",
    date: "2026-03-17",
    time: "6:00 PM",
    location: "Youth Hall",
    type: "Fellowship",
  },
  {
    id: "3",
    title: "Women's Prayer Breakfast",
    date: "2026-03-20",
    time: "7:30 AM",
    location: "Fellowship Hall",
    type: "Prayer",
  },
]

const recentPosts = [
  {
    id: "1",
    author: "Sarah Adeyemi",
    avatar: "/avatars/sarah.jpg",
    initials: "SA",
    content:
      "God has been so faithful! I got the job I've been praying about for months. Please join me in praising God!",
    type: "Testimony",
    likes: 24,
    comments: 8,
    time: "2h ago",
  },
  {
    id: "2",
    author: "Brother Michael",
    avatar: "/avatars/michael.jpg",
    initials: "BM",
    content:
      "Please keep my family in your prayers as we go through a challenging season. God is able!",
    type: "Prayer Request",
    likes: 31,
    comments: 15,
    time: "5h ago",
  },
]

const quickActions = [
  { title: "Give", href: "/dashboard/giving", icon: Heart, color: "bg-rose-500" },
  { title: "Watch Sermon", href: "/dashboard/sermons", icon: Video, color: "bg-red-500" },
  { title: "Read Bible", href: "/dashboard/bible", icon: BookOpen, color: "bg-emerald-500" },
  { title: "View Events", href: "/dashboard/events", icon: Calendar, color: "bg-amber-500" },
]

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    day: d.getDate(),
    month: d.toLocaleString("en-US", { month: "short" }),
    weekday: d.toLocaleString("en-US", { weekday: "short" }),
  }
}

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, John!</h2>
        <p className="text-muted-foreground">
          God is good, all the time. Here is what is happening today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${action.color} text-white`}
                >
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{action.title}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Devotional */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Today&apos;s Devotional</CardTitle>
              <Link href="/dashboard/devotionals">
                <Button variant="ghost" size="sm" className="text-xs">
                  Read More <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">{todaysDevotional.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {todaysDevotional.scripture}
              </Badge>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {todaysDevotional.excerpt}
              </p>
              <Link href="/dashboard/devotionals">
                <Button size="sm" className="mt-2">
                  Read Full Devotional
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Continue Listening */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Continue Listening</CardTitle>
              <Link href="/dashboard/sermons">
                <Button variant="ghost" size="sm" className="text-xs">
                  All Sermons <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/sermons/${continueListening.id}`}>
              <div className="flex gap-4 items-start cursor-pointer group">
                <div className="relative h-20 w-20 shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  <Play className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {continueListening.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {continueListening.speaker} &middot; {continueListening.series}
                  </p>
                  <div className="space-y-1">
                    <Progress value={continueListening.progress} className="h-1.5" />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{continueListening.elapsed}</span>
                      <span>{continueListening.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Events</CardTitle>
              <Link href="/dashboard/events">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const { day, month, weekday } = formatEventDate(event.date)
                return (
                  <div key={event.id} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/50 p-2 min-w-[52px]">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">
                        {month}
                      </span>
                      <span className="text-lg font-bold leading-tight">{day}</span>
                      <span className="text-[10px] text-muted-foreground">{weekday}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{event.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {event.type}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Community Posts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Community</CardTitle>
              <Link href="/dashboard/community">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback className="text-xs">{post.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.author}</p>
                      <p className="text-[11px] text-muted-foreground">{post.time}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {post.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <ThumbsUp className="h-3.5 w-3.5" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageSquare className="h-3.5 w-3.5" /> {post.comments}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
