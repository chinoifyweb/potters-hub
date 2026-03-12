import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { PaystackService } from "@/lib/paystack"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: any = {}

    // Non-admin users can only see their own donations
    if (session.user.role !== "admin") {
      where.userId = session.user.id
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
      prisma.donation.count({ where }),
    ])

    return NextResponse.json({
      donations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const createDonationSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  note: z.string().optional(),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional(),
  callbackUrl: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const body = await req.json()
    const parsed = createDonationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { amount, categoryId, isAnonymous, note, donorName, donorEmail, callbackUrl } = parsed.data

    const reference = `DON-${uuidv4().slice(0, 8).toUpperCase()}`

    // Determine email for Paystack
    const email = session?.user?.email || donorEmail
    if (!email) {
      return NextResponse.json(
        { error: "Email is required for donation" },
        { status: 400 }
      )
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        userId: session?.user?.id || null,
        categoryId: categoryId || null,
        amount,
        paystackReference: reference,
        status: "pending",
        isAnonymous: isAnonymous || false,
        note: note || null,
        donorName: donorName || null,
        donorEmail: donorEmail || email,
      },
    })

    // Initialize Paystack transaction (amount in kobo)
    const paystackResponse = await PaystackService.initializeTransaction(
      email,
      Math.round(amount * 100),
      reference,
      {
        donationId: donation.id,
        type: "donation",
        categoryId: categoryId || null,
      },
      callbackUrl
    )

    return NextResponse.json(
      {
        donation,
        paymentUrl: paystackResponse.data.authorization_url,
        reference: paystackResponse.data.reference,
        accessCode: paystackResponse.data.access_code,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating donation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
