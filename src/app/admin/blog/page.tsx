"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

interface BlogPost {
  id: string
  title: string
  author: string
  excerpt: string
  published: boolean
  date: string
  readTime: string
  category: string
}

const samplePosts: BlogPost[] = [
  { id: "1", title: "Finding Purpose in Your Daily Walk", author: "Pastor David", excerpt: "Discovering how to align your daily activities with God's purpose...", published: true, date: "2026-03-12", readTime: "5 min", category: "Spiritual Growth" },
  { id: "2", title: "The Importance of Community", author: "Elder Michael", excerpt: "Why fellowship and community are essential for spiritual growth...", published: true, date: "2026-03-10", readTime: "7 min", category: "Community" },
  { id: "3", title: "Navigating Life's Challenges with Faith", author: "Pastor Sarah", excerpt: "Practical strategies for maintaining faith during difficult times...", published: true, date: "2026-03-08", readTime: "6 min", category: "Faith" },
  { id: "4", title: "Youth Ministry Update - Spring 2026", author: "Daniel Kim", excerpt: "Exciting updates and upcoming events from our youth ministry...", published: true, date: "2026-03-06", readTime: "4 min", category: "Ministry Update" },
  { id: "5", title: "Preparing for Easter: A Guide for Families", author: "Ruth Garcia", excerpt: "Activities and reflections to help your family prepare for Easter...", published: false, date: "2026-03-04", readTime: "8 min", category: "Family" },
  { id: "6", title: "Worship Through Music", author: "Music Pastor John", excerpt: "Understanding the role of music in our worship experience...", published: true, date: "2026-03-02", readTime: "5 min", category: "Worship" },
  { id: "7", title: "Mission Trip Recap: Guatemala 2026", author: "Esther Okafor", excerpt: "Our team shares their experiences from the recent mission trip...", published: false, date: "2026-02-28", readTime: "10 min", category: "Missions" },
]

export default function AdminBlogPage() {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = samplePosts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Manage blog posts and articles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Post</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Blog Post</DialogTitle>
              <DialogDescription>Create a new blog post for the church website.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input placeholder="Post title" />
              </div>
              <div className="grid gap-2">
                <Label>Excerpt</Label>
                <Input placeholder="Brief summary of the post" />
              </div>
              <div className="grid gap-2">
                <Label>Content</Label>
                <Textarea placeholder="Write the blog post content..." rows={8} />
              </div>
              <div className="grid gap-2">
                <Label>Cover Image URL</Label>
                <Input placeholder="https://example.com/image.jpg" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Publish immediately</Label>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => { toast.success("Post created successfully"); setDialogOpen(false) }}>Create Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <span className="font-medium block">{post.title}</span>
                        <span className="text-xs text-muted-foreground hidden lg:block">{post.excerpt}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {post.author.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{post.author}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{post.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(post.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem>
                          {post.published ? <><EyeOff className="mr-2 h-4 w-4" />Unpublish</> : <><Eye className="mr-2 h-4 w-4" />Publish</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
