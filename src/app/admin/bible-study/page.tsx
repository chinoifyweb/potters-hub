"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Pin,
  Lock,
  Unlock,
  EyeOff,
  Eye,
  Trash2,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BIBLE_STUDY_CATEGORIES } from "@/lib/bible-study-categories";

interface Topic {
  id: string;
  title: string;
  scripture: string | null;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  isVisible: boolean;
  viewCount: number;
  lastActivityAt: string;
  createdAt: string;
  createdBy: { id: string; fullName: string; role: string };
  _count: { posts: number };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminBibleStudyPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      params.set("page", "1");
      const res = await fetch(`/api/bible-study?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setTopics(data.topics || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkAction(action: "pin" | "unpin" | "lock" | "unlock" | "hide" | "show" | "delete") {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} discussion(s)? This cannot be undone.`)) return;
    setBusy(true);
    try {
      for (const id of Array.from(selected)) {
        if (action === "delete") {
          await fetch(`/api/bible-study/${id}`, { method: "DELETE" });
        } else {
          const body: any = {};
          if (action === "pin") body.isPinned = true;
          if (action === "unpin") body.isPinned = false;
          if (action === "lock") body.isLocked = true;
          if (action === "unlock") body.isLocked = false;
          if (action === "hide") body.isVisible = false;
          if (action === "show") body.isVisible = true;
          await fetch(`/api/bible-study/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        }
      }
      setSelected(new Set());
      await fetchTopics();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Bible Study Moderation</h1>
          <p className="text-sm text-muted-foreground">Manage all discussion topics</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTopics()}
            className="pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-md h-10 px-3 bg-white text-sm"
        >
          <option value="">All categories</option>
          {BIBLE_STUDY_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={fetchTopics}>
          Filter
        </Button>
      </div>

      {selected.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkAction("pin")}>
            <Pin className="h-3.5 w-3.5 mr-1" /> Pin
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkAction("unpin")}>
            Unpin
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkAction("lock")}>
            <Lock className="h-3.5 w-3.5 mr-1" /> Lock
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkAction("unlock")}>
            <Unlock className="h-3.5 w-3.5 mr-1" /> Unlock
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkAction("hide")}>
            <EyeOff className="h-3.5 w-3.5 mr-1" /> Hide
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => bulkAction("show")}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Show
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            disabled={busy}
            onClick={() => bulkAction("delete")}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : topics.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No topics found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr className="text-left">
                <th className="p-3 w-10"></th>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Author</th>
                <th className="p-3">Status</th>
                <th className="p-3">Posts</th>
                <th className="p-3">Last Activity</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id} className="border-b hover:bg-muted/20">
                  <td className="p-3">
                    <Checkbox
                      checked={selected.has(t.id)}
                      onCheckedChange={() => toggleSelect(t.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{t.title}</div>
                    {t.scripture && (
                      <div className="text-xs text-muted-foreground">📖 {t.scripture}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{t.category}</Badge>
                  </td>
                  <td className="p-3 text-xs">{t.createdBy?.fullName || "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {t.isPinned && <Badge className="text-[10px]">Pinned</Badge>}
                      {t.isLocked && (
                        <Badge variant="secondary" className="text-[10px]">
                          Locked
                        </Badge>
                      )}
                      {!t.isVisible && (
                        <Badge variant="destructive" className="text-[10px]">
                          Hidden
                        </Badge>
                      )}
                      {t.isPinned || t.isLocked || !t.isVisible ? null : (
                        <Badge variant="outline" className="text-[10px]">
                          Active
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3">{t._count.posts}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {timeAgo(t.lastActivityAt)}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/bible-study/${t.id}`}
                      target="_blank"
                      className="text-primary hover:underline"
                      title="View thread"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
