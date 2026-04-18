import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, fullName: true } },
        },
      }),
      prisma.campaign.count(),
    ])

    return NextResponse.json({
      campaigns,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const createCampaignSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(["sms", "email", "push"]),
  recipientFilter: z.any().optional(),
  scheduledAt: z.string().optional(),
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
    const parsed = createCampaignSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { scheduledAt, ...data } = parsed.data

    // Count recipients based on filter
    const recipientCount = await prisma.user.count({
      where: { isActive: true },
    })

    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        recipientFilter: data.recipientFilter || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? "scheduled" : "sent",
        sentAt: scheduledAt ? null : new Date(),
        recipientCount,
        createdById: session.user.id,
      },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    })

    // Fire-and-forget email delivery for email campaigns (non-scheduled)
    if (!scheduledAt && data.type === "email") {
      ;(async () => {
        try {
          const recipients = await prisma.user.findMany({
            where: { isActive: true },
            select: { email: true, fullName: true },
            take: 1000,
          })
          const subj = data.title
          for (const r of recipients) {
            if (!r.email) continue
            const greeting = r.fullName ? `Dear ${r.fullName},` : "Dear Friend,"
            const html = `<p>${greeting}</p><p>${data.message.replace(/\n/g, "<br>")}</p><p>&mdash; The Potter&apos;s Hub</p>`
            try {
              await sendEmail({ to: r.email, subject: subj, html })
            } catch (err) {
              console.error("Campaign send error for", r.email, err)
            }
          }
        } catch (err) {
          console.error("Campaign email batch error:", err)
        }
      })()
    }
    // TODO: Integrate SMS and push notification services (email is live)

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
