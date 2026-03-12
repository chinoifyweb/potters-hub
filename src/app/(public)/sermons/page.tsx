"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Play, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const categories = ["All", "Faith", "Prayer", "Family", "Leadership", "Worship", "Youth"];
const speakers = ["All Speakers", "Pastor James Okafor", "Pastor Grace Adeyemi", "Minister David Eze", "Deaconess Sarah Nwosu"];

const sermons = [
  {
    id: "1",
    title: "Walking in Faith",
    speaker: "Pastor James Okafor",
    date: "March 10, 2026",
    duration: "45 min",
    category: "Faith",
    series: "Foundations of Faith",
    slug: "walking-in-faith",
  },
  {
    id: "2",
    title: "The Power of Prayer",
    speaker: "Pastor Grace Adeyemi",
    date: "March 3, 2026",
    duration: "38 min",
    category: "Prayer",
    series: "Prayer Warriors",
    slug: "the-power-of-prayer",
  },
  {
    id: "3",
    title: "Living with Purpose",
    speaker: "Pastor James Okafor",
    date: "February 24, 2026",
    duration: "42 min",
    category: "Faith",
    series: "Foundations of Faith",
    slug: "living-with-purpose",
  },
  {
    id: "4",
    title: "Building Strong Families",
    speaker: "Deaconess Sarah Nwosu",
    date: "February 17, 2026",
    duration: "40 min",
    category: "Family",
    series: "Family Matters",
    slug: "building-strong-families",
  },
  {
    id: "5",
    title: "Leading with Integrity",
    speaker: "Minister David Eze",
    date: "February 10, 2026",
    duration: "35 min",
    category: "Leadership",
    series: "Kingdom Leaders",
    slug: "leading-with-integrity",
  },
  {
    id: "6",
    title: "Worship in Spirit and Truth",
    speaker: "Pastor Grace Adeyemi",
    date: "February 3, 2026",
    duration: "44 min",
    category: "Worship",
    series: "Heart of Worship",
    slug: "worship-in-spirit-and-truth",
  },
  {
    id: "7",
    title: "The Armor of God",
    speaker: "Pastor James Okafor",
    date: "January 27, 2026",
    duration: "48 min",
    category: "Faith",
    series: "Spiritual Warfare",
    slug: "the-armor-of-god",
  },
  {
    id: "8",
    title: "Raising Godly Children",
    speaker: "Deaconess Sarah Nwosu",
    date: "January 20, 2026",
    duration: "36 min",
    category: "Family",
    series: "Family Matters",
    slug: "raising-godly-children",
  },
  {
    id: "9",
    title: "Finding Your Calling",
    speaker: "Minister David Eze",
    date: "January 13, 2026",
    duration: "41 min",
    category: "Youth",
    series: "Next Gen",
    slug: "finding-your-calling",
  },
];

export default function SermonsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSpeaker, setSelectedSpeaker] = useState("All Speakers");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = sermons.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.speaker.toLowerCase().includes(search.toLowerCase()) ||
      s.series.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || s.category === selectedCategory;
    const matchesSpeaker =
      selectedSpeaker === "All Speakers" || s.speaker === selectedSpeaker;
    return matchesSearch && matchesCategory && matchesSpeaker;
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-700 to-red-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Sermons</h1>
          <p className="text-red-100 mt-3 max-w-xl mx-auto">
            Explore our collection of messages to grow your faith and deepen your understanding of God&apos;s Word.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sermons, speakers, series..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 border rounded-lg bg-slate-50 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={selectedCategory === cat ? "default" : "outline"}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Speaker</p>
                <div className="flex flex-wrap gap-2">
                  {speakers.map((sp) => (
                    <Button
                      key={sp}
                      size="sm"
                      variant={selectedSpeaker === sp ? "default" : "outline"}
                      onClick={() => setSelectedSpeaker(sp)}
                    >
                      {sp}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} sermon{filtered.length !== 1 ? "s" : ""} found
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((sermon) => (
              <Link key={sermon.id} href={`/sermons/${sermon.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                  <div className="aspect-video bg-gradient-to-br from-red-100 to-red-200 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-900/20 group-hover:bg-red-900/30 transition-colors" />
                    <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-primary ml-1" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sermon.duration}
                    </div>
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      {sermon.category}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      {sermon.series}
                    </p>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {sermon.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {sermon.speaker}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {sermon.date}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No sermons found matching your search.</p>
              <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}

          {/* Pagination placeholder */}
          {filtered.length > 0 && (
            <div className="flex justify-center gap-2 mt-10">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
