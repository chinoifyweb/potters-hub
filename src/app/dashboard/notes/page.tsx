"use client"

import React, { useState } from "react"
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Save,
  X,
  StickyNote,
  Video,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Note {
  id: string
  title: string
  content: string
  linkedSermon?: { id: string; title: string }
  createdAt: string
  updatedAt: string
}

const initialNotes: Note[] = [
  {
    id: "1",
    title: "Prayer Life Notes",
    content: "Key takeaways from the Prayer Series:\n\n1. Prayer is a conversation with God, not a monologue\n2. Jesus taught us to pray with sincerity, not with many words\n3. The Lord's Prayer is a model for how to approach God\n4. We should pray without ceasing - make prayer a lifestyle\n5. Intercessory prayer is a powerful ministry\n\nPersonal application: Set aside 30 minutes each morning for dedicated prayer time.",
    linkedSermon: { id: "sermon-1", title: "The Power of Prayer" },
    createdAt: "2026-03-09T10:30:00",
    updatedAt: "2026-03-09T11:15:00",
  },
  {
    id: "2",
    title: "Faith Over Fear",
    content: "Scriptures on faith:\n- Hebrews 11:1 - Faith is the substance of things hoped for\n- Romans 10:17 - Faith comes by hearing the Word of God\n- Mark 11:23 - Speak to your mountain\n- 2 Timothy 1:7 - God has not given us a spirit of fear\n\nFear is the opposite of faith. When we choose fear, we are not trusting God. When we choose faith, we activate the promises of God in our lives.",
    linkedSermon: { id: "sermon-2", title: "Faith Over Fear" },
    createdAt: "2026-03-02T11:00:00",
    updatedAt: "2026-03-02T11:45:00",
  },
  {
    id: "3",
    title: "Sunday Reflections - Family",
    content: "Building a strong family requires:\n- Prayer as the foundation\n- Regular family devotion time\n- Open and honest communication\n- Showing love in action, not just words\n- Forgiving quickly\n\nGoal: Start weekly family dinner with devotion on Friday nights.",
    linkedSermon: { id: "sermon-3", title: "Building Strong Families" },
    createdAt: "2026-02-23T12:00:00",
    updatedAt: "2026-02-23T12:30:00",
  },
  {
    id: "4",
    title: "Personal Goals - Spiritual Growth",
    content: "Goals for this quarter:\n\n- Read through the Gospel of John\n- Memorize 12 scriptures (1 per week)\n- Join the prayer team\n- Share my testimony at community group\n- Fast once a week (Wednesday)\n- Write in gratitude journal daily",
    createdAt: "2026-02-15T08:00:00",
    updatedAt: "2026-03-01T09:00:00",
  },
  {
    id: "5",
    title: "Worship Notes",
    content: "The heart of worship:\n- Worship is not about us, it's about God\n- True worship requires surrender\n- We can worship in spirit and in truth (John 4:24)\n- Our entire lives should be an act of worship\n\nSongs that ministered to me today:\n- Great Is Thy Faithfulness\n- What A Beautiful Name\n- Way Maker",
    linkedSermon: { id: "sermon-5", title: "The Heart of Worship" },
    createdAt: "2026-02-09T11:30:00",
    updatedAt: "2026-02-09T12:00:00",
  },
]

export default function NotesPage() {
  const [notes, setNotes] = useState(initialNotes)
  const [search, setSearch] = useState("")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  )

  const createNote = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a title")
      return
    }
    const note: Note = {
      id: `n${Date.now()}`,
      title: newTitle,
      content: newContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes([note, ...notes])
    setNewTitle("")
    setNewContent("")
    setIsCreating(false)
    toast.success("Note created")
  }

  const saveEdit = () => {
    if (!editingNote) return
    setNotes((prev) =>
      prev.map((n) =>
        n.id === editingNote.id
          ? { ...editingNote, updatedAt: new Date().toISOString() }
          : n
      )
    )
    setEditingNote(null)
    toast.success("Note saved")
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    setDeleteConfirm(null)
    toast.success("Note deleted")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notes</h2>
          <p className="text-muted-foreground">Your personal sermon notes and reflections.</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> New Note
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Note</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Note title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Write your note here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={6}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={createNote}>
                <Save className="h-4 w-4 mr-1.5" /> Save Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm line-clamp-1">{note.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingNote({ ...note })}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setDeleteConfirm(note.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">
                {note.content}
              </p>

              {note.linkedSermon && (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <Video className="h-3.5 w-3.5" />
                  <span className="truncate">{note.linkedSermon.title}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(note.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <StickyNote className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search ? "No notes match your search." : "No notes yet. Start by creating one!"}
          </p>
        </div>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <div className="space-y-3">
              <Input
                placeholder="Note title..."
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              />
              <Textarea
                placeholder="Write your note here..."
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                rows={8}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
            <Button onClick={saveEdit}>
              <Save className="h-4 w-4 mr-1.5" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this note? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && deleteNote(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
