import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sermon = await prisma.sermon.findUnique({
      where: { id: params.id },
      include: {
        categories: { include: { category: true } },
        notes: {
          select: { id: true },
          take: 0,
        },
      },
    })

    if (!sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 })
    }

    // Increment view count
    await prisma.sermon.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json(sermon)
  } catch (error) {
    console.error("Error fetching sermon:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const updateSermonSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  speaker: z.string().optional().nullable(),
  seriesName: z.string().optional().nullable(),
  scriptureReference: z.string().optional().nullable(),
  sermonDate: z.string().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  audioUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  durationSeconds: z.number().int().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateSermonSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { categoryIds, sermonDate, ...data } = parsed.data

    const updateData: any = {
      ...data,
      ...(sermonDate !== undefined && {
        sermonDate: sermonDate ? new Date(sermonDate) : null,
      }),
    }

    if (categoryIds) {
      await prisma.sermonCategoryMap.deleteMany({
        where: { sermonId: params.id },
      })
      updateData.categories = {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      }
    }

    const sermon = await prisma.sermon.update({
      where: { id: params.id },
      data: updateData,
      include: {
        categories: { include: { category: true } },
      },
    })

    return NextResponse.json(sermon)
  } catch (error) {
    console.error("Error updating sermon:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.sermon.delete({ where: { id: params.id } })

    return NextResponse.json({ message: "Sermon deleted successfully" })
  } catch (error) {
    console.error("Error deleting sermon:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
