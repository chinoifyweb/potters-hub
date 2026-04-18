"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Item {
  id: string;
  title: string;
  teacher?: string | null;
  ageGroup?: string | null;
  description?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  thumbnailUrl?: string | null;
  scripture?: string | null;
  memoryVerse?: string | null;
  weekNumber?: number | null;
  quarter?: string | null;
  content?: string | null;
  date: string;
  isPublished: boolean;
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [f, setF] = useState<any>({});
  const [workerCount, setWorkerCount] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/children-sermons");
      const d = await r.json();
      setItems(d.items || []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const loadWorkerCount = async () => {
    try {
      const r = await fetch("/api/admin/children-sermons/recipients");
      if (r.ok) {
        const d = await r.json();
        if (typeof d.count === "number") setWorkerCount(d.count);
      }
    } catch {}
  };

  useEffect(() => {
    load();
    loadWorkerCount();
  }, []);

  const reset = () => {
    setF({
      isPublished: false,
      date: new Date().toISOString().split("T")[0],
      notifyWorkers: true,
    });
    setEditingId(null);
  };
  const openCreate = () => {
    reset();
    setOpen(true);
  };
  const openEdit = (it: Item) => {
    setEditingId(it.id);
    setF({
      ...it,
      date: it.date.split("T")[0],
      notifyWorkers: false,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!f.title || !f.date) return toast.error("Title and date required");
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/children-sermons/${editingId}`
        : "/api/admin/children-sermons";
      const r = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      toast.success("Saved");
      if (d.notify) {
        const n = d.notify;
        toast.success(
          `WhatsApp sent to ${n.sent}/${n.recipientCount} children's workers${
            n.failed ? ` (${n.failed} failed)` : ""
          }`,
        );
      } else if (f.notifyWorkers) {
        toast.message(
          "Notification skipped or timed out — check WA service status.",
        );
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this sermon?")) return;
    const r = await fetch(`/api/admin/children-sermons/${id}`, {
      method: "DELETE",
    });
    if (r.ok) {
      toast.success("Deleted");
      load();
    } else toast.error("Failed");
  };

  const notifyNow = async (id: string, title: string) => {
    if (
      !confirm(
        `Send WhatsApp notification for "${title}" to all active Children's Church workers?`,
      )
    )
      return;
    setNotifying(id);
    try {
      const r = await fetch(`/api/admin/children-sermons/${id}/notify`, {
        method: "POST",
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      const n = d.notify;
      toast.success(
        `Sent to ${n.sent}/${n.recipientCount} workers${
          n.failed ? ` (${n.failed} failed)` : ""
        }`,
      );
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setNotifying(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Children Sermons</h1>
          <p className="text-muted-foreground">
            Manage children sermons · auto-notifies Children&apos;s Church
            workers via WhatsApp
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sermon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No sermons yet
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="font-medium">{it.title}</TableCell>
                      <TableCell>{it.teacher || "—"}</TableCell>
                      <TableCell>{it.ageGroup || "—"}</TableCell>
                      <TableCell>
                        {new Date(it.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={it.isPublished ? "default" : "secondary"}
                        >
                          {it.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Notify Workers Now"
                          disabled={notifying === it.id}
                          onClick={() => notifyNow(it.id, it.title)}
                        >
                          {notifying === it.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(it)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => del(it.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit" : "New"} Children Sermon
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input
                value={f.title || ""}
                onChange={(e) => setF({ ...f, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Teacher</Label>
                <Input
                  value={f.teacher || ""}
                  onChange={(e) => setF({ ...f, teacher: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Age Group</Label>
                <Input
                  placeholder="e.g. 5-8"
                  value={f.ageGroup || ""}
                  onChange={(e) => setF({ ...f, ageGroup: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Week #</Label>
                <Input
                  type="number"
                  value={f.weekNumber ?? ""}
                  onChange={(e) =>
                    setF({ ...f, weekNumber: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Quarter</Label>
                <Input
                  placeholder="e.g. Q2 2026"
                  value={f.quarter || ""}
                  onChange={(e) => setF({ ...f, quarter: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Scripture</Label>
              <Input
                value={f.scripture || ""}
                onChange={(e) => setF({ ...f, scripture: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Memory Verse</Label>
              <Input
                value={f.memoryVerse || ""}
                onChange={(e) => setF({ ...f, memoryVerse: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={f.description || ""}
                onChange={(e) => setF({ ...f, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Video URL</Label>
              <Input
                value={f.videoUrl || ""}
                onChange={(e) => setF({ ...f, videoUrl: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Audio URL</Label>
              <Input
                value={f.audioUrl || ""}
                onChange={(e) => setF({ ...f, audioUrl: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Thumbnail URL</Label>
              <Input
                value={f.thumbnailUrl || ""}
                onChange={(e) => setF({ ...f, thumbnailUrl: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={f.date || ""}
                onChange={(e) => setF({ ...f, date: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={!!f.isPublished}
                onCheckedChange={(v) => setF({ ...f, isPublished: v })}
              />
              <Label>Published</Label>
            </div>

            <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={!!f.notifyWorkers}
                  onChange={(e) =>
                    setF({ ...f, notifyWorkers: e.target.checked })
                  }
                />
                <div className="text-sm">
                  <div className="font-medium">
                    📱 Notify Children&apos;s Church workers via WhatsApp
                  </div>
                  <div className="text-muted-foreground">
                    {workerCount !== null
                      ? `Will send to ${workerCount} active worker${
                          workerCount === 1 ? "" : "s"
                        } with department = "Children".`
                      : "Will send to all active workers with department = \"Children\"."}{" "}
                    Manage recipients at{" "}
                    <a
                      href="/admin/workers"
                      className="underline"
                      target="_blank"
                      rel="noopener"
                    >
                      /admin/workers
                    </a>
                    .
                  </div>
                </div>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
