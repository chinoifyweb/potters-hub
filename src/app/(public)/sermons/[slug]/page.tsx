"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Calendar,
  BookOpen,
  Share2,
  Facebook,
  Twitter,
  Copy,
  ArrowLeft,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Sample sermon data
const sermon = {
  id: "1",
  title: "Walking in Faith",
  speaker: "Pastor James Okafor",
  date: "March 10, 2026",
  duration: "45 min",
  category: "Faith",
  series: "Foundations of Faith",
  scripture: "Hebrews 11:1-6",
  description:
    "In this powerful message, Pastor James explores what it truly means to walk by faith and not by sight. Drawing from the lives of biblical heroes, he shows us that faith is not merely belief, but active trust in God's promises. Whether you are facing uncertainty, making difficult decisions, or seeking direction, this sermon will encourage you to take bold steps of faith and trust God with the outcome.",
  videoUrl: "",
  audioUrl: "",
  slug: "walking-in-faith",
};

const relatedSermons = [
  {
    id: "3",
    title: "Living with Purpose",
    speaker: "Pastor James Okafor",
    date: "February 24, 2026",
    duration: "42 min",
    slug: "living-with-purpose",
  },
  {
    id: "7",
    title: "The Armor of God",
    speaker: "Pastor James Okafor",
    date: "January 27, 2026",
    duration: "48 min",
    slug: "the-armor-of-god",
  },
  {
    id: "2",
    title: "The Power of Prayer",
    speaker: "Pastor Grace Adeyemi",
    date: "March 3, 2026",
    duration: "38 min",
    slug: "the-power-of-prayer",
  },
];

export default function SermonDetailPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      setProgress(Math.max(0, Math.min(100, pct)));
    }
  };

  return (
    <div>
      {/* Back Link */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/sermons"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Sermons
        </Link>
      </div>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player Area */}
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="text-center text-white/60 space-y-3">
                  <Play className="h-16 w-16 mx-auto" />
                  <p className="text-sm">Video Player</p>
                </div>
              </div>

              {/* Audio Player */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setProgress(Math.max(0, progress - 5))}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <SkipBack className="h-5 w-5" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setProgress(Math.min(100, progress + 5))}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <SkipForward className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      <div
                        ref={progressRef}
                        onClick={handleProgressClick}
                        className="h-2 bg-slate-200 rounded-full cursor-pointer relative"
                      >
                        <div
                          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-primary rounded-full shadow-md border-2 border-white"
                          style={{ left: `calc(${progress}% - 8px)` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>
                          {Math.floor((progress / 100) * 45)}:
                          {String(
                            Math.floor(((progress / 100) * 45 * 60) % 60)
                          ).padStart(2, "0")}
                        </span>
                        <span>45:00</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sermon Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-primary font-medium">
                    {sermon.series}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold mt-1">
                    {sermon.title}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {sermon.speaker}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {sermon.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {sermon.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {sermon.scripture}
                  </span>
                </div>

                {/* Share */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description */}
                <div className="prose prose-slate max-w-none">
                  <h3 className="text-lg font-semibold">About This Sermon</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {sermon.description}
                  </p>
                </div>

                {/* Notes Section */}
                <Card className="bg-slate-50">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-2">Sermon Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      <Link href="/login" className="text-primary hover:underline">
                        Sign in
                      </Link>{" "}
                      to take notes on this sermon and save them to your account.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar - Related Sermons */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Related Sermons</h2>
              {relatedSermons.map((related) => (
                <Link key={related.id} href={`/sermons/${related.slug}`}>
                  <Card className="group hover:shadow-md transition-shadow mb-4">
                    <CardContent className="p-0">
                      <div className="flex gap-3">
                        <div className="w-32 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-l-lg flex items-center justify-center shrink-0">
                          <Play className="h-6 w-6 text-primary/60" />
                        </div>
                        <div className="py-2 pr-3">
                          <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {related.speaker}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {related.duration}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
