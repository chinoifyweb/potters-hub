import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const createConversationSchema = z.object({
  participantIds: z.array(z.string()).min(1, "At least one participant is required"),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createConversationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Include the current user in participants
    const idSet = new Set([session.user.id, ...parsed.data.participantIds])
    const allParticipantIds = Array.from(idSet)

    // Check for existing conversation with the same participants (for 1:1)
    if (allParticipantIds.length === 2) {
      const existing = await prisma.conversation.findFirst({
        where: {
          AND: allParticipantIds.map((id) => ({
            participants: { some: { userId: id } },
          })),
          participants: {
            every: { userId: { in: allParticipantIds } },
          },
        },
        include: {
          participants: {
            include: {
              user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
          },
        },
      })

      if (existing) {
        return NextResponse.json(existing)
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: allParticipantIds.map((userId) => ({ userId })),
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
