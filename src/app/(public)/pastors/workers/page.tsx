"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Users,
  Star,
  Shield,
  LogOut,
  Loader2,
} from "lucide-react";

interface WorkersMeeting {
  id: string;
  title: string;
  weekNumber: number;
  quarter: string;
  scripture: string | null;
  content: string | null;
}

interface ListItem {
  id: string;
  title: string;
  weekNumber: number;
  quarter: string;
  scripture: string | null;
}

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

function getCurrentWeek(): number {
  const now = new Date();
  const watOffset = 1 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wat = new Date(utc + watOffset * 60000);
  // Week 1 Sunday = April 12, 2026. Goes live Tue April 7, 2026 12:00 WAT
  const week1Live = new Date(2026, 3, 7, 12, 0, 0);
  const diffMs = wat.getTime() - week1Live.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(52, diffWeeks + 1));
}

function formatSundayDate(weekNumber: number): string {
  const base = new Date(2026, 3, 12);
  const sunday = new Date(base.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  return sunday.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SundayCalendar({
  items,
  activeWeek,
  onSelectWeek,
}: {
  items: ListItem[];
  activeWeek: number;
  onSelectWeek: (week: number) => void;
}) {
  const currentWeek = getCurrentWeek();
  const quarters: Record<string, ListItem[]> = {};
  items.forEach((item) => {
    const q = item.quarter || "Other";
    if (!quarters[q]) quarters[q] = [];
    quarters[q].push(item);
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border p-5">
      <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
        <Calendar className="h-4 w-4 text-primary" />
        Sunday Calendar
      </h3>
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {Object.entries(quarters).map(([quarter, weeks]) => (
          <div key={quarter}>
            <p className="text-xs font-semibold text-primary/80 mb-2 uppercase tracking-wide">
              {quarter}
            </p>
            <div className="space-y-1">
              {weeks.map((w) => {
                const isActive = w.weekNumber === activeWeek;
                const isCurrent = w.weekNumber === currentWeek;
                const sundayDate = new Date(2026, 3, 12 + (w.weekNumber - 1) * 7);
                const dateLabel = sundayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <button
                    key={w.weekNumber}
                    onClick={() => onSelectWeek(w.weekNumber)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 flex items-center justify-between gap-2 ${
                      isActive
                        ? "bg-primary text-white font-bold shadow-md"
                        : isCurrent
                          ? "bg-primary/10 ring-2 ring-primary hover:bg-primary/20 text-slate-800 font-medium"
                          : "hover:bg-primary/5 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                    title={w.title}
                  >
                    <span className="truncate">
                      <span className="font-semibold">Wk {w.weekNumber}</span>
                      <span className="mx-1">&middot;</span>
                      <span>{dateLabel}</span>
                    </span>
                    {isCurrent && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-primary" />
          <span>Viewing</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-primary/10 ring-1 ring-primary" />
          <span>This Week</span>
        </div>
      </div>
    </div>
  );
}

function WorkersPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const weekParam = searchParams.get("week");

  const [meeting, setMeeting] = useState<WorkersMeeting | null>(null);
  const [allWeeks, setAllWeeks] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const currentWeek = getCurrentWeek();
  const activeWeek = weekParam ? parseInt(weekParam) : currentWeek;

  const isAuthorized =
    status === "authenticated" &&
    (session?.user?.role === "pastor" || session?.user?.role === "admin");

  // One-time cleanup of legacy password-gate localStorage key
  useEffect(() => {
    try {
      localStorage.removeItem("tphc_pastor_access");
    } catch {}
  }, []);

  // Redirect unauthenticated/unauthorized users
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login?callbackUrl=/pastors/workers");
      return;
    }
    if (session.user?.role !== "pastor" && session.user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  const fetchMeeting = useCallback(async (week: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workers-meetings?week=${week}`);
      if (!res.ok) { setMeeting(null); return; }
      setMeeting(await res.json());
    } catch { setMeeting(null); } finally { setLoading(false); }
  }, []);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/workers-meetings?list=true");
      if (res.ok) setAllWeeks(await res.json());
    } catch {}
  }, []);

  useEffect(() => { if (isAuthorized) fetchMeeting(activeWeek); }, [activeWeek, fetchMeeting, isAuthorized]);
  useEffect(() => { if (isAuthorized) fetchList(); }, [fetchList, isAuthorized]);

  const navigateToWeek = (week: number) => {
    router.push(`/pastors/workers?week=${week}`);
    setShowCalendar(false);
  };

  const hasPrev = activeWeek > 1;
  const hasNext = activeWeek < 52;
  const prevItem = allWeeks.find((w) => w.weekNumber === activeWeek - 1);
  const nextItem = allWeeks.find((w) => w.weekNumber === activeWeek + 1);

  const parseContent = (content: string) => {
    const sections: { heading: string; body: string }[] = [];
    const lines = content.split("\n");
    let currentHeading = "";
    let currentBody: string[] = [];

    const flushSection = () => {
      if (currentHeading || currentBody.length > 0) {
        sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
      }
      currentHeading = "";
      currentBody = [];
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.length >= 5 &&
        trimmed === trimmed.toUpperCase() &&
        /^[A-Z]/.test(trimmed) &&
        !/^WEEK \d/.test(trimmed) &&
        !trimmed.startsWith('"') &&
        !/^\d+\./.test(trimmed) &&
        trimmed !== trimmed.toLowerCase()
      ) {
        flushSection();
        currentHeading = trimmed;
      } else {
        currentBody.push(line);
      }
    }
    flushSection();
    return sections;
  };

  const sectionColors: Record<string, string> = {
    "OPENING": "from-indigo-50 to-blue-50 border-indigo-200",
    "TEACHING": "from-green-50 to-emerald-50 border-green-200",
    "PRACTICAL": "from-orange-50 to-amber-50 border-orange-200",
    "APPLICATION": "from-orange-50 to-amber-50 border-orange-200",
    "CLOSING": "from-rose-50 to-pink-50 border-rose-200",
    "PRAYER": "from-rose-50 to-pink-50 border-rose-200",
    "DISCUSSION": "from-violet-50 to-purple-50 border-violet-200",
    "SCRIPTURE": "from-teal-50 to-cyan-50 border-teal-200",
    "STUDY": "from-green-50 to-emerald-50 border-green-200",
    "CONCLUSION": "from-rose-50 to-pink-50 border-rose-200",
  };

  const getSectionColor = (heading: string) => {
    for (const [key, value] of Object.entries(sectionColors)) {
      if (heading.includes(key)) return value;
    }
    return "from-slate-50 to-gray-50 border-slate-200";
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    // effect above will redirect; render nothing to avoid flash
    return null;
  }

  return (
    <>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">Pastor&apos;s Portal</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Users className="h-8 w-8" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Workers Teaching Manual
                </h1>
              </div>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                52-Week Training Manual &mdash; For study, preparation and preaching
              </p>
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* === LEFT: Content === */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline" size="sm" disabled={!hasPrev}
                onClick={() => hasPrev && navigateToWeek(activeWeek - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <Button
                variant="outline" size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
                className="gap-2 lg:hidden"
              >
                <Calendar className="h-4 w-4" />
                {showCalendar ? "Hide" : "Calendar"}
              </Button>

              <Button
                variant="outline" size="sm" disabled={!hasNext}
                onClick={() => hasNext && navigateToWeek(activeWeek + 1)}
                className="gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {showCalendar && (
              <div className="mb-6 lg:hidden">
                <SundayCalendar items={allWeeks} activeWeek={activeWeek} onSelectWeek={navigateToWeek} />
              </div>
            )}

            {loading && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border p-8 animate-pulse">
                <div className="h-4 w-40 bg-muted rounded mb-4" />
                <div className="h-8 w-3/4 bg-muted rounded mb-6" />
                <div className="h-20 bg-muted rounded" />
              </div>
            )}

            {!loading && !meeting && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border p-8 text-center">
                <Users className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No content for this week</p>
              </div>
            )}

            {!loading && meeting && (
              <article className="bg-white dark:bg-slate-800 rounded-xl shadow-md border overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4">
                  <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
                    <Star className="h-4 w-4" />
                    <span>{meeting.quarter} &bull; Week {meeting.weekNumber}</span>
                  </div>
                  <p className="text-slate-300 text-sm mt-1">
                    {formatSundayDate(meeting.weekNumber)}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold mt-2">
                    {meeting.title.replace(/^Week \d+:\s*/, "")}
                  </h2>
                </div>

                <div className="p-6 md:p-8">
                  {meeting.scripture && (
                    <blockquote className="bg-primary/5 border-l-4 border-primary p-4 md:p-5 rounded-r-lg mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Scripture Reference</span>
                      </div>
                      <p className="text-base font-medium text-slate-700 dark:text-slate-200">
                        {meeting.scripture}
                      </p>
                    </blockquote>
                  )}

                  {meeting.content && parseContent(meeting.content).map((section, i) => {
                    if (!section.heading && !section.body.trim()) return null;
                    const skip = ["SCRIPTURE", "TEACHING REFERENCE"];
                    if (skip.some((s) => section.heading.includes(s))) return null;
                    if (section.heading === meeting.title.replace(/^Week \d+:\s*/, "").toUpperCase()) return null;
                    if (!section.heading && i === 0) return null;

                    return (
                      <div
                        key={i}
                        className={`bg-gradient-to-br ${getSectionColor(section.heading)} dark:from-slate-800 dark:to-slate-700 rounded-xl p-5 md:p-6 mb-4 border dark:border-slate-600`}
                      >
                        {section.heading && (
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                            {section.heading}
                          </h3>
                        )}
                        <div className="space-y-3">
                          {section.body.split("\n\n").filter(Boolean).map((para, j) => {
                            const trimPara = para.trim();
                            if (!trimPara) return null;
                            if (trimPara.includes("\n\u2022") || trimPara.startsWith("\u2022") || trimPara.includes("\n•") || trimPara.startsWith("•")) {
                              return (
                                <div key={j} className="space-y-2">
                                  {trimPara.split("\n").filter((l) => l.trim()).map((b, k) => {
                                    const text = b.replace(/^[•\u2022]\s*/, "").trim();
                                    if (!text) return null;
                                    return b.trim().startsWith("•") || b.trim().startsWith("\u2022") ? (
                                      <div key={k} className="flex gap-2">
                                        <span className="text-primary mt-1 flex-shrink-0">&bull;</span>
                                        <p className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300">{text}</p>
                                      </div>
                                    ) : (
                                      <p key={k} className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{text}</p>
                                    );
                                  })}
                                </div>
                              );
                            }
                            if (/^\d+\.\s/.test(trimPara)) {
                              return (
                                <div key={j} className="space-y-3">
                                  {trimPara.split("\n").filter((l) => l.trim()).map((item, k) => (
                                    <p key={k} className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                                      {/^\d+\.\s/.test(item.trim()) ? (
                                        <><span className="font-bold text-primary">{item.trim().match(/^\d+\./)?.[0]}</span> {item.trim().replace(/^\d+\.\s*/, "")}</>
                                      ) : item.trim()}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return (
                              <p key={j} className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                                {trimPara}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  {hasPrev && prevItem ? (
                    <button onClick={() => navigateToWeek(activeWeek - 1)} className="text-left hover:text-primary transition-colors">
                      <div className="text-xs text-muted-foreground flex items-center gap-1"><ChevronLeft className="h-3 w-3" /> Previous</div>
                      <div className="text-sm font-medium mt-0.5 max-w-[200px] truncate">{prevItem.title}</div>
                    </button>
                  ) : <div />}
                  {hasNext && nextItem ? (
                    <button onClick={() => navigateToWeek(activeWeek + 1)} className="text-right hover:text-primary transition-colors">
                      <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">Next <ChevronRight className="h-3 w-3" /></div>
                      <div className="text-sm font-medium mt-0.5 max-w-[200px] truncate">{nextItem.title}</div>
                    </button>
                  ) : <div />}
                </div>
              </article>
            )}

            <div className="text-center mt-8">
              <Link href="/pastors" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                &larr; Back to Pastor&apos;s Portal
              </Link>
            </div>
          </div>

          <div className="hidden lg:block w-[300px] flex-shrink-0">
            <div className="sticky top-20">
              <SundayCalendar items={allWeeks} activeWeek={activeWeek} onSelectWeek={navigateToWeek} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PastorsWorkersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="container mx-auto px-4 py-10 md:py-14 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Workers Teaching Manual</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-md border p-8 animate-pulse">
            <div className="h-8 w-3/4 bg-muted rounded mb-6" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    }>
      <WorkersPortalContent />
    </Suspense>
  );
}
