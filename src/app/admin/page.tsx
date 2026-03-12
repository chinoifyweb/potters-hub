"use client"

import { useState } from "react"
import {
  Users,
  TrendingUp,
  Heart,
  UsersRound,
  Calendar,
  Plus,
  Video,
  Bell,
  FileBarChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const memberGrowthData = [
  { month: "Jan", members: 420 },
  { month: "Feb", members: 445 },
  { month: "Mar", members: 462 },
  { month: "Apr", members: 490 },
  { month: "May", members: 510 },
  { month: "Jun", members: 535 },
  { month: "Jul", members: 548 },
  { month: "Aug", members: 570 },
  { month: "Sep", members: 592 },
  { month: "Oct", members: 610 },
  { month: "Nov", members: 628 },
  { month: "Dec", members: 654 },
]

const donationData = [
  { month: "Jan", amount: 125000 },
  { month: "Feb", amount: 142000 },
  { month: "Mar", amount: 138000 },
  { month: "Apr", amount: 165000 },
  { month: "May", amount: 155000 },
  { month: "Jun", amount: 180000 },
  { month: "Jul", amount: 172000 },
  { month: "Aug", amount: 195000 },
  { month: "Sep", amount: 210000 },
  { month: "Oct", amount: 198000 },
  { month: "Nov", amount: 225000 },
  { month: "Dec", amount: 245000 },
]

const recentActivity = [
  {
    id: 1,
    type: "signup",
    message: "John Doe joined the church",
    time: "2 minutes ago",
    avatar: "JD",
  },
  {
    id: 2,
    type: "donation",
    message: "Mary Smith donated $500",
    time: "15 minutes ago",
    avatar: "MS",
  },
  {
    id: 3,
    type: "event",
    message: "Youth Conference RSVP - 45 new registrations",
    time: "1 hour ago",
    avatar: "YC",
  },
  {
    id: 4,
    type: "sermon",
    message: "New sermon uploaded: 'Walking in Faith'",
    time: "2 hours ago",
    avatar: "PS",
  },
  {
    id: 5,
    type: "signup",
    message: "Grace Johnson joined the church",
    time: "3 hours ago",
    avatar: "GJ",
  },
  {
    id: 6,
    type: "donation",
    message: "Anonymous donated $1,200",
    time: "5 hours ago",
    avatar: "AN",
  },
  {
    id: 7,
    type: "group",
    message: "New small group created: Bible Study - Psalms",
    time: "Yesterday",
    avatar: "BS",
  },
]

const stats = [
  {
    title: "Total Members",
    value: "654",
    change: "+4.2%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "New This Week",
    value: "12",
    change: "+20%",
    trend: "up",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Donations (This Month)",
    value: "$24,500",
    change: "+8.1%",
    trend: "up",
    icon: Heart,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    title: "Active Groups",
    value: "18",
    change: "-1",
    trend: "down",
    icon: UsersRound,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Upcoming Events",
    value: "7",
    change: "+3",
    trend: "up",
    icon: Calendar,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Pastor Admin. Here is an overview of your church.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <Badge
                    variant={stat.trend === "up" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Member Growth</CardTitle>
            <CardDescription>
              Monthly member count over the past year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={memberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="members"
                  stroke="hsl(221.2, 83.2%, 53.3%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donation Trends</CardTitle>
            <CardDescription>
              Monthly donations over the past year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donationData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value: number) =>
                    `$${value.toLocaleString()}`
                  }
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(221.2, 83.2%, 53.3%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest activity across the church platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button className="w-full justify-start" variant="outline">
              <Video className="mr-2 h-4 w-4" />
              Add Sermon
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Create Event
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileBarChart className="mr-2 h-4 w-4" />
              View Reports
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
