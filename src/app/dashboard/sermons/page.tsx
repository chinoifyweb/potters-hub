"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Search, Play, Clock, Filter, Grid, List } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const categories = ["All", "Faith", "Prayer", "Family", "Leadership", "Worship", "Youth", "Missions"]
const speakers = ["All Speakers", "Pastor James Okonkwo", "Pastor Grace Eze", "Deacon Paul Mensah", "Sister Ruth Adebayo"]
const seriesOptions = ["All Series", "Prayer Series", "Walking in Faith", "Family Foundations", "Kingdom Leadership"]

const sermons = [
  {
    id: "sermon-1",
    title: "The Power of Prayer",
    speaker: "Pastor James Okonkwo",
    date: "2026-03-09",
    duration: "48:32",
    category: "Prayer",
    series: "Prayer Series",
    thumbnail: "/images/sermon-prayer.jpg",
    type: "video" as const,
    views: 342,
  },
  {
    id: "sermon-2",
    title: "Faith Over Fear",
    speaker: "Pastor Grace Eze",
    date: "2026-03-02",
    duration: "42:15",
    category: "Faith",
    series: "Walking in Faith",
    thumbnail: "/images/sermon-faith.jpg",
    type: "video" as const,
    views: 518,
  },
  {
    id: "sermon-3",
    title: "Building Strong Families",
    speaker: "Deacon Paul Mensah",
    date: "2026-02-23",
    duration: "55:10",
    category: "Family",
    series: "Family Foundations",
    thumbnail: "/images/sermon-family.jpg",
    type: "audio" as const,
    views: 215,
  },
  {
    id: "sermon-4",
    title: "Leading with Purpose",
    speaker: "Pastor James Okonkwo",
    date: "2026-02-16",
    duration: "50:45",
    category: "Leadership",
    series: "Kingdom Leadership",
    thumbnail: "/images/sermon-leadership.jpg",
    type: "video" as const,
    views: 489,
  },
  {
    id: "sermon-5",
    title: "The Heart of Worship",
    speaker: "Sister Ruth Adebayo",
    date: "2026-02-09",
    duration: "38:20",
    category: "Worship",
    series: "Walking in Faith",
    thumbnail: "/images/sermon-worship.jpg",
    type: "audio" as const,
    views: 276,
  },
  {
    id: "sermon-6",
    title: "Pressing Forward in Prayer",
    speaker: "Pastor James Okonkwo",
    date: "2026-02-02",
    duration: "44:55",
    category: "Prayer",
    series: "Prayer Series",
    thumbnail: "/images/sermon-pressing.jpg",
    type: "video" as const,
    views: 403,
  },
  {
    id: "sermon-7",
    title: "Youth on Fire",
    speaker: "Pastor Grace Eze",
    date: "2026-01-26",
    duration: "35:10",
    category: "Youth",
    series: "Walking in Faith",
    thumbnail: "/images/sermon-youth.jpg",
    type: "video" as const,
    views: 612,
  },
  {
    id: "sermon-8",
    title: "The Great Commission",
    speaker: "Deacon Paul Mensah",
    date: "2026-01-19",
    duration: "52:30",
    category: "Missions",
    series: "Kingdom Leadership",
    thumbnail: "/images/sermon-missions.jpg",
    type: "audio" as const,
    views: 188,
  },
]

export default function SermonsPage() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSpeaker, setSelectedSpeaker] = useState("All Speakers")
  const [selectedSeries, setSelectedSeries] = useState("All Series")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [mediaType, setMediaType] = useState<"all" | "video" | "audio">("all")
  const [showFilters, setShowFilters] = useState(false)

  const filtered = sermons.filter((s) => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.speaker.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedCategory !== "All" && s.category !== selectedCategory) return false
    if (selectedSpeaker !== "All Speakers" && s.speaker !== selectedSpeaker) return false
    if (selectedSeries !== "All Series" && s.series !== selectedSeries) return false
    if (mediaType !== "all" && s.type !== mediaType) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sermons</h2>
        <p className="text-muted-foreground">Watch and listen to messages from our pastors.</p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sermons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-accent")}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Audio/Video Toggle */}
      <Tabs value={mediaType} onValueChange={(v) => setMediaType(v as typeof mediaType)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Speaker</label>
                <select
                  value={selectedSpeaker}
                  onChange={(e) => setSelectedSpeaker(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                >
                  {speakers.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Series</label>
                <select
                  value={selectedSeries}
                  onChange={(e) => setSelectedSeries(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                >
                  {seriesOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} sermon{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Sermons Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((sermon) => (
            <Link key={sermon.id} href={`/dashboard/sermons/${sermon.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group h-full">
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-5 w-5 ml-0.5" />
                    </div>
                  </div>
                  <Play className="h-10 w-10 text-muted-foreground/50" />
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="text-[10px] bg-black/70 text-white border-0">
                      {sermon.duration}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant={sermon.type === "video" ? "default" : "secondary"} className="text-[10px]">
                      {sermon.type === "video" ? "Video" : "Audio"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {sermon.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{sermon.speaker}</p>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                    <span>{new Date(sermon.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span>{sermon.views} views</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sermon) => (
            <Link key={sermon.id} href={`/dashboard/sermons/${sermon.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-3 flex gap-4 items-center">
                  <div className="relative h-16 w-24 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    <Play className="h-6 w-6 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    <Badge variant="secondary" className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white border-0">
                      {sermon.duration}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {sermon.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{sermon.speaker}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{new Date(sermon.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span>&middot;</span>
                      <span>{sermon.series}</span>
                      <span>&middot;</span>
                      <Badge variant={sermon.type === "video" ? "default" : "secondary"} className="text-[9px] h-4">
                        {sermon.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {sermon.duration}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sermons found matching your criteria.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedSpeaker("All Speakers"); setSelectedSeries("All Series"); setMediaType("all") }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
