"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  UserPlus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Group {
  id: string
  name: string
  category: string
  leader: string
  membersCount: number
  meetingDay: string
  meetingTime: string
  location: string
  status: "active" | "inactive"
  description: string
}

const sampleGroups: Group[] = [
  { id: "1", name: "Young Adults Fellowship", category: "Fellowship", leader: "Michael Chen", membersCount: 32, meetingDay: "Friday", meetingTime: "7:00 PM", location: "Room 201", status: "active", description: "Fellowship for young adults ages 18-30" },
  { id: "2", name: "Men's Bible Study", category: "Bible Study", leader: "James Brown", membersCount: 18, meetingDay: "Saturday", meetingTime: "8:00 AM", location: "Room 105", status: "active", description: "Weekly men's Bible study group" },
  { id: "3", name: "Women of Faith", category: "Fellowship", leader: "Mary Smith", membersCount: 25, meetingDay: "Tuesday", meetingTime: "10:00 AM", location: "Room 302", status: "active", description: "Women's fellowship and prayer group" },
  { id: "4", name: "Prayer Warriors", category: "Prayer", leader: "Sarah Wilson", membersCount: 15, meetingDay: "Wednesday", meetingTime: "6:00 AM", location: "Prayer Room", status: "active", description: "Early morning prayer group" },
  { id: "5", name: "Worship Team", category: "Ministry", leader: "Music Pastor John", membersCount: 22, meetingDay: "Thursday", meetingTime: "6:00 PM", location: "Music Room", status: "active", description: "Worship and praise team" },
  { id: "6", name: "Children's Ministry", category: "Ministry", leader: "Ruth Garcia", membersCount: 40, meetingDay: "Sunday", meetingTime: "9:00 AM", location: "Kids Wing", status: "active", description: "Ministry for children ages 3-12" },
  { id: "7", name: "Marriage Enrichment", category: "Fellowship", leader: "Pastor David", membersCount: 12, meetingDay: "Saturday", meetingTime: "4:00 PM", location: "Room 105", status: "inactive", description: "Couples fellowship and marriage support" },
  { id: "8", name: "Evangelism Team", category: "Outreach", leader: "Daniel Kim", membersCount: 20, meetingDay: "Saturday", meetingTime: "9:00 AM", location: "Meet at entrance", status: "active", description: "Community outreach and evangelism" },
]

export default function AdminGroupsPage() {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = sampleGroups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.leader.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">Manage small groups and ministries</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Group</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>Fill in the details for the new group.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Group Name</Label>
                <Input placeholder="Enter group name" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the group" rows={2} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fellowship">Fellowship</SelectItem>
                      <SelectItem value="bible_study">Bible Study</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                      <SelectItem value="ministry">Ministry</SelectItem>
                      <SelectItem value="outreach">Outreach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Leader</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select leader" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="michael">Michael Chen</SelectItem>
                      <SelectItem value="mary">Mary Smith</SelectItem>
                      <SelectItem value="james">James Brown</SelectItem>
                      <SelectItem value="sarah">Sarah Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Meeting Day</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                    <SelectContent>
                      {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
                        <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Time</Label>
                  <Input type="time" />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input placeholder="Location" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => { toast.success("Group created successfully"); setDialogOpen(false) }}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search groups or leaders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="hidden md:table-cell">Meeting</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{group.category}</Badge>
                  </TableCell>
                  <TableCell>{group.leader}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {group.membersCount}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm">{group.meetingDay}s at {group.meetingTime}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{group.location}</TableCell>
                  <TableCell>
                    <Badge variant={group.status === "active" ? "default" : "secondary"}>
                      {group.status}
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
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Members</DropdownMenuItem>
                        <DropdownMenuItem><UserPlus className="mr-2 h-4 w-4" />Assign Leader</DropdownMenuItem>
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
