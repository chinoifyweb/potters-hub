"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BIBLE_STUDY_CATEGORIES } from "@/lib/bible-study-categories";

export default function NewBibleStudyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [scripture, setScripture] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/bible-study/new");
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bible-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          scripture: scripture.trim() || undefined,
          description: description.trim() || undefined,
          category,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create discussion.");
        setSubmitting(false);
        return;
      }
      router.push(`/bible-study/${data.topic.id}`);
    } catch (e: any) {
      setError(e?.message || "Failed to create discussion.");
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/bible-study"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to discussions
      </Link>

      <div className="flex items-center gap-2 text-primary mb-1">
        <BookOpen className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-wider">New Discussion</span>
      </div>
      <h1 className="text-3xl font-bold mb-6">Start a Bible Study Discussion</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-lg border">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. What does it mean to abide in Christ?"
            maxLength={200}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="scripture">Scripture Reference (optional)</Label>
          <Input
            id="scripture"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            placeholder="e.g. John 15:1-11"
            maxLength={200}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full border rounded-md h-10 px-3 bg-white text-sm"
          >
            {BIBLE_STUDY_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.icon} {c.label} — {c.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="description">Description / Opening thoughts (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share your reflection, question, or starting point for the conversation..."
            rows={8}
            maxLength={10000}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {description.length}/10000 characters
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Post Discussion
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/bible-study">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
