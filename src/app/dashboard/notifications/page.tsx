"use client"

import React, { useState } from "react"
import {
  Bell,
  Video,
  Calendar,
  Heart,
  MessageSquare,
  Users,
  CheckCheck,
  Sunrise,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Notification {
  id: string
  icon: "sermon" | "event" | "giving" | "community" | "group" | "devotional" | "general"
  title: string
  body: string
  time: string
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    icon: "sermon",
    title: "New Sermon Available",
    body: "\"The Power of Prayer\" by Pastor James Okonkwo has been uploaded.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: "2",
    icon: "event",
    title: "Event Reminder",
    body: "Sunday Worship Service starts tomorrow at 9:00 AM.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    icon: "community",
    title: "New Comment on Your Post",
    body: "Grace Eze commented on your prayer request.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "4",
    icon: "giving",
    title: "Giving Received",
    body: "Your tithe of NGN 10,000 has been received. Thank you!",
    time: "5 hours ago",
    read: true,
  },
  {
    id: "5",
    icon: "group",
    title: "Group Update",
    body: "Men of Valor meeting time has been changed to 7:30 AM this Saturday.",
    time: "8 hours ago",
    read: true,
  },
  {
    id: "6",
    icon: "devotional",
    title: "Today's Devotional",
    body: "\"Walking in Faith\" — a new daily devotional is ready for you.",
    time: "12 hours ago",
    read: true,
  },
  {
    id: "7",
    icon: "community",
    title: "Sarah Adeyemi Shared a Testimony",
    body: "A new testimony has been posted in the community feed.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "8",
    icon: "event",
    title: "New Event Added",
    body: "Marriage Enrichment Seminar has been scheduled for March 22.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "9",
    icon: "general",
    title: "Church Announcement",
    body: "The church office will be closed on March 25 for a public holiday.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "10",
    icon: "sermon",
    title: "Sermon Series Update",
    body: "The \"Prayer Series\" continues this Sunday. Don't miss it!",
    time: "3 days ago",
    read: true,
  },
]

const iconMap = {
  sermon: { icon: Video, color: "bg-blue-100 text-blue-600" },
  event: { icon: Calendar, color: "bg-green-100 text-green-600" },
  giving: { icon: Heart, color: "bg-rose-100 text-rose-600" },
  community: { icon: MessageSquare, color: "bg-purple-100 text-purple-600" },
  group: { icon: Users, color: "bg-amber-100 text-amber-600" },
  devotional: { icon: Sunrise, color: "bg-orange-100 text-orange-600" },
  general: { icon: Bell, color: "bg-gray-100 text-gray-600" },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [activeTab, setActiveTab] = useState("all")

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const filtered =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "You are all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-1.5" /> Mark All as Read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-5 min-w-[20px] px-1 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-2">
            {filtered.map((notification) => {
              const config = iconMap[notification.icon]
              const IconComponent = config.icon
              return (
                <Card
                  key={notification.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent/50",
                    !notification.read && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        config.color
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn(
                            "text-sm truncate",
                            !notification.read ? "font-semibold" : "font-medium"
                          )}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.body}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {activeTab === "unread" ? "No unread notifications." : "No notifications yet."}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
