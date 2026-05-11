"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Search,
  Pin,
  Lock,
  Eye,
  MessageSquare,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Topic {
  id: string;
  title: string;
  description: string | null;
  scripture: string | null;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  lastActivityAt: string;
  createdAt: string;
  createdBy: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  };
  _count: { posts: number };
}

interface Category {
  key: string;
  label: string;
  icon: string;
  description: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function BibleStudyListPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </div>
      }
    >
      <BibleStudyListInner />
    </Suspense>
  );
}

function BibleStudyListInner() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>(searchParams.get("category") || "");
  const [search, setSearch] = useState<string>(searchParams.get("search") || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      params.set("page", String(page));
      const res = await fetch(`/api/bible-study?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setTopics(data.topics || []);
        setCategories(data.categories || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchTopics();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <BookOpen className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wider">Bible Study</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Bible Study Discussions</h1>
          <p className="text-muted-foreground mt-2">
            Grow together through Scripture. Share insights, ask questions, lift each other up.
          </p>
        </div>
        {session && (
          <Button asChild>
            <Link href="/bible-study/new">
              <Plus className="h-4 w-4 mr-1" />
              New Discussion
            </Link>
          </Button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setCategory("");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            category === ""
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-white hover:bg-accent"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setCategory(c.key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              category === c.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white hover:bg-accent"
            }`}
          >
            <span className="mr-1">{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions, scripture references..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Topics */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No discussions yet in this section.</p>
          {session && (
            <Button asChild className="mt-4">
              <Link href="/bible-study/new">Start the conversation</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {topics.map((t) => {
            const cat = categories.find((c) => c.key === t.category);
            return (
              <Link
                key={t.id}
                href={`/bible-study/${t.id}`}
                className="block p-4 bg-white border rounded-lg hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl shrink-0">{cat?.icon || "💬"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.isPinned && (
                        <Pin className="h-4 w-4 text-primary fill-primary" />
                      )}
                      {t.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      <h3 className="font-semibold text-lg truncate">{t.title}</h3>
                    </div>
                    {t.scripture && (
                      <p className="text-sm text-primary font-medium mt-1">
                        📖 {t.scripture}
                      </p>
                    )}
                    {t.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {t.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {cat?.label || t.category}
                      </Badge>
                      <span>by {t.createdBy?.fullName || "Member"}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {t._count.posts}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {t.viewCount}
                      </span>
                      <span>· {timeAgo(t.lastActivityAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {!session && (
        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
          <p className="text-sm">
            <Link href="/login" className="text-primary font-semibold underline">
              Log in
            </Link>{" "}
            to start your own discussion or reply to a thread.
          </p>
        </div>
      )}
    </div>
  );
}
