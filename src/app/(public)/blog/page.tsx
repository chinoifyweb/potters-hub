"use client";

import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const blogPosts = [
  {
    id: "1",
    title: "5 Habits for a Stronger Prayer Life",
    excerpt:
      "Discover practical habits that can transform your prayer time from a routine into a powerful encounter with God.",
    author: "Pastor James Okafor",
    date: "March 8, 2026",
    category: "Devotional",
    coverColor: "from-red-200 to-red-300",
  },
  {
    id: "2",
    title: "How to Study the Bible Effectively",
    excerpt:
      "Simple yet effective methods for reading and understanding Scripture that will deepen your relationship with God.",
    author: "Minister David Eze",
    date: "March 1, 2026",
    category: "Bible Study",
    coverColor: "from-green-200 to-green-300",
  },
  {
    id: "3",
    title: "Serving Others: The Heart of the Gospel",
    excerpt:
      "Explore what it means to live a life of service and how serving others is at the core of the Christian faith.",
    author: "Deaconess Sarah Nwosu",
    date: "February 22, 2026",
    category: "Community",
    coverColor: "from-purple-200 to-purple-300",
  },
  {
    id: "4",
    title: "Raising Children in Faith",
    excerpt:
      "Practical wisdom for parents who want to raise godly children in a world filled with distractions and challenges.",
    author: "Pastor Grace Adeyemi",
    date: "February 15, 2026",
    category: "Family",
    coverColor: "from-amber-200 to-amber-300",
  },
  {
    id: "5",
    title: "Finding Peace in Uncertain Times",
    excerpt:
      "When the world around us feels uncertain, how can we find true peace? Discover what the Bible says about lasting peace.",
    author: "Pastor James Okafor",
    date: "February 8, 2026",
    category: "Encouragement",
    coverColor: "from-teal-200 to-teal-300",
  },
  {
    id: "6",
    title: "The Power of Worship in Daily Life",
    excerpt:
      "Worship is not just for Sundays. Learn how to cultivate an attitude of worship that transforms your everyday life.",
    author: "Minister David Eze",
    date: "February 1, 2026",
    category: "Worship",
    coverColor: "from-rose-200 to-rose-300",
  },
];

export default function BlogPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-700 to-red-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Blog</h1>
          <p className="text-red-100 mt-3 max-w-xl mx-auto">
            Articles, devotionals, and insights to encourage your walk with
            Christ
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card
                key={post.id}
                className="group overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className={`aspect-[16/9] bg-gradient-to-br ${post.coverColor} flex items-center justify-center`}
                >
                  <span className="text-4xl font-bold text-white/30">
                    {post.category}
                  </span>
                </div>
                <CardContent className="p-5 space-y-3">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {post.date}
                    </span>
                  </div>
                  <Button
                    variant="link"
                    className="px-0 text-primary"
                    size="sm"
                  >
                    Read More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
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
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
