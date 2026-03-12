"use client"

import React, { useState } from "react"
import { Sunrise, BookmarkPlus, BookmarkCheck, Calendar, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Devotional {
  id: string
  title: string
  scripture: string
  scriptureText: string
  content: string
  date: string
  author: string
  bookmarked: boolean
}

const devotionals: Devotional[] = [
  {
    id: "1",
    title: "Walking in Faith",
    scripture: "Hebrews 11:1",
    scriptureText: "Now faith is the substance of things hoped for, the evidence of things not seen.",
    content: "Today, let us reflect on what it means to trust God even when the path ahead is unclear. Faith is not the absence of doubt, but the decision to trust God in spite of it. Abraham stepped out in faith not knowing where he was going, yet God guided his every step.\n\nAs we face the uncertainties of life, let us remember that our faith is not in our own understanding, but in the One who holds all things together. God's plans for us are good, even when we cannot see the full picture.\n\nPrayer: Lord, increase my faith. Help me to trust You more deeply today, even in the areas where I cannot see the way forward. I choose to walk by faith and not by sight. In Jesus' name, Amen.",
    date: "2026-03-12",
    author: "Pastor James Okonkwo",
    bookmarked: false,
  },
  {
    id: "2",
    title: "The Joy of the Lord",
    scripture: "Nehemiah 8:10",
    scriptureText: "Do not grieve, for the joy of the LORD is your strength.",
    content: "Joy is a fruit of the Spirit that does not depend on our circumstances. Even when life is hard, we can experience the deep, abiding joy that comes from knowing God is in control.\n\nNehemiah told the people not to grieve because their strength came from God's joy. This joy is not a fleeting emotion but a settled confidence in God's goodness and faithfulness.\n\nToday, choose joy. Not because everything is perfect, but because God is perfect. Let His joy be the strength that carries you through every challenge.\n\nPrayer: Father, fill me with Your joy today. Let it overflow from my life and touch everyone I encounter. Help me to remember that my joy is rooted in You, not in my circumstances. Amen.",
    date: "2026-03-11",
    author: "Sister Ruth Adebayo",
    bookmarked: true,
  },
  {
    id: "3",
    title: "God's Unfailing Love",
    scripture: "Lamentations 3:22-23",
    scriptureText: "Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
    content: "Every morning brings a fresh reminder of God's faithfulness. His mercies are not limited by our failures or shortcomings. They are renewed daily, giving us a clean slate to start again.\n\nNo matter what yesterday looked like, today is a new day with new grace. God's love for you is not based on your performance. It is unconditional, unwavering, and unfailing.\n\nPrayer: Thank You, Lord, for Your unfailing love. Thank You for new mercies every morning. Help me to extend that same grace to others today. Great is Your faithfulness! Amen.",
    date: "2026-03-10",
    author: "Pastor James Okonkwo",
    bookmarked: false,
  },
  {
    id: "4",
    title: "Be Still and Know",
    scripture: "Psalm 46:10",
    scriptureText: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
    content: "In a world that never stops moving, God invites us to be still. Not idle, but intentionally quiet before Him. In the stillness, we hear His voice. In the quiet, we find His peace.\n\nBeing still requires trust. It means letting go of our need to control and surrendering to God's sovereignty. When we are still, we position ourselves to receive His wisdom, direction, and comfort.\n\nPrayer: Lord, help me to be still before You today. Quiet the noise of my life so I can hear Your voice. I trust that You are God, and You are in control of everything. Amen.",
    date: "2026-03-09",
    author: "Deacon Paul Mensah",
    bookmarked: true,
  },
  {
    id: "5",
    title: "Strength in Weakness",
    scripture: "2 Corinthians 12:9",
    scriptureText: "My grace is sufficient for you, for my power is made perfect in weakness.",
    content: "Paul learned a profound truth: God's power works best through our weakness. When we are weak, we depend on God more fully, and His strength shines through us.\n\nOur culture tells us to be strong, self-sufficient, and independent. But God's economy works differently. He uses the broken, the humble, and the weak to display His glory.\n\nPrayer: Lord, I bring my weaknesses to You today. I trust that Your grace is enough for me. Use my weakness as a platform for Your power and glory. In Jesus' name, Amen.",
    date: "2026-03-08",
    author: "Pastor Grace Eze",
    bookmarked: false,
  },
]

export default function DevotionalsPage() {
  const [devos, setDevos] = useState(devotionals)
  const [expandedDevo, setExpandedDevo] = useState<string | null>("1")

  const toggleBookmark = (id: string) => {
    setDevos((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, bookmarked: !d.bookmarked } : d
      )
    )
    const devo = devos.find((d) => d.id === id)
    toast.success(devo?.bookmarked ? "Bookmark removed" : "Devotional bookmarked")
  }

  const todaysDevo = devos[0]
  const previousDevos = devos.slice(1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Devotionals</h2>
        <p className="text-muted-foreground">Daily inspiration from the Word of God.</p>
      </div>

      {/* Today's Devotional */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sunrise className="h-5 w-5 text-primary" />
              <Badge variant="secondary">Today&apos;s Devotional</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => toggleBookmark(todaysDevo.id)}
            >
              {todaysDevo.bookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <BookmarkPlus className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-bold">{todaysDevo.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">By {todaysDevo.author}</p>
          </div>

          <div className="rounded-lg bg-primary/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{todaysDevo.scripture}</span>
            </div>
            <p className="text-sm italic leading-relaxed">{todaysDevo.scriptureText}</p>
          </div>

          <div className="text-sm leading-relaxed whitespace-pre-line">
            {todaysDevo.content}
          </div>
        </CardContent>
      </Card>

      {/* Previous Devotionals */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Previous Devotionals</h3>
        <div className="space-y-3">
          {previousDevos.map((devo) => {
            const isExpanded = expandedDevo === devo.id
            return (
              <Card key={devo.id}>
                <CardContent className="p-4">
                  <div
                    className="cursor-pointer"
                    onClick={() => setExpandedDevo(isExpanded ? null : devo.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{devo.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(devo.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span>{devo.author}</span>
                        </div>
                        <Badge variant="outline" className="mt-1.5 text-[10px]">
                          {devo.scripture}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBookmark(devo.id)
                        }}
                      >
                        {devo.bookmarked ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <BookmarkPlus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      <Separator />
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs font-medium text-primary mb-1">{devo.scripture}</p>
                        <p className="text-sm italic">{devo.scriptureText}</p>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {devo.content}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
