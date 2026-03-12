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
    const filter = searchParams.get("filter") // "upcoming" | "past"

    const skip = (page - 1) * limit
    const now = new Date()

    const where: any = { isPublished: true }

    if (filter === "upcoming") {
      where.startDate = { gte: now }
    } else if (filter === "past") {
      where.startDate = { lt: now }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: filter === "past" ? "desc" : "asc" },
        include: {
          createdBy: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          _count: { select: { rsvps: true } },
        },
      }),
      prisma.event.count({ where }),
    ])

    return NextResponse.json({
      events,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  isPublished: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!["admin", "pastor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createEventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { startDate, endDate, ...data } = parsed.data

    const event = await prisma.event.create({
      data: {
        ...data,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        createdById: session.user.id,
      },
      include: {
        createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
