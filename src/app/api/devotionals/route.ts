import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const today = searchParams.get("today")
    const skip = (page - 1) * limit

    const where: any = { isPublished: true }

    if (today === "true") {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)
      where.date = { gte: startOfDay, lte: endOfDay }
    }

    const [devotionals, total] = await Promise.all([
      prisma.devotional.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      prisma.devotional.count({ where }),
    ])

    return NextResponse.json({
      devotionals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching devotionals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const createDevotionalSchema = z.object({
  title: z.string().min(1),
  scripture: z.string().optional(),
  content: z.string().min(1),
  author: z.string().optional(),
  date: z.string(),
  imageUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createDevotionalSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { date, ...data } = parsed.data

    const devotional = await prisma.devotional.create({
      data: {
        ...data,
        date: new Date(date),
      },
    })

    return NextResponse.json(devotional, { status: 201 })
  } catch (error) {
    console.error("Error creating devotional:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
