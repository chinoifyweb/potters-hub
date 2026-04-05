"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PastorMessage {
  id: string;
  title: string;
  speaker: string;
  scriptureReference: string;
  content: string;
  notes: string;
  audioUrl: string | null;
  videoUrl: string | null;
  category: string;
  date: string;
  isPublished: boolean;
}

const categoryOptions = [
  { value: "sermon", label: "Sermon" },
  { value: "teaching", label: "Teaching" },
  { value: "pastoral-care", label: "Pastoral Care" },
  { value: "administration", label: "Administration" },
  { value: "strategy", label: "Strategy" },
  { value: "devotional", label: "Devotional" },
];

export default function AdminPastorMessagesPage() {
  const [messages, setMessages] = useState<PastorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formSpeaker, setFormSpeaker] = useState("");
  const [formScripture, setFormScripture] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formCategory, setFormCategory] = useState("sermon");
  const [formDate, setFormDate] = useState("");
  const [formAudioUrl, setFormAudioUrl] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formPublished, setFormPublished] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/pastor-messages?all=true");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const resetForm = () => {
    setFormTitle("");
    setFormSpeaker("");
    setFormScripture("");
    setFormContent("");
    setFormNotes("");
    setFormCategory("sermon");
    setFormDate("");
    setFormAudioUrl("");
    setFormVideoUrl("");
    setFormPublished(false);
    setEditingId(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setFormDate(new Date().toISOString().split("T")[0]);
    setDialogOpen(true);
  };

  const openEditDialog = (msg: PastorMessage) => {
    setEditingId(msg.id);
    setFormTitle(msg.title);
    setFormSpeaker(msg.speaker || "");
    setFormScripture(msg.scriptureReference || "");
    setFormContent(msg.content || "");
    setFormNotes(msg.notes || "");
    setFormCategory(msg.category || "sermon");
    setFormDate(msg.date);
    setFormAudioUrl(msg.audioUrl || "");
    setFormVideoUrl(msg.videoUrl || "");
    setFormPublished(msg.isPublished);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: formTitle,
        speaker: formSpeaker,
        scriptureReference: formScripture,
        content: formContent,
        notes: formNotes,
        category: formCategory,
        date: formDate,
        audioUrl: formAudioUrl || null,
        videoUrl: formVideoUrl || null,
        isPublished: formPublished,
      };

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/pastor-messages/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/pastor-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save");

      toast.success(editingId ? "Message updated" : "Message created");
      setDialogOpen(false);
      resetForm();
      fetchMessages();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save message");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (msg: PastorMessage) => {
    try {
      const res = await fetch(`/api/pastor-messages/${msg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !msg.isPublished }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(msg.isPublished ? "Unpublished" : "Published");
      fetchMessages();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/pastor-messages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Message deleted");
      fetchMessages();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = messages.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.speaker?.toLowerCase().includes(search.toLowerCase()) ||
      m.scriptureReference?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500" />
            <h1 className="text-3xl font-bold tracking-tight">
              Pastor Messages
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage sermons and resources for the Pastor&apos;s Portal
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Message
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Message" : "New Pastor Message"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update this pastor-only message."
                : "Create a new message for the Pastor's Portal."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input
                placeholder="Message title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Speaker</Label>
                <Input
                  placeholder="e.g., Pastor David"
                  value={formSpeaker}
                  onChange={(e) => setFormSpeaker(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Scripture Reference</Label>
                <Input
                  placeholder="e.g., John 10:11-18"
                  value={formScripture}
                  onChange={(e) => setFormScripture(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={formCategory}
                  onValueChange={setFormCategory}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Message Content</Label>
              <Textarea
                placeholder="Write the message overview / sermon body..."
                rows={5}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Sermon Notes / Outline</Label>
              <Textarea
                placeholder="Sermon outline, key points, application notes..."
                rows={5}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Audio URL (optional)</Label>
                <Input
                  placeholder="https://..."
                  value={formAudioUrl}
                  onChange={(e) => setFormAudioUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Video URL (optional)</Label>
                <Input
                  placeholder="https://..."
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Publish immediately</Label>
              <Switch
                checked={formPublished}
                onCheckedChange={setFormPublished}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No pastor messages found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Speaker
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Category
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{msg.title}</span>
                        {msg.scriptureReference && (
                          <p className="text-xs text-muted-foreground">
                            {msg.scriptureReference}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {msg.speaker || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="capitalize">
                        {msg.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(msg.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={msg.isPublished ? "default" : "secondary"}
                      >
                        {msg.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openEditDialog(msg)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleTogglePublish(msg)}
                          >
                            {msg.isPublished ? (
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
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(msg.id)}
                          >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
