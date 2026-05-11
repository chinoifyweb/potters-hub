"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  ArrowLeft,
  Pin,
  Lock,
  Unlock,
  Loader2,
  Heart,
  MessageSquare,
  Trash2,
  EyeOff,
  Shield,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Author {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
}
interface Post {
  id: string;
  content: string;
  parentPostId: string | null;
  authorId: string;
  isVisible: boolean;
  likeCount: number;
  createdAt: string;
  author: Author;
  _count: { likes: number; replies: number };
  likedByMe?: boolean;
}
interface Topic {
  id: string;
  title: string;
  description: string | null;
  scripture: string | null;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  isVisible: boolean;
  viewCount: number;
  createdAt: string;
  lastActivityAt: string;
  createdBy: Author;
  _count: { posts: number };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin")
    return (
      <Badge className="text-[10px] bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
        Admin
      </Badge>
    );
  if (role === "pastor")
    return (
      <Badge className="text-[10px] bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
        Pastor
      </Badge>
    );
  return null;
}

export default function BibleStudyThreadPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === "admin" || user?.role === "pastor";

  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchThread = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bible-study/${id}`);
      const data = await res.json();
      if (res.ok) {
        setTopic(data.topic);
        setPosts(data.posts || []);
      } else {
        setError(data.error || "Failed to load discussion.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/bible-study/${id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent.trim(),
          parentPostId: replyParentId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post reply.");
      } else {
        setReplyContent("");
        setReplyParentId(null);
        await fetchThread();
      }
    } catch (e: any) {
      setError(e?.message || "Failed to post reply.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(postId: string) {
    if (!session) {
      router.push("/login?callbackUrl=" + encodeURIComponent(`/bible-study/${id}`));
      return;
    }
    try {
      const res = await fetch(`/api/bible-study/posts/${postId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likedByMe: data.liked, likeCount: data.likeCount } : p
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAdminAction(action: string, postId?: string) {
    if (!isAdmin || !topic) return;
    try {
      if (action === "togglePin") {
        await fetch(`/api/bible-study/${topic.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinned: !topic.isPinned }),
        });
      } else if (action === "toggleLock") {
        await fetch(`/api/bible-study/${topic.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isLocked: !topic.isLocked }),
        });
      } else if (action === "hidePost" && postId) {
        await fetch(`/api/bible-study/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isVisible: false }),
        });
      } else if (action === "deletePost" && postId) {
        if (!confirm("Delete this post?")) return;
        await fetch(`/api/bible-study/posts/${postId}`, { method: "DELETE" });
      } else if (action === "deleteTopic") {
        if (!confirm("Delete entire discussion? This cannot be undone.")) return;
        await fetch(`/api/bible-study/${topic.id}`, { method: "DELETE" });
        router.push("/bible-study");
        return;
      }
      await fetchThread();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Discussion not found.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/bible-study">Back to discussions</Link>
        </Button>
      </div>
    );
  }

  // Group posts: top-level vs replies
  const topLevel = posts.filter((p) => !p.parentPostId);
  const repliesByParent = posts.reduce<Record<string, Post[]>>((acc, p) => {
    if (p.parentPostId) {
      (acc[p.parentPostId] ||= []).push(p);
    }
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/bible-study"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        All discussions
      </Link>

      {/* Topic header */}
      <div className="bg-white rounded-lg border p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {topic.isPinned && (
                <Badge variant="default" className="bg-primary">
                  <Pin className="h-3 w-3 mr-1" /> Pinned
                </Badge>
              )}
              {topic.isLocked && (
                <Badge variant="secondary">
                  <Lock className="h-3 w-3 mr-1" /> Locked
                </Badge>
              )}
              <Badge variant="outline">{topic.category}</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{topic.title}</h1>
            {topic.scripture && (
              <p className="text-primary font-medium mt-2">📖 {topic.scripture}</p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => handleAdminAction("togglePin")}>
                <Pin className="h-4 w-4 mr-1" />
                {topic.isPinned ? "Unpin" : "Pin"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAdminAction("toggleLock")}>
                {topic.isLocked ? (
                  <>
                    <Unlock className="h-4 w-4 mr-1" /> Unlock
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-1" /> Lock
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleAdminAction("deleteTopic")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <Avatar className="h-6 w-6">
            <AvatarImage src={topic.createdBy?.avatarUrl || undefined} />
            <AvatarFallback>{topic.createdBy?.fullName?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <span>{topic.createdBy?.fullName || "Member"}</span>
          <RoleBadge role={topic.createdBy?.role || ""} />
          <span>·</span>
          <span>{timeAgo(topic.createdAt)}</span>
          <span>·</span>
          <span>{topic.viewCount} views</span>
        </div>

        {topic.description && (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {topic.description}
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-3 mb-6">
        {topLevel.length === 0 && (
          <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
            No replies yet. Be the first to share your thoughts.
          </div>
        )}
        {topLevel.map((p) => (
          <div key={p.id}>
            <PostCard
              post={p}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              isLocked={topic.isLocked}
              onLike={handleLike}
              onReply={(parentId) => {
                setReplyParentId(parentId);
                document.getElementById("reply-form")?.scrollIntoView({ behavior: "smooth" });
              }}
              onHide={(postId) => handleAdminAction("hidePost", postId)}
              onDelete={(postId) => handleAdminAction("deletePost", postId)}
            />
            {/* Replies */}
            {repliesByParent[p.id]?.length > 0 && (
              <div className="ml-8 mt-2 space-y-2 border-l-2 border-muted pl-4">
                {repliesByParent[p.id].map((r) => (
                  <PostCard
                    key={r.id}
                    post={r}
                    currentUserId={user?.id}
                    isAdmin={isAdmin}
                    isLocked={topic.isLocked}
                    onLike={handleLike}
                    onReply={() => {}}
                    onHide={(postId) => handleAdminAction("hidePost", postId)}
                    onDelete={(postId) => handleAdminAction("deletePost", postId)}
                    isReply
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply form */}
      {topic.isLocked ? (
        <div className="bg-muted/30 rounded-lg p-4 text-center text-muted-foreground">
          🔒 This discussion is closed.
        </div>
      ) : session ? (
        <form
          id="reply-form"
          onSubmit={handleReply}
          className="bg-white rounded-lg border p-4 space-y-3"
        >
          {replyParentId && (
            <div className="flex items-center justify-between text-xs bg-primary/5 px-3 py-1.5 rounded">
              <span>Replying to a post</span>
              <button
                type="button"
                onClick={() => setReplyParentId(null)}
                className="hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Share your thoughts, scripture, or reflection..."
            rows={4}
            maxLength={10000}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || !replyContent.trim()}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Post Reply
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
          <p className="text-sm">
            <Link href={`/login?callbackUrl=/bible-study/${id}`} className="text-primary font-semibold underline">
              Log in
            </Link>{" "}
            to join the discussion.
          </p>
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  currentUserId,
  isAdmin,
  isLocked,
  onLike,
  onReply,
  onHide,
  onDelete,
  isReply,
}: {
  post: Post;
  currentUserId?: string;
  isAdmin: boolean;
  isLocked: boolean;
  onLike: (postId: string) => void;
  onReply: (parentId: string) => void;
  onHide: (postId: string) => void;
  onDelete: (postId: string) => void;
  isReply?: boolean;
}) {
  const isAuthor = post.authorId === currentUserId;
  return (
    <div
      className={`bg-white rounded-lg border p-4 ${
        isReply ? "border-muted" : ""
      } ${!post.isVisible ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={post.author?.avatarUrl || undefined} />
          <AvatarFallback>{post.author?.fullName?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm">
              {post.author?.fullName || "Member"}
            </span>
            <RoleBadge role={post.author?.role || ""} />
            <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
            {!post.isVisible && (
              <Badge variant="secondary" className="text-[10px]">
                Hidden
              </Badge>
            )}
          </div>
          <div className="text-sm whitespace-pre-wrap break-words">{post.content}</div>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                post.likedByMe ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${post.likedByMe ? "fill-current" : ""}`} />
              {post.likeCount > 0 && <span>{post.likeCount}</span>}
            </button>
            {!isReply && !isLocked && currentUserId && (
              <button
                onClick={() => onReply(post.id)}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Reply
              </button>
            )}
            {(isAdmin || isAuthor) && (
              <>
                {isAdmin && post.isVisible && (
                  <button
                    onClick={() => onHide(post.id)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-amber-600 transition-colors"
                    title="Hide post"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(post.id)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-red-600 transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
