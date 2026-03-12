import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookmarks = await prisma.bibleBookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        verse: {
          include: {
            chapter: {
              include: {
                book: {
                  include: { version: true },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const createBookmarkSchema = z.object({
  verseId: z.string(),
  note: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createBookmarkSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Check if already bookmarked
    const existing = await prisma.bibleBookmark.findUnique({
      where: {
        userId_verseId: {
          userId: session.user.id,
          verseId: parsed.data.verseId,
        },
      },
    })

    if (existing) {
      // Update note if bookmark exists
      const updated = await prisma.bibleBookmark.update({
        where: { id: existing.id },
        data: { note: parsed.data.note || null },
        include: {
          verse: {
            include: {
              chapter: {
                include: { book: { include: { version: true } } },
              },
            },
          },
        },
      })
      return NextResponse.json(updated)
    }

    const bookmark = await prisma.bibleBookmark.create({
      data: {
        userId: session.user.id,
        verseId: parsed.data.verseId,
        note: parsed.data.note || null,
      },
      include: {
        verse: {
          include: {
            chapter: {
              include: { book: { include: { version: true } } },
            },
          },
        },
      },
    })

    return NextResponse.json(bookmark, { status: 201 })
  } catch (error) {
    console.error("Error creating bookmark:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
