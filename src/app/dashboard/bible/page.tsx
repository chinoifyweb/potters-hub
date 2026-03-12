"use client"

import React, { useState } from "react"
import {
  Search,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const versions = ["KJV", "NKJV", "AMP", "NLT", "NIV", "MSG", "NRSV"]

const oldTestamentBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
]

const newTestamentBooks = [
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
]

const chapterCounts: Record<string, number> = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, Psalms: 150, Proverbs: 31, Isaiah: 66,
  Jeremiah: 52, Ezekiel: 48, Daniel: 12, Matthew: 28, Mark: 16,
  Luke: 24, John: 21, Acts: 28, Romans: 16, "1 Corinthians": 16,
  "2 Corinthians": 13, Galatians: 6, Ephesians: 6, Philippians: 4,
  Colossians: 4, Hebrews: 13, James: 5, "1 Peter": 5, "1 John": 5,
  Revelation: 22,
}

// Sample verse data for Psalm 23
const sampleVerses: Record<string, { verse: number; text: string }[]> = {
  "Psalms-23": [
    { verse: 1, text: "The LORD is my shepherd; I shall not want." },
    { verse: 2, text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters." },
    { verse: 3, text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake." },
    { verse: 4, text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
    { verse: 5, text: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over." },
    { verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
  ],
  "John-3": [
    { verse: 1, text: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:" },
    { verse: 2, text: "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him." },
    { verse: 3, text: "Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God." },
    { verse: 4, text: "Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother's womb, and be born?" },
    { verse: 5, text: "Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God." },
    { verse: 6, text: "That which is born of the flesh is flesh; and that which is born of the Spirit is spirit." },
    { verse: 7, text: "Marvel not that I said unto thee, Ye must be born again." },
    { verse: 8, text: "The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit." },
    { verse: 9, text: "Nicodemus answered and said unto him, How can these things be?" },
    { verse: 10, text: "Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?" },
    { verse: 11, text: "Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness." },
    { verse: 12, text: "If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?" },
    { verse: 13, text: "And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven." },
    { verse: 14, text: "And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:" },
    { verse: 15, text: "That whosoever believeth in him should not perish, but have eternal life." },
    { verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  ],
  "Genesis-1": [
    { verse: 1, text: "In the beginning God created the heaven and the earth." },
    { verse: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
    { verse: 3, text: "And God said, Let there be light: and there was light." },
    { verse: 4, text: "And God saw the light, that it was good: and God divided the light from the darkness." },
    { verse: 5, text: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day." },
  ],
}

const sampleBookmarks = [
  { book: "Psalms", chapter: 23, verse: 1, text: "The LORD is my shepherd; I shall not want." },
  { book: "John", chapter: 3, verse: 16, text: "For God so loved the world, that he gave his only begotten Son..." },
  { book: "Philippians", chapter: 4, verse: 13, text: "I can do all things through Christ which strengtheneth me." },
]

type ViewState = "books" | "chapters" | "reading"

export default function BiblePage() {
  const [version, setVersion] = useState("KJV")
  const [selectedBook, setSelectedBook] = useState("Psalms")
  const [selectedChapter, setSelectedChapter] = useState(23)
  const [viewState, setViewState] = useState<ViewState>("reading")
  const [search, setSearch] = useState("")
  const [highlightedVerses, setHighlightedVerses] = useState<number[]>([1, 4])
  const [bookmarkedVerses, setBookmarkedVerses] = useState<number[]>([1])
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("read")

  const totalChapters = chapterCounts[selectedBook] || 10
  const verseKey = `${selectedBook}-${selectedChapter}`
  const verses = sampleVerses[verseKey] || sampleVerses["Genesis-1"] || []

  const handleBookSelect = (book: string) => {
    setSelectedBook(book)
    setViewState("chapters")
  }

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter)
    setViewState("reading")
    setSelectedVerse(null)
  }

  const handleVerseClick = (verseNum: number) => {
    setSelectedVerse(selectedVerse === verseNum ? null : verseNum)
  }

  const toggleHighlight = (verseNum: number) => {
    setHighlightedVerses((prev) =>
      prev.includes(verseNum) ? prev.filter((v) => v !== verseNum) : [...prev, verseNum]
    )
    toast.success(highlightedVerses.includes(verseNum) ? "Highlight removed" : "Verse highlighted")
    setSelectedVerse(null)
  }

  const toggleBookmark = (verseNum: number) => {
    setBookmarkedVerses((prev) =>
      prev.includes(verseNum) ? prev.filter((v) => v !== verseNum) : [...prev, verseNum]
    )
    toast.success(bookmarkedVerses.includes(verseNum) ? "Bookmark removed" : "Verse bookmarked")
    setSelectedVerse(null)
  }

  const copyVerse = (verseNum: number) => {
    const verse = verses.find((v) => v.verse === verseNum)
    if (verse) {
      navigator.clipboard?.writeText(`${selectedBook} ${selectedChapter}:${verseNum} (${version}) - ${verse.text}`)
      toast.success("Verse copied")
    }
    setSelectedVerse(null)
  }

  const prevChapter = () => {
    if (selectedChapter > 1) setSelectedChapter(selectedChapter - 1)
  }
  const nextChapter = () => {
    if (selectedChapter < totalChapters) setSelectedChapter(selectedChapter + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bible</h2>
        <p className="text-muted-foreground">Read and study the Word of God.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="read" className="space-y-4 mt-4">
          {/* Version & Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium"
            >
              {versions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewState("books")}
            >
              <BookOpen className="h-4 w-4 mr-1.5" />
              {selectedBook} {selectedChapter}
            </Button>
          </div>

          {/* Book Selector */}
          {viewState === "books" && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-sm">Old Testament</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                  {oldTestamentBooks.map((book) => (
                    <Button
                      key={book}
                      variant={selectedBook === book ? "default" : "ghost"}
                      size="sm"
                      className="text-xs h-8 justify-start"
                      onClick={() => handleBookSelect(book)}
                    >
                      {book}
                    </Button>
                  ))}
                </div>
                <Separator />
                <h3 className="font-semibold text-sm">New Testament</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                  {newTestamentBooks.map((book) => (
                    <Button
                      key={book}
                      variant={selectedBook === book ? "default" : "ghost"}
                      size="sm"
                      className="text-xs h-8 justify-start"
                      onClick={() => handleBookSelect(book)}
                    >
                      {book}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chapter Selector */}
          {viewState === "chapters" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewState("books")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-base">{selectedBook}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                  {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
                    <Button
                      key={ch}
                      variant={selectedChapter === ch ? "default" : "outline"}
                      size="sm"
                      className="h-9 w-9 p-0 text-sm"
                      onClick={() => handleChapterSelect(ch)}
                    >
                      {ch}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reading View */}
          {viewState === "reading" && (
            <>
              {/* Chapter Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevChapter}
                  disabled={selectedChapter <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm font-medium">
                  {selectedBook} {selectedChapter}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextChapter}
                  disabled={selectedChapter >= totalChapters}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* Verses */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-0">
                    {verses.map((v) => (
                      <span key={v.verse} className="relative inline">
                        <span
                          className={cn(
                            "cursor-pointer leading-8 transition-colors",
                            highlightedVerses.includes(v.verse) && "bg-yellow-200/50 dark:bg-yellow-900/30",
                            selectedVerse === v.verse && "bg-primary/10 rounded"
                          )}
                          onClick={() => handleVerseClick(v.verse)}
                        >
                          <sup className="text-xs font-bold text-primary mr-1">{v.verse}</sup>
                          {v.text}{" "}
                        </span>

                        {/* Verse Action Popup */}
                        {selectedVerse === v.verse && (
                          <span className="inline-flex items-center gap-1 ml-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => { e.stopPropagation(); toggleHighlight(v.verse) }}
                              title="Highlight"
                            >
                              <span className="text-xs">H</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => { e.stopPropagation(); toggleBookmark(v.verse) }}
                              title="Bookmark"
                            >
                              {bookmarkedVerses.includes(v.verse)
                                ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                                : <Bookmark className="h-3.5 w-3.5" />
                              }
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => { e.stopPropagation(); copyVerse(v.verse) }}
                              title="Copy"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard?.writeText(`${selectedBook} ${selectedChapter}:${v.verse}`)
                                toast.success("Reference copied")
                                setSelectedVerse(null)
                              }}
                              title="Share"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chapter Navigation Bottom */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevChapter}
                  disabled={selectedChapter <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Chapter {selectedChapter - 1}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextChapter}
                  disabled={selectedChapter >= totalChapters}
                >
                  Chapter {selectedChapter + 1} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="search" className="mt-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search the Bible..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {search ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Results for &quot;{search}&quot;</p>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-primary">John 3:16 (KJV)</p>
                    <p className="text-sm mt-1">
                      For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-primary">Romans 8:28 (KJV)</p>
                    <p className="text-sm mt-1">
                      And we know that all things work together for good to them that love God, to them who are the called according to his purpose.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Enter a keyword, verse reference, or phrase to search the Bible.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-4">
          <div className="space-y-3">
            {sampleBookmarks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No bookmarks yet. Tap a verse while reading to bookmark it.
              </p>
            ) : (
              sampleBookmarks.map((bm, i) => (
                <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-primary">
                          {bm.book} {bm.chapter}:{bm.verse} ({version})
                        </p>
                        <p className="text-sm mt-1 leading-relaxed">{bm.text}</p>
                      </div>
                      <BookmarkCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
