"use client"

import { useState } from "react"
import {
  Radio,
  Wifi,
  WifiOff,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Square,
  Tv,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface RadioChannel {
  id: string
  name: string
  url: string
  status: "active" | "inactive"
  listeners: number
}

const sampleRadioChannels: RadioChannel[] = [
  { id: "1", name: "Grace FM - Worship", url: "https://stream.gracefm.com/worship", status: "active", listeners: 145 },
  { id: "2", name: "Grace FM - Sermons", url: "https://stream.gracefm.com/sermons", status: "active", listeners: 89 },
  { id: "3", name: "Grace FM - 24/7 Prayer", url: "https://stream.gracefm.com/prayer", status: "inactive", listeners: 0 },
  { id: "4", name: "Grace FM - Youth", url: "https://stream.gracefm.com/youth", status: "active", listeners: 52 },
]

export default function AdminLivestreamPage() {
  const [isLive, setIsLive] = useState(false)
  const [streamUrl, setStreamUrl] = useState("rtmp://stream.church.org/live")
  const [streamType, setStreamType] = useState("rtmp")
  const [radioDialogOpen, setRadioDialogOpen] = useState(false)

  const toggleLivestream = () => {
    setIsLive(!isLive)
    toast.success(isLive ? "Livestream stopped" : "Livestream started")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Livestream & Radio</h1>
        <p className="text-muted-foreground">Manage live broadcasts and radio channels</p>
      </div>

      {/* Livestream Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${isLive ? "bg-red-100" : "bg-gray-100"}`}>
                {isLive ? (
                  <Wifi className="h-5 w-5 text-red-600 animate-pulse" />
                ) : (
                  <WifiOff className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">Livestream Status</CardTitle>
                <CardDescription>
                  {isLive ? "Currently broadcasting live" : "No active livestream"}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isLive ? "destructive" : "secondary"} className="text-sm px-3 py-1">
              {isLive ? "LIVE" : "OFFLINE"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Stream URL</Label>
              <Input
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="Enter stream URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Stream Type</Label>
              <Select value={streamType} onValueChange={setStreamType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rtmp">RTMP</SelectItem>
                  <SelectItem value="m3u8">M3U8 (HLS)</SelectItem>
                  <SelectItem value="youtube">YouTube Live</SelectItem>
                  <SelectItem value="facebook">Facebook Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload livestream thumbnail</p>
                </div>
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={toggleLivestream}
              variant={isLive ? "destructive" : "default"}
              className="w-40"
            >
              {isLive ? (
                <><Square className="mr-2 h-4 w-4" />Stop Stream</>
              ) : (
                <><Play className="mr-2 h-4 w-4" />Start Stream</>
              )}
            </Button>
            {isLive && (
              <Button variant="outline">
                <Tv className="mr-2 h-4 w-4" />
                Preview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Radio Channels */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Radio Channels</CardTitle>
            <CardDescription>Manage streaming radio channels</CardDescription>
          </div>
          <Dialog open={radioDialogOpen} onOpenChange={setRadioDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Channel</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Add Radio Channel</DialogTitle>
                <DialogDescription>Configure a new radio streaming channel.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Channel Name</Label>
                  <Input placeholder="e.g., Grace FM - Gospel" />
                </div>
                <div className="grid gap-2">
                  <Label>Stream URL</Label>
                  <Input placeholder="https://stream.example.com/channel" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch defaultChecked />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRadioDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => { toast.success("Channel added"); setRadioDialogOpen(false) }}>Add Channel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel Name</TableHead>
                <TableHead className="hidden sm:table-cell">Stream URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Listeners</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleRadioChannels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{channel.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px] block">
                      {channel.url}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={channel.status === "active" ? "default" : "secondary"}>
                      {channel.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{channel.listeners}</TableCell>
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
