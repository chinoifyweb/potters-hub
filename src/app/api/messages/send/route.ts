import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1),
  mediaUrl: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: parsed.data.conversationId,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        conversationId: parsed.data.conversationId,
        senderId: session.user.id,
        content: parsed.data.content,
        mediaUrl: parsed.data.mediaUrl || null,
      },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
