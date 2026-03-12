"use client"

import React, { useState } from "react"
import {
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Camera,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Photo {
  id: string
  url?: string
  caption: string
}

interface Album {
  id: string
  title: string
  description: string
  date: string
  coverColor: string
  photoCount: number
  photos: Photo[]
}

const albums: Album[] = [
  {
    id: "1",
    title: "Sunday Worship Service - March 2026",
    description: "Highlights from our worship services this month",
    date: "2026-03-09",
    coverColor: "bg-blue-200",
    photoCount: 12,
    photos: [
      { id: "p1", caption: "Praise and worship session" },
      { id: "p2", caption: "Pastor James delivering the Word" },
      { id: "p3", caption: "Choir ministration" },
      { id: "p4", caption: "Congregation in worship" },
      { id: "p5", caption: "Altar call moment" },
      { id: "p6", caption: "Fellowship after service" },
      { id: "p7", caption: "Children's church presentation" },
      { id: "p8", caption: "New members dedication" },
      { id: "p9", caption: "Prayer ministry time" },
      { id: "p10", caption: "Music team rehearsal" },
      { id: "p11", caption: "Sunday school class" },
      { id: "p12", caption: "Church family photo" },
    ],
  },
  {
    id: "2",
    title: "Youth Camp 2026",
    description: "Annual youth camp at the retreat center",
    date: "2026-02-15",
    coverColor: "bg-green-200",
    photoCount: 8,
    photos: [
      { id: "p13", caption: "Camp registration" },
      { id: "p14", caption: "Campfire worship night" },
      { id: "p15", caption: "Team building activities" },
      { id: "p16", caption: "Bible study groups" },
      { id: "p17", caption: "Sports tournament" },
      { id: "p18", caption: "Talent show" },
      { id: "p19", caption: "Group photo" },
      { id: "p20", caption: "Closing ceremony" },
    ],
  },
  {
    id: "3",
    title: "Community Outreach - January",
    description: "Food distribution and community service",
    date: "2026-01-25",
    coverColor: "bg-amber-200",
    photoCount: 6,
    photos: [
      { id: "p21", caption: "Food preparation" },
      { id: "p22", caption: "Distribution line" },
      { id: "p23", caption: "Volunteers in action" },
      { id: "p24", caption: "Community prayers" },
      { id: "p25", caption: "Children receiving gifts" },
      { id: "p26", caption: "Thank you from the community" },
    ],
  },
  {
    id: "4",
    title: "Christmas Celebration 2025",
    description: "Christmas carol service and celebrations",
    date: "2025-12-25",
    coverColor: "bg-red-200",
    photoCount: 10,
    photos: [
      { id: "p27", caption: "Christmas decorations" },
      { id: "p28", caption: "Carol service" },
      { id: "p29", caption: "Nativity drama" },
      { id: "p30", caption: "Children's Christmas party" },
      { id: "p31", caption: "Gift exchange" },
      { id: "p32", caption: "Christmas dinner" },
      { id: "p33", caption: "Church choir special" },
      { id: "p34", caption: "Family photos" },
      { id: "p35", caption: "Candle light service" },
      { id: "p36", caption: "New Year countdown" },
    ],
  },
  {
    id: "5",
    title: "Church Anniversary",
    description: "Celebrating 15 years of God's faithfulness",
    date: "2025-11-10",
    coverColor: "bg-purple-200",
    photoCount: 9,
    photos: [
      { id: "p37", caption: "Anniversary banner" },
      { id: "p38", caption: "Founders and elders" },
      { id: "p39", caption: "Special ministration" },
      { id: "p40", caption: "Anniversary cake cutting" },
      { id: "p41", caption: "Guest speakers" },
      { id: "p42", caption: "Anniversary dinner" },
      { id: "p43", caption: "Awards ceremony" },
      { id: "p44", caption: "Cultural dance" },
      { id: "p45", caption: "Group celebration" },
    ],
  },
]

// Generate a deterministic pastel color for placeholder photos
function photoColor(photoId: string) {
  const colors = [
    "bg-blue-100", "bg-green-100", "bg-amber-100", "bg-rose-100",
    "bg-purple-100", "bg-teal-100", "bg-indigo-100", "bg-orange-100",
  ]
  const idx = photoId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[idx % colors.length]
}

export default function GalleryPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [lightboxPhoto, setLightboxPhoto] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxPhoto(index)
  const closeLightbox = () => setLightboxPhoto(null)

  const navigateLightbox = (dir: -1 | 1) => {
    if (lightboxPhoto === null || !selectedAlbum) return
    const newIdx = lightboxPhoto + dir
    if (newIdx >= 0 && newIdx < selectedAlbum.photos.length) {
      setLightboxPhoto(newIdx)
    }
  }

  // Album detail view
  if (selectedAlbum) {
    const currentPhoto = lightboxPhoto !== null ? selectedAlbum.photos[lightboxPhoto] : null

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedAlbum(null)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          <div>
            <h2 className="text-xl font-bold">{selectedAlbum.title}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedAlbum.photoCount} photos &middot;{" "}
              {new Date(selectedAlbum.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {selectedAlbum.photos.map((photo, index) => (
            <div
              key={photo.id}
              className={cn(
                "aspect-square rounded-lg cursor-pointer overflow-hidden group relative",
                photoColor(photo.id)
              )}
              onClick={() => openLightbox(index)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                <p className="text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                  {photo.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        <Dialog open={lightboxPhoto !== null} onOpenChange={closeLightbox}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/95 border-0">
            {currentPhoto && (
              <div className="relative">
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
                  onClick={closeLightbox}
                >
                  <X className="h-5 w-5" />
                </Button>

                {/* Photo placeholder */}
                <div className={cn("aspect-video flex items-center justify-center", photoColor(currentPhoto.id))}>
                  <Camera className="h-16 w-16 text-muted-foreground/30" />
                </div>

                {/* Navigation */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white hover:bg-white/20 ml-2"
                    onClick={() => navigateLightbox(-1)}
                    disabled={lightboxPhoto === 0}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white hover:bg-white/20 mr-2"
                    onClick={() => navigateLightbox(1)}
                    disabled={lightboxPhoto === selectedAlbum.photos.length - 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>

                {/* Caption */}
                <div className="p-4 text-center">
                  <p className="text-white text-sm">{currentPhoto.caption}</p>
                  <p className="text-white/50 text-xs mt-1">
                    {(lightboxPhoto ?? 0) + 1} of {selectedAlbum.photos.length}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Albums grid view
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gallery</h2>
        <p className="text-muted-foreground">Photos from church events and activities.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map((album) => (
          <Card
            key={album.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => setSelectedAlbum(album)}
          >
            <div className={cn("aspect-video relative flex items-center justify-center", album.coverColor)}>
              <Camera className="h-12 w-12 text-muted-foreground/30" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <Badge
                variant="secondary"
                className="absolute bottom-2 right-2 text-[10px] bg-black/50 text-white border-0"
              >
                {album.photoCount} photos
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {album.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{album.description}</p>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-2">
                <Calendar className="h-3 w-3" />
                {new Date(album.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No albums yet.</p>
        </div>
      )}
    </div>
  )
}
