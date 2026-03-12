"use client";

import Link from "next/link";
import {
  Play,
  Calendar,
  Heart,
  Users,
  Radio,
  Smartphone,
  ArrowRight,
  Clock,
  MapPin,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const latestSermons = [
  {
    id: "1",
    title: "Walking in Faith",
    speaker: "Pastor James Okafor",
    date: "March 10, 2026",
    duration: "45 min",
    thumbnail: null,
    slug: "walking-in-faith",
  },
  {
    id: "2",
    title: "The Power of Prayer",
    speaker: "Pastor Grace Adeyemi",
    date: "March 3, 2026",
    duration: "38 min",
    thumbnail: null,
    slug: "the-power-of-prayer",
  },
  {
    id: "3",
    title: "Living with Purpose",
    speaker: "Pastor James Okafor",
    date: "February 24, 2026",
    duration: "42 min",
    thumbnail: null,
    slug: "living-with-purpose",
  },
];

const upcomingEvents = [
  {
    id: "1",
    title: "Easter Sunday Celebration",
    date: "April 5, 2026",
    time: "8:00 AM",
    location: "Main Sanctuary",
    description: "Join us for a special Easter service with worship, drama, and a message of hope.",
  },
  {
    id: "2",
    title: "Youth Conference 2026",
    date: "April 18-19, 2026",
    time: "9:00 AM",
    location: "Church Auditorium",
    description: "An empowering weekend for young people to grow in faith and community.",
  },
  {
    id: "3",
    title: "Marriage Retreat",
    date: "May 2, 2026",
    time: "10:00 AM",
    location: "Grace Conference Center",
    description: "Strengthen your marriage with a day of teaching, activities, and fellowship.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-700 via-red-800 to-secondary text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTIwIDBDOC45NTQgMCAwIDguOTU0IDAgMjBzOC45NTQgMjAgMjAgMjAgMjAtOC45NTQgMjAtMjBTMzEuMDQ2IDAgMjAgMHptMCAzNmMtOC44MzcgMC0xNi03LjE2My0xNi0xNlMxMS4xNjMgNCAyMCA0czE2IDcuMTYzIDE2IDE2LTcuMTYzIDE2LTE2IDE2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Transforming Lives, Remolding Destinies
            </h1>
            <p className="text-lg md:text-xl text-red-100 max-w-2xl mx-auto">
              Welcome to The Potter&apos;s House Church — a community where faith comes alive.
              Experience God&apos;s love through worship, fellowship, and service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-white text-red-800 hover:bg-red-50 h-12 px-8 text-base"
                asChild
              >
                <Link href="/sermons">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Sermons
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 h-12 px-8 text-base"
                asChild
              >
                <Link href="/about">
                  Join Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 80V40C240 0 480 0 720 40C960 80 1200 80 1440 40V80H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">About Our Church</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The Potter&apos;s House Church is a vibrant, Bible-believing community in the heart of Makurdi.
              Transforming Lives, Remolding Destinies — we have been a place where people from all walks of
              life come together to worship God, grow in faith, and make a difference
              in the world.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">
                Learn More About Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Sermons */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Latest Sermons</h2>
              <p className="text-muted-foreground mt-2">
                Catch up on recent messages from our pastors
              </p>
            </div>
            <Button variant="outline" className="hidden sm:flex" asChild>
              <Link href="/sermons">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestSermons.map((sermon) => (
              <Link key={sermon.id} href={`/sermons/${sermon.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                  <div className="aspect-video bg-gradient-to-br from-red-100 to-red-200 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-900/20 group-hover:bg-red-900/30 transition-colors" />
                    <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-primary ml-1" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {sermon.duration}
                    </div>
                  </div>
                  <CardContent className="p-4">
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
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/sermons">
                View All Sermons
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Upcoming Events</h2>
              <p className="text-muted-foreground mt-2">
                Join us for these upcoming gatherings
              </p>
            </div>
            <Button variant="outline" className="hidden sm:flex" asChild>
              <Link href="/events">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="bg-primary p-4 text-white text-center">
                    <p className="text-sm font-medium uppercase tracking-wider">
                      {event.date}
                    </p>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Give Online Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Heart className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Give Online</h2>
            <p className="text-muted-foreground text-lg">
              Your generosity helps us spread the Gospel, support those in need,
              and build our community. Give securely online today.
            </p>
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 h-12 px-8 text-base"
              asChild
            >
              <Link href="/give">
                <Heart className="mr-2 h-5 w-5" />
                Give Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Join a Group */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">Join a Group</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Get connected with a small group and grow in fellowship
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, title: "Bible Study", desc: "Dive deeper into God's Word" },
              { icon: Users, title: "Men's Fellowship", desc: "Brotherhood and accountability" },
              { icon: Users, title: "Women's Ministry", desc: "Support, prayer, and growth" },
              { icon: Users, title: "Youth Group", desc: "Fun, faith, and friendship" },
            ].map((group) => (
              <Card
                key={group.title}
                className="text-center p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <group.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{group.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{group.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Livestream Banner */}
      <section className="py-12 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 animate-pulse">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Watch Live</h3>
              <p className="text-red-100 text-sm">
                Join our live service every Sunday at 8:00 AM
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-white text-red-700 hover:bg-red-50 shrink-0"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Now
          </Button>
        </div>
      </section>

      {/* Download App */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Take Potter&apos;s Hub With You
              </h2>
              <p className="text-muted-foreground text-lg">
                Download Potter&apos;s Hub to stay connected with sermons, events,
                devotionals, and your church community wherever you go.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="h-12">
                  <Smartphone className="mr-2 h-5 w-5" />
                  App Store
                </Button>
                <Button size="lg" variant="outline" className="h-12">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Google Play
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 w-64 h-80 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center">
              <Smartphone className="h-24 w-24 text-red-300" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
