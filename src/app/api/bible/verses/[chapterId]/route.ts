import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const verses = await prisma.bibleVerse.findMany({
      where: { chapterId: params.chapterId },
      orderBy: { verseNumber: "asc" },
    })

    return NextResponse.json(verses)
  } catch (error) {
    console.error("Error fetching Bible verses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
