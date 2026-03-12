import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

const rsvpSchema = z.object({
  status: z.enum(["going", "interested", "not_going"]).optional().default("going"),
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

    const body = await req.json().catch(() => ({}))
    const parsed = rsvpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const event = await prisma.event.findUnique({ where: { id: params.id } })
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const rsvp = await prisma.eventRsvp.upsert({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
      create: {
        eventId: params.id,
        userId: session.user.id,
        status: parsed.data.status,
      },
      update: {
        status: parsed.data.status,
      },
    })

    // Update RSVP count
    const rsvpCount = await prisma.eventRsvp.count({
      where: { eventId: params.id, status: "going" },
    })
    await prisma.event.update({
      where: { id: params.id },
      data: { rsvpCount },
    })

    return NextResponse.json(rsvp, { status: 201 })
  } catch (error) {
    console.error("Error creating RSVP:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
