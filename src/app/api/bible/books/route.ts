import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const versionId = searchParams.get("versionId")

    if (!versionId) {
      return NextResponse.json(
        { error: "versionId query parameter is required" },
        { status: 400 }
      )
    }

    const books = await prisma.bibleBook.findMany({
      where: { versionId },
      orderBy: { bookNumber: "asc" },
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error("Error fetching Bible books:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
