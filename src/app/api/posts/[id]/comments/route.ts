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
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const [comments, total] = await Promise.all([
      prisma.postComment.findMany({
        where: { postId: params.id },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      }),
      prisma.postComment.count({ where: { postId: params.id } }),
    ])

    return NextResponse.json({
      comments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const createCommentSchema = z.object({
  content: z.string().min(1),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await prisma.post.findUnique({ where: { id: params.id } })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = createCommentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const comment = await prisma.postComment.create({
      data: {
        postId: params.id,
        userId: session.user.id,
        content: parsed.data.content,
      },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    })

    // Update comment count
    await prisma.post.update({
      where: { id: params.id },
      data: { commentsCount: { increment: 1 } },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
