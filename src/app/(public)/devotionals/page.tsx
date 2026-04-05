"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Sun,
} from "lucide-react";

interface Devotional {
  id: string;
  date: string;
  dayOfWeek: string;
  topic: string;
  scriptureRef: string;
  scriptureText: string;
  morningReading: string | null;
  body: string;
  prayerPoints: string[];
  isPublished: boolean;
}

interface Navigation {
  prev: { date: string; topic: string } | null;
  next: { date: string; topic: string } | null;
}

interface DevotionalListItem {
  id: string;
  date: string;
  dayOfWeek: string;
  topic: string;
  scriptureRef: string;
}

interface CalendarWidgetProps {
  archive: DevotionalListItem[];
  devotionalMap: Record<string, DevotionalListItem>;
  calendarMonth: Date;
  calendarMonthLabel: string;
  calendarYear: number;
  calendarMon: number;
  daysInMonth: number;
  firstDayOfWeek: number;
  activeDate: string;
  prevCalendarMonth: () => void;
  nextCalendarMonth: () => void;
  navigateToDate: (date: string) => void;
}

function CalendarWidget({
  archive,
  devotionalMap,
  calendarMonthLabel,
  calendarYear,
  calendarMon,
  daysInMonth,
  firstDayOfWeek,
  activeDate,
  prevCalendarMonth,
  nextCalendarMonth,
  navigateToDate,
}: CalendarWidgetProps) {
  if (archive.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border p-6">
        <p className="text-muted-foreground text-center py-4">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border p-5">
      <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
        <Calendar className="h-4 w-4 text-amber-600" />
        Devotional Calendar
      </h3>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevCalendarMonth}
          className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-amber-600" />
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-white">
          {calendarMonthLabel}
        </span>
        <button
          onClick={nextCalendarMonth}
          className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-amber-600" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
          <div
            key={`${day}-${idx}`}
            className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${calendarYear}-${String(calendarMon + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const devo = devotionalMap[dateStr];
          const isActive = dateStr === activeDate;
          const isToday = dateStr === new Date().toISOString().split("T")[0];

          const btnClasses = devo
            ? isActive
              ? "bg-amber-500 text-white shadow-md scale-110 font-bold"
              : isToday
                ? "bg-amber-100 ring-2 ring-amber-400 hover:bg-amber-200 cursor-pointer text-slate-800"
                : "bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-200 dark:hover:bg-amber-900/40 cursor-pointer text-slate-700 dark:text-slate-300"
            : "text-slate-300 dark:text-slate-600 cursor-default";

          return (
            <button
              key={dateStr}
              onClick={() => devo && navigateToDate(dateStr)}
              disabled={!devo}
              className={`relative aspect-square rounded-md flex flex-col items-center justify-center transition-all duration-150 group text-xs ${btnClasses}`}
              title={devo ? devo.topic : undefined}
            >
              <span className="font-semibold">{dayNum}</span>
              {devo && !isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-500 mt-0.5" />
              )}
              {/* Tooltip */}
              {devo && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 pointer-events-none">
                  <div className="bg-slate-800 text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg max-w-[180px]">
                    <p className="font-semibold truncate">{devo.topic}</p>
                    <p className="text-slate-300 truncate">{devo.scriptureRef}</p>
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-800 rotate-45 mx-auto -mt-0.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-amber-500" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-200" />
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}

function DevotionalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get("date");

  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [navigation, setNavigation] = useState<Navigation>({ prev: null, next: null });
  const [archive, setArchive] = useState<DevotionalListItem[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevotional = useCallback(async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = date
        ? `/api/devotionals?date=${date}`
        : "/api/devotionals";
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          setError("No devotional available for this date.");
          setDevotional(null);
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setDevotional(data.devotional);
      setNavigation(data.navigation);
    } catch {
      setError("Unable to load devotional. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArchive = useCallback(async () => {
    try {
      const res = await fetch("/api/devotionals?list=true");
      if (res.ok) {
        const data = await res.json();
        setArchive(data.devotionals);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchDevotional(dateParam || undefined);
  }, [dateParam, fetchDevotional]);

  // Always fetch archive on mount (calendar is always visible on desktop)
  useEffect(() => {
    if (archive.length === 0) {
      fetchArchive();
    }
  }, [archive.length, fetchArchive]);

  const navigateToDate = (date: string) => {
    router.push(`/devotionals?date=${date}`);
    setShowArchive(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Build a map of date -> devotional for quick lookup
  const devotionalMap: Record<string, DevotionalListItem> = {};
  archive.forEach((item) => {
    const d = typeof item.date === "string" ? item.date.split("T")[0] : item.date;
    devotionalMap[d] = item;
  });

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (dateParam) return new Date(dateParam + "T00:00:00");
    if (archive.length > 0) {
      const firstDate = typeof archive[0].date === "string" ? archive[0].date.split("T")[0] : archive[0].date;
      return new Date(firstDate + "T00:00:00");
    }
    return new Date();
  });

  // Update calendar month when archive loads
  useEffect(() => {
    if (archive.length > 0 && !dateParam) {
      const firstDate = typeof archive[0].date === "string" ? archive[0].date.split("T")[0] : archive[0].date;
      setCalendarMonth(new Date(firstDate + "T00:00:00"));
    }
  }, [archive, dateParam]);

  const calendarYear = calendarMonth.getFullYear();
  const calendarMon = calendarMonth.getMonth();
  const daysInMonth = new Date(calendarYear, calendarMon + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMon, 1).getDay(); // 0=Sun

  const calendarMonthLabel = new Date(calendarYear, calendarMon).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevCalendarMonth = () => setCalendarMonth(new Date(calendarYear, calendarMon - 1, 1));
  const nextCalendarMonth = () => setCalendarMonth(new Date(calendarYear, calendarMon + 1, 1));

  // Get the currently viewed date for highlighting
  const activeDate = dateParam || (devotional ? (typeof devotional.date === "string" ? devotional.date.split("T")[0] : devotional.date) : "");

  return (
    <>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white">
        <div className="container mx-auto px-4 py-10 md:py-14 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sun className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Early Will I Seek Thee
            </h1>
          </div>
          <p className="text-amber-100 text-lg max-w-2xl mx-auto">
            Daily Devotional Guide &mdash; Start your day with God&apos;s Word
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* === LEFT: Devotional Content === */}
          <div className="flex-1 min-w-0">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                disabled={!navigation.prev}
                onClick={() => navigation.prev && navigateToDate(navigation.prev.date)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {/* Mobile-only calendar toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchive(!showArchive)}
                className="gap-2 lg:hidden"
              >
                <Calendar className="h-4 w-4" />
                {showArchive ? "Hide Calendar" : "Calendar"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!navigation.next}
                onClick={() => navigation.next && navigateToDate(navigation.next.date)}
                className="gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Calendar (toggled) */}
            {showArchive && (
              <div className="mb-6 lg:hidden">
                <CalendarWidget
                  archive={archive}
                  devotionalMap={devotionalMap}
                  calendarMonth={calendarMonth}
                  calendarMonthLabel={calendarMonthLabel}
                  calendarYear={calendarYear}
                  calendarMon={calendarMon}
                  daysInMonth={daysInMonth}
                  firstDayOfWeek={firstDayOfWeek}
                  activeDate={activeDate}
                  prevCalendarMonth={prevCalendarMonth}
                  nextCalendarMonth={nextCalendarMonth}
                  navigateToDate={navigateToDate}
                />
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border p-8 animate-pulse">
                <div className="h-4 w-40 bg-muted rounded mb-4" />
                <div className="h-8 w-3/4 bg-muted rounded mb-6" />
                <div className="h-20 bg-muted rounded mb-6" />
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-4/6" />
                </div>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border p-8 text-center">
                <Sun className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">{error}</p>
                <p className="text-muted-foreground mb-4">
                  Check back later or browse the calendar for available devotionals.
                </p>
              </div>
            )}

            {/* Devotional Content */}
            {!loading && devotional && (
              <article className="bg-white dark:bg-slate-800 rounded-xl shadow-md border overflow-hidden">
                {/* Date Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4">
                  <p className="text-amber-100 text-sm font-medium">
                    {formatDate(typeof devotional.date === "string" ? devotional.date.split("T")[0] : devotional.date)}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold mt-1">
                    {devotional.topic}
                  </h2>
                </div>

                <div className="p-6 md:p-8">
                  {/* Scripture Verse */}
                  <blockquote className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 md:p-5 rounded-r-lg mb-6">
                    <p className="text-lg md:text-xl italic text-slate-700 dark:text-slate-200 leading-relaxed">
                      &ldquo;{devotional.scriptureText}&rdquo;
                    </p>
                    <footer className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                      &mdash; {devotional.scriptureRef}
                    </footer>
                  </blockquote>

                  {/* Morning Reading */}
                  {devotional.morningReading && (
                    <div className="flex items-center gap-2 mb-6 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg">
                      <BookOpen className="h-4 w-4 flex-shrink-0" />
                      <span>
                        <strong>Daily Reading:</strong> {devotional.morningReading}
                      </span>
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                    {devotional.body.split(/\n\n|\n/).filter(Boolean).map((paragraph: string, i: number) => (
                      <p key={i} className="text-base md:text-lg leading-relaxed text-slate-800 dark:text-slate-300 mb-4">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>

                  {/* Prayer Points */}
                  {devotional.prayerPoints && devotional.prayerPoints.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-5 md:p-6">
                      <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
                        Prayer Points
                      </h3>
                      <ol className="space-y-3">
                        {devotional.prayerPoints.map((prayer: string, i: number) => (
                          <li key={i} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-sm flex items-center justify-center font-semibold">
                              {i + 1}
                            </span>
                            <p className="text-slate-800 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                              {prayer}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="border-t px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  {navigation.prev ? (
                    <button
                      onClick={() => navigateToDate(navigation.prev!.date)}
                      className="text-left hover:text-amber-600 transition-colors"
                    >
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <ChevronLeft className="h-3 w-3" /> Previous
                      </div>
                      <div className="text-sm font-medium mt-0.5">{navigation.prev.topic}</div>
                    </button>
                  ) : <div />}
                  {navigation.next ? (
                    <button
                      onClick={() => navigateToDate(navigation.next!.date)}
                      className="text-right hover:text-amber-600 transition-colors"
                    >
                      <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        Next <ChevronRight className="h-3 w-3" />
                      </div>
                      <div className="text-sm font-medium mt-0.5">{navigation.next.topic}</div>
                    </button>
                  ) : <div />}
                </div>
              </article>
            )}

            {/* Back to Home */}
            <div className="text-center mt-8">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-amber-600 transition-colors"
              >
                &larr; Back to Home
              </Link>
            </div>
          </div>

          {/* === RIGHT: Calendar Sidebar (always visible on desktop) === */}
          <div className="hidden lg:block w-[340px] flex-shrink-0">
            <div className="sticky top-20">
              <CalendarWidget
                archive={archive}
                devotionalMap={devotionalMap}
                calendarMonth={calendarMonth}
                calendarMonthLabel={calendarMonthLabel}
                calendarYear={calendarYear}
                calendarMon={calendarMon}
                daysInMonth={daysInMonth}
                firstDayOfWeek={firstDayOfWeek}
                activeDate={activeDate}
                prevCalendarMonth={prevCalendarMonth}
                nextCalendarMonth={nextCalendarMonth}
                navigateToDate={navigateToDate}
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default function DevotionalsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
          <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white">
            <div className="container mx-auto px-4 py-10 md:py-14 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sun className="h-8 w-8" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Early Will I Seek Thee
                </h1>
              </div>
              <p className="text-amber-100 text-lg max-w-2xl mx-auto">
                Daily Devotional Guide &mdash; Start your day with God&apos;s Word
              </p>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-xl shadow-md border p-8 animate-pulse">
              <div className="h-4 w-40 bg-muted rounded mb-4" />
              <div className="h-8 w-3/4 bg-muted rounded mb-6" />
              <div className="h-20 bg-muted rounded mb-6" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <DevotionalContent />
    </Suspense>
  );
}
