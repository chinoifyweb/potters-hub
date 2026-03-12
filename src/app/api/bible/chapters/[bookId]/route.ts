import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const chapters = await prisma.bibleChapter.findMany({
      where: { bookId: params.bookId },
      orderBy: { chapterNumber: "asc" },
    })

    return NextResponse.json(chapters)
  } catch (error) {
    console.error("Error fetching Bible chapters:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
