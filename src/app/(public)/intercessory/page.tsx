"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Heart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface PrayerPoint {
  order: number;
  title: string;
  scripture: string;
  scriptureText: string;
  prayer: string;
}

interface IntercessorySet {
  id: string;
  weekNumber: number;
  fridayDate: string;
  title: string;
  intro: string | null;
  prayerPoints: PrayerPoint[];
}

interface ListItem {
  id: string;
  weekNumber: number;
  fridayDate: string;
  title: string;
}

function formatFriday(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function IntercessoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const weekParam = searchParams.get("week");

  const [set, setSet] = useState<IntercessorySet | null>(null);
  const [list, setList] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (week: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const url = week
        ? `/api/intercessory?week=${encodeURIComponent(week)}`
        : `/api/intercessory`;
      const [setRes, listRes] = await Promise.all([
        fetch(url, { cache: "no-store" }),
        fetch(`/api/intercessory?list=true`, { cache: "no-store" }),
      ]);

      if (!setRes.ok) {
        if (setRes.status === 404) {
          setSet(null);
          setError("No intercessory prayer guide available yet.");
        } else {
          throw new Error(`HTTP ${setRes.status}`);
        }
      } else {
        const data = await setRes.json();
        setSet(data.set);
      }

      if (listRes.ok) {
        const lj = await listRes.json();
        setList(lj.sets || []);
      }
    } catch (e) {
      console.error(e);
      setError("Unable to load prayer guide. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(weekParam);
  }, [weekParam, load]);

  const currentWeek = set?.weekNumber ?? null;
  const sortedWeeks = [...list].sort((a, b) => a.weekNumber - b.weekNumber);
  const idx = currentWeek
    ? sortedWeeks.findIndex((l) => l.weekNumber === currentWeek)
    : -1;
  const prevWeek = idx > 0 ? sortedWeeks[idx - 1].weekNumber : null;
  const nextWeek =
    idx >= 0 && idx < sortedWeeks.length - 1
      ? sortedWeeks[idx + 1].weekNumber
      : null;

  const goWeek = (w: number | null) => {
    if (w == null) return;
    router.push(`/intercessory?week=${w}`);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, #f8f3e5 0%, #f5f1e8 40%, #efe7d2 100%)",
      }}
    >
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1a4731 0%, #25623f 45%, #3b7a48 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(600px 300px at 80% 20%, rgba(212,168,67,0.45), transparent 70%), radial-gradient(500px 260px at 10% 90%, rgba(212,168,67,0.25), transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#d4a843]/60 bg-[#1a4731]/40 backdrop-blur-sm mb-6 shadow-lg">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4a843]" strokeWidth={1.5} />
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-[#f8f3e5] tracking-tight leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
          >
            Intercessory Prayer
          </h1>
          <div className="mt-4 flex items-center justify-center gap-2 text-[#d4a843] text-sm sm:text-base font-medium tracking-wide">
            <Calendar className="w-4 h-4" />
            <span>Every Friday &middot; 6:00 PM &middot; The Potter&apos;s House Church</span>
          </div>
          <p
            className="mt-6 text-[#f5f1e8]/85 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Standing together in the gap. Praying always, with all perseverance and supplication for all saints.
          </p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#1a4731]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="font-serif">Loading prayer guide&hellip;</span>
          </div>
        ) : error && !set ? (
          <div className="bg-white/70 border border-[#d4a843]/30 rounded-2xl p-10 text-center shadow-sm">
            <Heart className="w-10 h-10 text-[#d4a843] mx-auto mb-4" />
            <p className="text-[#1a4731] font-serif text-lg">{error}</p>
          </div>
        ) : set ? (
          <>
            {/* Date + Week badge banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 border border-[#d4a843]/30 rounded-2xl px-6 py-5 shadow-sm mb-10">
              <div className="flex items-center gap-3 text-[#1a4731]">
                <Calendar className="w-5 h-5 text-[#d4a843]" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#1a4731]/60 font-semibold">
                    This Friday
                  </div>
                  <div
                    className="text-lg font-semibold"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {formatFriday(set.fridayDate)}
                  </div>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold tracking-wide text-[#1a4731]"
                style={{
                  background:
                    "linear-gradient(135deg, #f1d88a 0%, #d4a843 100%)",
                  boxShadow: "0 2px 8px rgba(212,168,67,0.25)",
                }}
              >
                Week {set.weekNumber}
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-3xl sm:text-4xl font-semibold text-[#1a4731] text-center mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {set.title}
            </h2>

            {/* Intro scripture */}
            {set.intro && (
              <blockquote
                className="relative mx-auto max-w-2xl my-8 px-6 sm:px-10 py-6 border-l-4 border-[#d4a843] bg-white/60 rounded-r-xl shadow-sm"
              >
                <div className="absolute -top-3 left-6 text-5xl text-[#d4a843]/50 font-serif leading-none select-none">
                  &ldquo;
                </div>
                <p
                  className="text-[#1a4731]/90 italic text-lg sm:text-xl leading-relaxed"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {set.intro}
                </p>
              </blockquote>
            )}

            {/* Gold divider */}
            <div className="flex items-center justify-center my-12">
              <div className="h-px w-16 bg-[#d4a843]/40" />
              <Heart className="w-4 h-4 text-[#d4a843] mx-3" />
              <div className="h-px w-16 bg-[#d4a843]/40" />
            </div>

            {/* Prayer points */}
            <div className="space-y-8">
              {[...set.prayerPoints]
                .sort((a, b) => a.order - b.order)
                .map((pt) => (
                  <article
                    key={pt.order}
                    className="relative bg-white/80 backdrop-blur-sm border border-[#d4a843]/20 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8"
                  >
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div
                        className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-[#1a4731] shadow-md"
                        style={{
                          background:
                            "linear-gradient(135deg, #f1d88a 0%, #d4a843 100%)",
                          fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                      >
                        {pt.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-xl sm:text-2xl font-semibold text-[#1a4731] leading-snug"
                          style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                          }}
                        >
                          {pt.title}
                        </h3>
                        <div className="mt-1 text-sm font-semibold uppercase tracking-wider text-[#b8892a]">
                          {pt.scripture}
                        </div>

                        <blockquote
                          className="mt-4 pl-4 border-l-2 border-[#d4a843]/60 italic text-[#1a4731]/80 text-base sm:text-lg leading-relaxed"
                          style={{
                            fontFamily: "Georgia, 'Times New Roman', serif",
                          }}
                        >
                          &ldquo;{pt.scriptureText}&rdquo;
                        </blockquote>

                        <p
                          className="mt-5 text-[#2a2a2a] text-base sm:text-[1.05rem] leading-[1.85]"
                          style={{
                            fontFamily: "Georgia, 'Times New Roman', serif",
                          }}
                        >
                          {pt.prayer}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
            </div>

            {/* Footer benediction */}
            <div className="mt-16 mb-6 text-center">
              <div className="flex items-center justify-center my-6">
                <div className="h-px w-20 bg-[#d4a843]/40" />
                <span className="mx-3 text-2xl" aria-hidden>&#128331;</span>
                <div className="h-px w-20 bg-[#d4a843]/40" />
              </div>
              <p
                className="text-[#1a4731] text-lg sm:text-xl italic"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Come with expectation. The Lord hears us.
              </p>
              <p className="mt-2 text-sm text-[#1a4731]/60">
                The Potter&apos;s House Church &middot; Intercessory Fellowship
              </p>
            </div>

            {/* Week navigation */}
            {(prevWeek !== null || nextWeek !== null) && (
              <div className="mt-10 flex items-center justify-between gap-3">
                <button
                  disabled={prevWeek === null}
                  onClick={() => goWeek(prevWeek)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1a4731]/20 bg-white/70 text-[#1a4731] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm">
                    {prevWeek !== null ? `Week ${prevWeek}` : "Previous"}
                  </span>
                </button>
                <button
                  disabled={nextWeek === null}
                  onClick={() => goWeek(nextWeek)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1a4731]/20 bg-white/70 text-[#1a4731] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
                >
                  <span className="text-sm">
                    {nextWeek !== null ? `Week ${nextWeek}` : "Next"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}

export default function IntercessoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f5f1e8] text-[#1a4731]">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading&hellip;</span>
        </div>
      }
    >
      <IntercessoryContent />
    </Suspense>
  );
}
