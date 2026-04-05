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
    const category = searchParams.get("category")
    const speaker = searchParams.get("speaker")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const published = searchParams.get("published")

    const skip = (page - 1) * limit

    const where: any = {}

    if (published !== "false") {
      where.isPublished = true
    }

    if (category) {
      where.categories = {
        some: { category: { slug: category } },
      }
    }

    if (speaker) {
      where.speaker = { contains: speaker, mode: "insensitive" }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { speaker: { contains: search, mode: "insensitive" } },
        { seriesName: { contains: search, mode: "insensitive" } },
      ]
    }

    if (featured === "true") {
      where.isFeatured = true
    }

    const [sermons, total] = await Promise.all([
      prisma.sermon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sermonDate: "desc" },
        include: {
          categories: {
            include: { category: true },
          },
        },
      }),
      prisma.sermon.count({ where }),
    ])

    return NextResponse.json({
      sermons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching sermons:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const createSermonSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  speaker: z.string().optional(),
  seriesName: z.string().optional(),
  scriptureReference: z.string().optional(),
  sermonDate: z.string().optional(),
  videoUrl: z.string().url().optional().nullable(),
  audioUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  durationSeconds: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin" && session.user.role !== "pastor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createSermonSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { categoryIds, sermonDate, ...data } = parsed.data

    const sermon = await prisma.sermon.create({
      data: {
        ...data,
        sermonDate: sermonDate ? new Date(sermonDate) : null,
        ...(categoryIds?.length && {
          categories: {
            create: categoryIds.map((categoryId) => ({
              categoryId,
            })),
          },
        }),
      },
      include: {
        categories: { include: { category: true } },
      },
    })

    return NextResponse.json(sermon, { status: 201 })
  } catch (error) {
    console.error("Error creating sermon:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
