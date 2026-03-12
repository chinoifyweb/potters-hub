import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")
    const versionId = searchParams.get("versionId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    if (!q) {
      return NextResponse.json(
        { error: "Search query (q) is required" },
        { status: 400 }
      )
    }

    const where: any = {
      text: { contains: q, mode: "insensitive" },
    }

    if (versionId) {
      where.chapter = {
        book: { versionId },
      }
    }

    const [verses, total] = await Promise.all([
      prisma.bibleVerse.findMany({
        where,
        skip,
        take: limit,
        include: {
          chapter: {
            include: {
              book: {
                include: { version: true },
              },
            },
          },
        },
      }),
      prisma.bibleVerse.count({ where }),
    ])

    return NextResponse.json({
      verses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error searching Bible:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
