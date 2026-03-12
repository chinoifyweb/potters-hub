import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET() {
  try {
    const categories = await prisma.donationCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching donation categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
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
    const parsed = createCategorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const category = await prisma.donationCategory.create({
      data: parsed.data,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating donation category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
