import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
  try {
    const versions = await prisma.bibleVersion.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error("Error fetching Bible versions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
