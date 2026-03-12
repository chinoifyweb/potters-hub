"use client"

import React, { useState } from "react"
import {
  ThumbsUp,
  MessageSquare,
  Send,
  ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Comment {
  id: string
  author: string
  initials: string
  avatar?: string
  text: string
  time: string
}

interface Post {
  id: string
  author: string
  avatar?: string
  initials: string
  content: string
  type: "General" | "Prayer Request" | "Testimony" | "Announcement"
  likes: number
  liked: boolean
  comments: Comment[]
  time: string
  image?: string
}

const initialPosts: Post[] = [
  {
    id: "1",
    author: "Sarah Adeyemi",
    initials: "SA",
    content: "God has been so faithful! I got the job I've been praying about for months. After 6 months of trusting God, He came through! Please join me in praising God for His goodness!",
    type: "Testimony",
    likes: 24,
    liked: false,
    time: "2h ago",
    comments: [
      { id: "c1", author: "Grace Eze", initials: "GE", text: "Praise God! He is always faithful!", time: "1h ago" },
      { id: "c2", author: "Paul Mensah", initials: "PM", text: "Congratulations! God is good all the time!", time: "45m ago" },
    ],
  },
  {
    id: "2",
    author: "Brother Michael",
    initials: "BM",
    content: "Please keep my family in your prayers as we go through a challenging season. My mother is in the hospital and we're believing God for a complete healing. God is able!",
    type: "Prayer Request",
    likes: 31,
    liked: true,
    time: "5h ago",
    comments: [
      { id: "c3", author: "Ruth Adebayo", initials: "RA", text: "Praying for your mother, Brother Michael. God is the great physician.", time: "4h ago" },
      { id: "c4", author: "John Doe", initials: "JD", text: "Standing with you in prayer. Isaiah 53:5.", time: "3h ago" },
      { id: "c5", author: "Mary Taiwo", initials: "MT", text: "The Lord will perfect everything concerning your mother. Amen.", time: "2h ago" },
    ],
  },
  {
    id: "3",
    author: "Pastor James Okonkwo",
    initials: "JO",
    content: "Reminder: Our annual church picnic is coming up on March 29th! Bring your family and friends for a wonderful time of fellowship, food, and fun. Don't forget to register at the church office.",
    type: "Announcement",
    likes: 45,
    liked: false,
    time: "8h ago",
    comments: [
      { id: "c6", author: "Kemi Adeyinka", initials: "KA", text: "Can't wait! Already registered my family.", time: "7h ago" },
    ],
  },
  {
    id: "4",
    author: "Tunde Bakare",
    initials: "TB",
    content: "Today's morning devotion really blessed me. The scripture reading from Psalm 23 reminded me that even in the valley, God is with us. He is our shepherd and we shall not want.",
    type: "General",
    likes: 18,
    liked: false,
    time: "12h ago",
    comments: [],
  },
  {
    id: "5",
    author: "Sister Ngozi Okonkwo",
    initials: "NO",
    content: "I want to testify about God's faithfulness in my children's education. Both of them got scholarships to study abroad! Only God can do this! All glory to His name!",
    type: "Testimony",
    likes: 52,
    liked: true,
    time: "1d ago",
    comments: [
      { id: "c7", author: "Ada Nweke", initials: "AN", text: "What an amazing testimony! Our God is able!", time: "23h ago" },
    ],
  },
]

const postTypes = ["General", "Prayer Request", "Testimony", "Announcement"] as const
const tabs = ["All", "Prayer Requests", "Testimonies", "Announcements"]

const typeColors: Record<string, string> = {
  "General": "bg-gray-100 text-gray-700",
  "Prayer Request": "bg-purple-100 text-purple-700",
  "Testimony": "bg-green-100 text-green-700",
  "Announcement": "bg-red-100 text-red-700",
}

export default function CommunityPage() {
  const [posts, setPosts] = useState(initialPosts)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostType, setNewPostType] = useState<typeof postTypes[number]>("General")
  const [expandedComments, setExpandedComments] = useState<string[]>([])
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("All")

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    )
  }

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    )
  }

  const addComment = (postId: string) => {
    const text = commentText[postId]?.trim()
    if (!text) return
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c${Date.now()}`,
                  author: "John Doe",
                  initials: "JD",
                  text,
                  time: "Just now",
                },
              ],
            }
          : p
      )
    )
    setCommentText((prev) => ({ ...prev, [postId]: "" }))
    toast.success("Comment added")
  }

  const createPost = () => {
    if (!newPostContent.trim()) return
    const newPost: Post = {
      id: `p${Date.now()}`,
      author: "John Doe",
      initials: "JD",
      content: newPostContent,
      type: newPostType,
      likes: 0,
      liked: false,
      comments: [],
      time: "Just now",
    }
    setPosts([newPost, ...posts])
    setNewPostContent("")
    toast.success("Post published!")
  }

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "All") return true
    if (activeTab === "Prayer Requests") return p.type === "Prayer Request"
    if (activeTab === "Testimonies") return p.type === "Testimony"
    if (activeTab === "Announcements") return p.type === "Announcement"
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Community</h2>
        <p className="text-muted-foreground">Share, encourage, and pray for one another.</p>
      </div>

      {/* Create Post */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder="Share something with the community..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={3}
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
                >
                  {type}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={createPost} disabled={!newPostContent.trim()}>
                <Send className="h-4 w-4 mr-1.5" /> Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
        {filteredPosts.map((post) => {
          const commentsExpanded = expandedComments.includes(post.id)
          return (
            <Card key={post.id}>
              <CardContent className="p-4 space-y-3">
                {/* Author Row */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.avatar} />
                    <AvatarFallback className="text-xs">{post.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{post.author}</p>
                    <p className="text-[11px] text-muted-foreground">{post.time}</p>
                  </div>
                  <Badge className={cn("text-[10px]", typeColors[post.type] || "")}>
                    {post.type}
                  </Badge>
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-1">
                  <button
                    className={cn(
                      "flex items-center gap-1.5 text-sm transition-colors",
                      post.liked ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => toggleLike(post.id)}
                  >
                    <ThumbsUp className={cn("h-4 w-4", post.liked && "fill-current")} />
                    {post.likes}
                  </button>
                  <button
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {post.comments.length}
                    {commentsExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {/* Comments Section */}
                {commentsExpanded && (
                  <div className="space-y-3 pt-2">
                    <Separator />
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={comment.avatar} />
                          <AvatarFallback className="text-[9px]">{comment.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-medium">{comment.author}</span>
                            <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                          </div>
                          <p className="text-sm mt-0.5">{comment.text}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary">JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          value={commentText[post.id] || ""}
                          onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                          className="h-8 text-sm"
                          onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                        />
                        <Button
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => addComment(post.id)}
                          disabled={!commentText[post.id]?.trim()}
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No posts in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
