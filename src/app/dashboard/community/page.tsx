"use client"

import React, { useEffect, useState } from "react"
import {
  ThumbsUp,
  MessageSquare,
  Send,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  Info,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Types matching the /api/posts response
// ---------------------------------------------------------------------------

type ApiUser = {
  id: string
  fullName: string | null
  avatarUrl: string | null
}

type ApiPost = {
  id: string
  userId: string
  content: string
  postType: "general" | "prayer_request" | "testimony" | "announcement"
  mediaUrls: string[] | null
  isPinned: boolean
  isVisible: boolean
  createdAt: string
  updatedAt: string
  user: ApiUser
  _count?: { comments: number; likes: number }
}

const postTypes = ["general", "prayer_request", "testimony", "announcement"] as const
type PostType = typeof postTypes[number]

const tabs = ["All", "Prayer Requests", "Testimonies", "Announcements"] as const

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

const typeLabel: Record<PostType, string> = {
  general: "General",
  prayer_request: "Prayer Request",
  testimony: "Testimony",
  announcement: "Announcement",
}

const typeColors: Record<PostType, string> = {
  general: "bg-gray-100 text-gray-700",
  prayer_request: "bg-purple-100 text-purple-700",
  testimony: "bg-green-100 text-green-700",
  announcement: "bg-red-100 text-red-700",
}

function initialsFromName(name: string | null | undefined): string {
  if (!name) return "U"
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U"
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const diffMs = Date.now() - then
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CommunityPage() {
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newPostContent, setNewPostContent] = useState("")
  const [newPostType, setNewPostType] = useState<PostType>("general")
  const [expandedComments, setExpandedComments] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All")

  // Local optimistic likes (the like API isn't wired yet — keep client-only state).
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [likeDeltas, setLikeDeltas] = useState<Record<string, number>>({})

  const loadPosts = async () => {
    try {
      const res = await fetch("/api/posts", { cache: "no-store" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Failed to load posts (${res.status})`)
      }
      const json = await res.json()
      setPosts(json.posts ?? [])
      setError(null)
    } catch (e: any) {
      console.error("Failed to load posts:", e)
      setError(e?.message || "Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const isLiked = !!prev[postId]
      const next = { ...prev, [postId]: !isLiked }
      setLikeDeltas((d) => ({ ...d, [postId]: (d[postId] ?? 0) + (isLiked ? -1 : 1) }))
      return next
    })
  }

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    )
  }

  const createPost = async () => {
    const content = newPostContent.trim()
    if (!content || posting) return
    setPosting(true)
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postType: newPostType }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 401) {
          toast.error("Please sign in to post.")
        } else {
          toast.error(body.error || "Failed to publish post")
        }
        return
      }
      const created: ApiPost = await res.json()
      // The API marks new posts visible by default, so they appear immediately.
      setPosts((prev) => [created, ...prev])
      setNewPostContent("")
      setNewPostType("general")
      toast.success(
        created.isVisible
          ? "Post published!"
          : "Submitted — your post is awaiting moderation."
      )
    } catch (e: any) {
      console.error("Failed to create post:", e)
      toast.error("Failed to publish post")
    } finally {
      setPosting(false)
    }
  }

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "All") return true
    if (activeTab === "Prayer Requests") return p.postType === "prayer_request"
    if (activeTab === "Testimonies") return p.postType === "testimony"
    if (activeTab === "Announcements") return p.postType === "announcement"
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Community</h2>
        <p className="text-muted-foreground">
          Share, encourage, and pray for one another.
        </p>
      </div>

      {/* Create Post */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder="Share something with the community..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={3}
            disabled={posting}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {postTypes.map((type) => (
                <Button
                  key={type}
                  variant={newPostType === type ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setNewPostType(type)}
                  disabled={posting}
                >
                  {typeLabel[type]}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={createPost}
                disabled={!newPostContent.trim() || posting}
              >
                {posting ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1.5" />
                )}
                Post
              </Button>
            </div>
          </div>
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            <span>
              Posts are public to the church community. Inappropriate content may be
              hidden by moderators.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full sm:w-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-xs">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading posts...
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 text-destructive text-sm">{error}</div>
        )}

        {!loading && !error &&
          filteredPosts.map((post) => {
            const commentsExpanded = expandedComments.includes(post.id)
            const baseLikes = post._count?.likes ?? 0
            const likes = baseLikes + (likeDeltas[post.id] ?? 0)
            const liked = !!likedPosts[post.id]
            const author = post.user?.fullName ?? "Member"
            const initials = initialsFromName(post.user?.fullName)
            const commentCount = post._count?.comments ?? 0

            return (
              <Card key={post.id}>
                <CardContent className="p-4 space-y-3">
                  {/* Author Row */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.user?.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{author}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {relativeTime(post.createdAt)}
                      </p>
                    </div>
                    <Badge className={cn("text-[10px]", typeColors[post.postType])}>
                      {typeLabel[post.postType]}
                    </Badge>
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-1">
                    <button
                      className={cn(
                        "flex items-center gap-1.5 text-sm transition-colors",
                        liked
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-primary"
                      )}
                      onClick={() => toggleLike(post.id)}
                    >
                      <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
                      {likes}
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {commentCount}
                      {commentsExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {/* Comments Section (placeholder until comments API is wired) */}
                  {commentsExpanded && (
                    <div className="space-y-3 pt-2">
                      <Separator />
                      <p className="text-xs text-muted-foreground italic">
                        Comments are coming soon.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No posts in this category yet. Be the first to share!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
