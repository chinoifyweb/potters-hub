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
  BookOpen,
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
import { toast } from "sonner"

interface Devotional {
  id: string
  title: string
  scripture: string
  date: string
  published: boolean
  content: string
  author: string
}

const sampleDevotionals: Devotional[] = [
  { id: "1", title: "Walking by Faith", scripture: "2 Corinthians 5:7", date: "2026-03-12", published: true, content: "For we walk by faith, not by sight...", author: "Pastor David" },
  { id: "2", title: "The Joy of the Lord", scripture: "Nehemiah 8:10", date: "2026-03-11", published: true, content: "Do not grieve, for the joy of the LORD is your strength...", author: "Pastor Sarah" },
  { id: "3", title: "Trust in His Timing", scripture: "Ecclesiastes 3:1", date: "2026-03-10", published: true, content: "There is a time for everything, and a season for every activity under the heavens...", author: "Pastor David" },
  { id: "4", title: "Peace in the Storm", scripture: "John 14:27", date: "2026-03-09", published: true, content: "Peace I leave with you; my peace I give you...", author: "Elder Ruth" },
  { id: "5", title: "God's Unfailing Love", scripture: "Psalm 136:1", date: "2026-03-08", published: false, content: "Give thanks to the LORD, for he is good...", author: "Pastor David" },
  { id: "6", title: "Strength in Weakness", scripture: "2 Corinthians 12:9", date: "2026-03-07", published: true, content: "My grace is sufficient for you, for my power is made perfect in weakness...", author: "Pastor Sarah" },
  { id: "7", title: "The Good Shepherd", scripture: "Psalm 23:1", date: "2026-03-06", published: true, content: "The LORD is my shepherd, I lack nothing...", author: "Pastor David" },
  { id: "8", title: "Renewed Minds", scripture: "Romans 12:2", date: "2026-03-05", published: false, content: "Do not conform to the pattern of this world...", author: "Elder Michael" },
]

export default function AdminDevotionalsPage() {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = sampleDevotionals.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.scripture.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devotionals</h1>
          <p className="text-muted-foreground">Manage daily devotional content</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Devotional</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Devotional</DialogTitle>
              <DialogDescription>Create a new daily devotional.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input placeholder="Devotional title" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Scripture Reference</Label>
                  <Input placeholder="e.g., John 3:16" />
                </div>
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Content</Label>
                <Textarea placeholder="Write the devotional content..." rows={6} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Publish immediately</Label>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => { toast.success("Devotional created"); setDialogOpen(false) }}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or scripture..."
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
                <TableHead>Scripture</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((devotional) => (
                <TableRow key={devotional.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{devotional.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{devotional.scripture}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{devotional.author}</TableCell>
                  <TableCell>{new Date(devotional.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={devotional.published ? "default" : "secondary"}>
                      {devotional.published ? "Published" : "Draft"}
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
                        <DropdownMenuItem>
                          {devotional.published ? (
                            <><EyeOff className="mr-2 h-4 w-4" />Unpublish</>
                          ) : (
                            <><Eye className="mr-2 h-4 w-4" />Publish</>
                          )}
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
