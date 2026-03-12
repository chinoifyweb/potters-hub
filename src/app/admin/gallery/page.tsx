"use client"

import { useState } from "react"
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Image as ImageIcon,
  Upload,
  ArrowLeft,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { toast } from "sonner"

interface Album {
  id: string
  title: string
  description: string
  coverUrl: string
  photoCount: number
  createdAt: string
}

interface Photo {
  id: string
  url: string
  caption: string
  albumId: string
}

const sampleAlbums: Album[] = [
  { id: "1", title: "Sunday Service - March 2026", description: "Photos from our Sunday services in March", coverUrl: "", photoCount: 24, createdAt: "2026-03-01" },
  { id: "2", title: "Youth Conference 2026", description: "Highlights from the annual youth conference", coverUrl: "", photoCount: 56, createdAt: "2026-02-15" },
  { id: "3", title: "Christmas Celebration 2025", description: "Christmas Eve and Christmas Day services", coverUrl: "", photoCount: 38, createdAt: "2025-12-25" },
  { id: "4", title: "Community Outreach", description: "Photos from our community service events", coverUrl: "", photoCount: 19, createdAt: "2026-01-20" },
  { id: "5", title: "Baptism Service", description: "Baptism service photos", coverUrl: "", photoCount: 15, createdAt: "2026-02-08" },
  { id: "6", title: "Worship Night", description: "Special worship night event", coverUrl: "", photoCount: 32, createdAt: "2026-02-22" },
]

const samplePhotos: Photo[] = [
  { id: "p1", url: "", caption: "Praise and worship session", albumId: "1" },
  { id: "p2", url: "", caption: "Pastor delivering the sermon", albumId: "1" },
  { id: "p3", url: "", caption: "Congregation in prayer", albumId: "1" },
  { id: "p4", url: "", caption: "Choir performance", albumId: "1" },
  { id: "p5", url: "", caption: "Children's ministry", albumId: "1" },
  { id: "p6", url: "", caption: "Fellowship after service", albumId: "1" },
]

export default function AdminGalleryPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  if (selectedAlbum) {
    const photos = samplePhotos.filter((p) => p.albumId === selectedAlbum.id)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedAlbum(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{selectedAlbum.title}</h1>
            <p className="text-muted-foreground">{selectedAlbum.description}</p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button><Upload className="mr-2 h-4 w-4" />Upload Photos</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Photos</DialogTitle>
                <DialogDescription>Add photos to {selectedAlbum.title}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium">Click to upload photos</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WebP (max 10MB each)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" multiple />
                  </label>
                </div>
                <div className="grid gap-2">
                  <Label>Caption (optional)</Label>
                  <Input placeholder="Describe this photo" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => { toast.success("Photos uploaded"); setUploadDialogOpen(false) }}>Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden group relative">
              <div className="aspect-square bg-muted flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <div className="w-full p-3 flex items-center justify-between">
                  <p className="text-white text-xs truncate flex-1">{photo.caption}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={() => toast.success("Photo deleted")}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
          <p className="text-muted-foreground">Manage photo albums and media</p>
        </div>
        <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create Album</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Create New Album</DialogTitle>
              <DialogDescription>Create a new photo album.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Album Title</Label>
                <Input placeholder="e.g., Sunday Service - March 2026" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief description of the album" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAlbumDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => { toast.success("Album created"); setAlbumDialogOpen(false) }}>Create Album</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sampleAlbums.map((album) => (
          <Card
            key={album.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedAlbum(album)}
          >
            <div className="aspect-video bg-muted flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{album.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{album.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {album.photoCount} photos
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(album.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
