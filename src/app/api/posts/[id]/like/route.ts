import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

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

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: params.id,
          userId: session.user.id,
        },
      },
    })

    let liked: boolean

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({ where: { id: existingLike.id } })
      await prisma.post.update({
        where: { id: params.id },
        data: { likesCount: { decrement: 1 } },
      })
      liked = false
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          postId: params.id,
          userId: session.user.id,
        },
      })
      await prisma.post.update({
        where: { id: params.id },
        data: { likesCount: { increment: 1 } },
      })
      liked = true
    }

    return NextResponse.json({ liked })
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
