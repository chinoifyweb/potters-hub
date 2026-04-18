"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Calendar,
  User,
  Lock,
  ChevronDown,
  ChevronUp,
  Mic,
  Video,
  FileText,
  Shield,
  Filter,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

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

const categoryLabels: Record<string, string> = {
  sermon: "Sermon",
  teaching: "Teaching",
  "pastoral-care": "Pastoral Care",
  administration: "Administration",
  strategy: "Strategy",
  devotional: "Devotional",
};

const categoryColors: Record<string, string> = {
  sermon: "bg-blue-100 text-blue-800",
  teaching: "bg-purple-100 text-purple-800",
  "pastoral-care": "bg-green-100 text-green-800",
  administration: "bg-orange-100 text-orange-800",
  strategy: "bg-cyan-100 text-cyan-800",
  devotional: "bg-amber-100 text-amber-800",
};

async function handlePortalLogout() {
  try {
    await signOut({ redirect: false });
  } catch {}
  try {
    await fetch("/api/auth/hard-logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
  } catch {}
  try {
    const killNames = [
      "__Secure-next-auth.session-token",
      "next-auth.session-token",
      "__Host-next-auth.csrf-token",
      "next-auth.csrf-token",
      "__Secure-next-auth.callback-url",
      "next-auth.callback-url",
    ];
    const killDomains = [
      "",
      "; domain=.tphc.org.ng",
      "; domain=tphc.org.ng",
      "; domain=www.tphc.org.ng",
      "; domain=admin.tphc.org.ng",
    ];
    for (const n of killNames) {
      for (const d of killDomains) {
        document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
        document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}; secure; samesite=lax`;
      }
    }
  } catch {}
  try {
    localStorage.removeItem("tphc_pastor_access");
  } catch {}
  window.location.href = "/login?t=" + Date.now();
}

export default function PastorsPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<PastorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // One-time cleanup of legacy password-gate localStorage key
  useEffect(() => {
    try {
      localStorage.removeItem("tphc_pastor_access");
    } catch {}
  }, []);

  // Redirect if not authenticated or not a pastor/admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login?callbackUrl=/pastors");
      return;
    }
    if (session.user?.role !== "pastor" && session.user?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Fetch messages
  useEffect(() => {
    if (
      status !== "authenticated" ||
      (session?.user?.role !== "pastor" && session?.user?.role !== "admin")
    )
      return;

    async function fetchMessages() {
      try {
        const res = await fetch("/api/pastor-messages");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Error fetching pastor messages:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [session, status]);

  // Show loading state while session resolves
  if (status === "loading" || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Role check — middleware also enforces this
  if (session.user?.role !== "pastor" && session.user?.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold">Access Restricted</h2>
            <p className="text-muted-foreground">
              This portal is exclusively for pastors and church leadership. Please log in with your pastoral credentials.
            </p>
            <Button asChild>
              <Link href="/login?callbackUrl=/pastors">Log In as Pastor</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = Array.from(new Set(messages.map((m) => m.category)));

  const filtered = messages.filter((m) => {
    const matchSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.speaker?.toLowerCase().includes(search.toLowerCase()) ||
      m.scriptureReference?.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }} />
        </div>
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30">
                  Pastors Only
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Pastor&apos;s Portal
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl">
                Sermons, teachings, and resources exclusively for pastors and church leadership. Equipping those who equip others.
              </p>
              <div className="mt-6 flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {messages.length} Messages
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  Welcome, {session.user?.name || "Pastor"}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePortalLogout}
              className="text-red-300 hover:text-white hover:bg-red-500/20 shrink-0"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="container mx-auto px-4 -mt-6 relative z-10 mb-6">
        <Card className="shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Workers Teaching Manual</h3>
                <p className="text-sm text-muted-foreground">52-week training curriculum for workers</p>
              </div>
            </div>
            <Button asChild variant="default" size="sm">
              <Link href="/pastors/workers">Open Manual</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="container mx-auto px-4 relative z-10">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search messages by title, speaker, or scripture..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabels[c] || c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No messages found</h3>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((message) => {
              const isExpanded = expandedId === message.id;
              return (
                <Card
                  key={message.id}
                  className="overflow-hidden transition-all hover:shadow-md"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : message.id)
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className={
                              categoryColors[message.category] ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {categoryLabels[message.category] ||
                              message.category}
                          </Badge>
                          {message.audioUrl && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Mic className="h-3 w-3" />
                              Audio
                            </Badge>
                          )}
                          {message.videoUrl && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Video className="h-3 w-3" />
                              Video
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {message.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {message.speaker || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(message.date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                          {message.scriptureReference && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              {message.scriptureReference}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 mt-1">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-slate-50/50">
                      <div className="p-5 space-y-5">
                        {message.content && (
                          <div>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              Message Overview
                            </h4>
                            <p className="text-foreground leading-relaxed whitespace-pre-line">
                              {message.content}
                            </p>
                          </div>
                        )}
                        {message.notes && (
                          <div>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              Sermon Notes &amp; Outline
                            </h4>
                            <div className="bg-white rounded-lg border p-4">
                              <pre className="text-sm text-foreground whitespace-pre-line font-sans leading-relaxed">
                                {message.notes}
                              </pre>
                            </div>
                          </div>
                        )}
                        {(message.audioUrl || message.videoUrl) && (
                          <div className="flex gap-3 pt-2">
                            {message.audioUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={message.audioUrl} target="_blank" rel="noopener noreferrer">
                                  <Mic className="mr-2 h-4 w-4" />
                                  Listen to Audio
                                </a>
                              </Button>
                            )}
                            {message.videoUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={message.videoUrl} target="_blank" rel="noopener noreferrer">
                                  <Video className="mr-2 h-4 w-4" />
                                  Watch Video
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
