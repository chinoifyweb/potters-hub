"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Grid3X3,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Sermon {
  id: string
  title: string
  speaker: string
  date: string
  category: string
  duration: string
  views: number
  featured: boolean
  published: boolean
  thumbnail?: string
}

const sampleSermons: Sermon[] = [
  { id: "1", title: "Walking in Faith", speaker: "Pastor David", date: "2026-03-10", category: "Faith", duration: "45:30", views: 1234, featured: true, published: true },
  { id: "2", title: "The Power of Prayer", speaker: "Pastor Sarah", date: "2026-03-03", category: "Prayer", duration: "38:15", views: 986, featured: false, published: true },
  { id: "3", title: "Grace Abounding", speaker: "Pastor David", date: "2026-02-24", category: "Grace", duration: "42:00", views: 1567, featured: true, published: true },
  { id: "4", title: "Living in Community", speaker: "Elder Michael", date: "2026-02-17", category: "Community", duration: "35:45", views: 723, featured: false, published: true },
  { id: "5", title: "The Beatitudes", speaker: "Pastor David", date: "2026-02-10", category: "Teaching", duration: "52:10", views: 2100, featured: false, published: true },
  { id: "6", title: "Hope in Trials", speaker: "Pastor Sarah", date: "2026-02-03", category: "Hope", duration: "40:20", views: 890, featured: false, published: false },
  { id: "7", title: "Worship in Spirit", speaker: "Music Pastor John", date: "2026-01-27", category: "Worship", duration: "48:00", views: 1450, featured: true, published: true },
  { id: "8", title: "Family Values", speaker: "Elder Ruth", date: "2026-01-20", category: "Family", duration: "37:55", views: 670, featured: false, published: true },
]

export default function AdminSermonsPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [speakerFilter, setSpeakerFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const categories = Array.from(new Set(sampleSermons.map((s) => s.category)))
  const speakers = Array.from(new Set(sampleSermons.map((s) => s.speaker)))

  const filtered = sampleSermons.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === "all" || s.category === categoryFilter
    const matchSpeaker = speakerFilter === "all" || s.speaker === speakerFilter
    return matchSearch && matchCategory && matchSpeaker
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sermons</h1>
          <p className="text-muted-foreground">
            Manage sermons and messages
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/sermons/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Sermon
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sermons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={speakerFilter} onValueChange={setSpeakerFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Speaker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Speakers</SelectItem>
                  {speakers.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-10 w-10 rounded-r-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-10 w-10 rounded-l-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "list" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Speaker</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Duration</TableHead>
                  <TableHead className="hidden lg:table-cell">Views</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sermon) => (
                  <TableRow key={sermon.id}>
                    <TableCell className="font-medium">{sermon.title}</TableCell>
                    <TableCell>{sermon.speaker}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(sermon.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">{sermon.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{sermon.duration}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {sermon.views.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {sermon.featured ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sermon.published ? "default" : "secondary"}>
                        {sermon.published ? "Published" : "Draft"}
                      </Badge>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {sermon.featured ? (
                              <>
                                <StarOff className="mr-2 h-4 w-4" />
                                Unfeature
                              </>
                            ) : (
                              <>
                                <Star className="mr-2 h-4 w-4" />
                                Feature
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {sermon.published ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((sermon) => (
                <Card key={sermon.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground">
                      {sermon.category.charAt(0)}
                    </span>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{sermon.title}</h3>
                    <p className="text-sm text-muted-foreground">{sermon.speaker}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{sermon.duration}</span>
                      <div className="flex items-center gap-2">
                        {sermon.featured && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                        <Badge variant={sermon.published ? "default" : "secondary"} className="text-xs">
                          {sermon.published ? "Live" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
