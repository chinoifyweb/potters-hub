"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Share2,
  BookmarkPlus,
  ChevronLeft,
  Clock,
  Calendar,
  User,
  BookOpen,
  Plus,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const sermon = {
  id: "sermon-1",
  title: "The Power of Prayer",
  speaker: "Pastor James Okonkwo",
  date: "2026-03-09",
  duration: "48:32",
  durationSeconds: 2912,
  category: "Prayer",
  series: "Prayer Series",
  scripture: "Matthew 6:5-13",
  description:
    "In this powerful message, Pastor James takes us through Jesus' teaching on prayer from the Sermon on the Mount. We explore the Lord's Prayer line by line and discover how to develop a deeper, more meaningful prayer life. Whether you are new to prayer or have been praying for decades, this sermon will challenge and inspire you to draw closer to God through the discipline of prayer.",
  type: "video" as const,
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
}

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

interface Note {
  id: string
  text: string
  timestamp: number
  createdAt: string
}

const initialNotes: Note[] = [
  {
    id: "n1",
    text: "Key point: Prayer is not about the length of words but the sincerity of heart.",
    timestamp: 320,
    createdAt: "2026-03-09T10:15:00",
  },
  {
    id: "n2",
    text: "Matthew 6:6 - Go into your room, close the door, and pray to your Father who is unseen.",
    timestamp: 845,
    createdAt: "2026-03-09T10:22:00",
  },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function SermonPlayerPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [volume, setVolume] = useState(80)
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [newNote, setNewNote] = useState("")
  const [showVideo, setShowVideo] = useState(true)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= sermon.durationSeconds) {
            setIsPlaying(false)
            return sermon.durationSeconds
          }
          return prev + speed
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, speed])

  const togglePlay = () => setIsPlaying(!isPlaying)
  const skipForward = () => setCurrentTime((prev) => Math.min(prev + 30, sermon.durationSeconds))
  const skipBack = () => setCurrentTime((prev) => Math.max(prev - 15, 0))

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const cycleSpeed = () => {
    const idx = speeds.indexOf(speed)
    setSpeed(speeds[(idx + 1) % speeds.length])
  }

  const addNote = () => {
    if (!newNote.trim()) return
    const note: Note = {
      id: `n${Date.now()}`,
      text: newNote,
      timestamp: currentTime,
      createdAt: new Date().toISOString(),
    }
    setNotes([...notes, note])
    setNewNote("")
    toast.success("Note added")
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
    toast.success("Note deleted")
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast.success("Link copied to clipboard")
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/sermons">
        <Button variant="ghost" size="sm" className="gap-1 -ml-2">
          <ChevronLeft className="h-4 w-4" /> Back to Sermons
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video/Audio Player Area */}
          {showVideo && sermon.type === "video" ? (
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center text-white/60">
                <Play className="h-16 w-16 mx-auto mb-2" />
                <p className="text-sm">Video Player Placeholder</p>
              </div>
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Volume2 className="h-16 w-16 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold text-center">{sermon.title}</h3>
                <p className="text-sm text-muted-foreground">{sermon.speaker}</p>
              </CardContent>
            </Card>
          )}

          {/* Audio Controls */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={sermon.durationSeconds}
                  step={1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{sermon.duration}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" onClick={skipBack} title="Back 15s">
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={skipForward} title="Forward 30s">
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Secondary Controls */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 min-w-[48px]"
                  onClick={cycleSpeed}
                >
                  {speed}x
                </Button>

                {sermon.type === "video" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setShowVideo(!showVideo)}
                  >
                    {showVideo ? "Audio Only" : "Show Video"}
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={(v) => setVolume(v[0])}
                    className="w-24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sermon Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{sermon.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{sermon.speaker}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(sermon.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{sermon.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>{sermon.scripture}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{sermon.category}</Badge>
                <Badge variant="outline">{sermon.series}</Badge>
              </div>

              <Separator />

              <p className="text-sm leading-relaxed text-muted-foreground">
                {sermon.description}
              </p>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1.5" /> Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Sermon bookmarked")}
                >
                  <BookmarkPlus className="h-4 w-4 mr-1.5" /> Bookmark
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">My Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note about this sermon..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button size="sm" onClick={addNote} className="w-full">
                  <Plus className="h-4 w-4 mr-1.5" /> Add Note at {formatTime(currentTime)}
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No notes yet. Start taking notes while listening!
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="group rounded-lg border p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          className="text-xs font-medium text-primary hover:underline"
                          onClick={() => setCurrentTime(note.timestamp)}
                        >
                          {formatTime(note.timestamp)}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                      <p className="text-sm leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
