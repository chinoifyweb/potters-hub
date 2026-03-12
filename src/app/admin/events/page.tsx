"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Bell,
  Calendar as CalendarIcon,
  List,
  MapPin,
  Clock,
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

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  rsvps: number
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  recurring: boolean
  description: string
}

const sampleEvents: Event[] = [
  { id: "1", title: "Sunday Service", date: "2026-03-15", time: "09:00 AM", location: "Main Auditorium", rsvps: 320, status: "upcoming", recurring: true, description: "Weekly Sunday worship service" },
  { id: "2", title: "Youth Conference 2026", date: "2026-04-10", time: "10:00 AM", location: "Conference Hall", rsvps: 150, status: "upcoming", recurring: false, description: "Annual youth conference" },
  { id: "3", title: "Bible Study - Wednesday", date: "2026-03-12", time: "06:30 PM", location: "Room 201", rsvps: 45, status: "upcoming", recurring: true, description: "Mid-week Bible study" },
  { id: "4", title: "Women's Retreat", date: "2026-05-20", time: "08:00 AM", location: "Lakeside Resort", rsvps: 80, status: "upcoming", recurring: false, description: "Annual women's retreat" },
  { id: "5", title: "Easter Service", date: "2026-04-05", time: "07:00 AM", location: "Main Auditorium", rsvps: 500, status: "upcoming", recurring: false, description: "Easter Sunday celebration" },
  { id: "6", title: "Marriage Seminar", date: "2026-03-08", time: "02:00 PM", location: "Room 105", rsvps: 60, status: "completed", recurring: false, description: "Strengthening marriages seminar" },
  { id: "7", title: "Community Outreach", date: "2026-03-22", time: "09:00 AM", location: "City Park", rsvps: 75, status: "upcoming", recurring: false, description: "Community service and evangelism" },
  { id: "8", title: "Choir Practice", date: "2026-03-13", time: "05:00 PM", location: "Music Room", rsvps: 30, status: "upcoming", recurring: true, description: "Weekly choir rehearsal" },
]

const statusColors: Record<string, string> = {
  upcoming: "bg-red-100 text-red-800",
  ongoing: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AdminEventsPage() {
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = sampleEvents.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage church events and activities</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Fill in the details for the new event.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="event-title">Title</Label>
                <Input id="event-title" placeholder="Event title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-desc">Description</Label>
                <Textarea id="event-desc" placeholder="Event description" rows={3} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input id="event-date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-time">Time</Label>
                  <Input id="event-time" type="time" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-location">Location</Label>
                <Input id="event-location" placeholder="Event location" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Recurring Event</Label>
                  <p className="text-xs text-muted-foreground">This event repeats weekly</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => { toast.success("Event created successfully"); setDialogOpen(false) }}>
                Create Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("list")}
              >
                <List className="mr-1 h-4 w-4" />
                List
              </Button>
              <Button
                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarIcon className="mr-1 h-4 w-4" />
                Calendar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "list" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead>RSVPs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{event.title}</span>
                        {event.recurring && (
                          <Badge variant="outline" className="ml-2 text-xs">Recurring</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {event.rsvps}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[event.status]}`}>
                        {event.status}
                      </span>
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
                          <DropdownMenuItem><Users className="mr-2 h-4 w-4" />View RSVPs</DropdownMenuItem>
                          <DropdownMenuItem><Bell className="mr-2 h-4 w-4" />Send Reminder</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className={`h-2 ${event.status === "upcoming" ? "bg-primary" : event.status === "completed" ? "bg-muted" : "bg-destructive"}`} />
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {event.rsvps} RSVPs
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[event.status]}`}>
                        {event.status}
                      </span>
                      {event.recurring && <Badge variant="outline" className="text-xs">Recurring</Badge>}
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
