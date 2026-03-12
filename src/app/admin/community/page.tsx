"use client"

import { useState } from "react"
import {
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  Trash2,
  MessageSquare,
  ThumbsUp,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface CommunityPost {
  id: string
  author: string
  content: string
  type: "general" | "prayer_request" | "testimony" | "announcement"
  likes: number
  comments: number
  visible: boolean
  pinned: boolean
  date: string
}

const samplePosts: CommunityPost[] = [
  { id: "1", author: "John Doe", content: "Thank you all for your prayers! My mother's surgery went well and she is recovering.", type: "testimony", likes: 45, comments: 12, visible: true, pinned: false, date: "2026-03-12" },
  { id: "2", author: "Pastor David", content: "Reminder: Easter service will be at 7 AM this year. Invite your friends and family!", type: "announcement", likes: 89, comments: 23, visible: true, pinned: true, date: "2026-03-11" },
  { id: "3", author: "Mary Smith", content: "Please pray for my husband who just lost his job. We trust God for provision.", type: "prayer_request", likes: 67, comments: 34, visible: true, pinned: false, date: "2026-03-11" },
  { id: "4", author: "Grace Johnson", content: "The worship at yesterday's service was incredible! Glory to God.", type: "general", likes: 32, comments: 8, visible: true, pinned: false, date: "2026-03-10" },
  { id: "5", author: "Michael Chen", content: "Youth group is organizing a beach cleanup this Saturday at 9 AM. Join us!", type: "announcement", likes: 28, comments: 15, visible: true, pinned: false, date: "2026-03-10" },
  { id: "6", author: "Anonymous", content: "I just want to say that this church changed my life. Thank you for being a welcoming community.", type: "testimony", likes: 56, comments: 19, visible: true, pinned: false, date: "2026-03-09" },
  { id: "7", author: "David Lee", content: "Please keep our missions team in your prayers as they travel to Guatemala this week.", type: "prayer_request", likes: 41, comments: 11, visible: true, pinned: false, date: "2026-03-08" },
  { id: "8", author: "Flagged User", content: "This post contains inappropriate content that was flagged by community members.", type: "general", likes: 2, comments: 1, visible: false, pinned: false, date: "2026-03-07" },
]

const typeColors: Record<string, string> = {
  general: "bg-gray-100 text-gray-800",
  prayer_request: "bg-red-100 text-red-800",
  testimony: "bg-green-100 text-green-800",
  announcement: "bg-orange-100 text-orange-800",
}

const typeLabels: Record<string, string> = {
  general: "General",
  prayer_request: "Prayer Request",
  testimony: "Testimony",
  announcement: "Announcement",
}

export default function AdminCommunityPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filtered = samplePosts.filter((p) => {
    const matchSearch =
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || p.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Wall</h1>
        <p className="text-muted-foreground">Moderate community posts and discussions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search posts or authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Post Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="prayer_request">Prayer Request</SelectItem>
                <SelectItem value="testimony">Testimony</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((post) => (
              <div
                key={post.id}
                className={`rounded-lg border p-4 ${!post.visible ? "opacity-60 bg-muted/50" : ""} ${post.pinned ? "border-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-9 w-9 mt-0.5">
                      <AvatarFallback className="text-xs">
                        {post.author.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{post.author}</span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[post.type]}`}>
                          {typeLabels[post.type]}
                        </span>
                        {post.pinned && (
                          <Badge variant="outline" className="text-xs">
                            <Pin className="mr-1 h-3 w-3" />Pinned
                          </Badge>
                        )}
                        {!post.visible && (
                          <Badge variant="destructive" className="text-xs">Hidden</Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1.5">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" /> {post.comments}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />View Full Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(post.visible ? "Post hidden" : "Post visible")}>
                        {post.visible ? <><EyeOff className="mr-2 h-4 w-4" />Hide Post</> : <><Eye className="mr-2 h-4 w-4" />Show Post</>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(post.pinned ? "Post unpinned" : "Post pinned")}>
                        {post.pinned ? <><PinOff className="mr-2 h-4 w-4" />Unpin</> : <><Pin className="mr-2 h-4 w-4" />Pin</>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => toast.success("Post deleted")}>
                        <Trash2 className="mr-2 h-4 w-4" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
