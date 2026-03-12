import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalMembers,
      newMembersThisMonth,
      totalDonations,
      donationsThisMonth,
      totalEvents,
      upcomingEvents,
      totalSermons,
      totalGroups,
      totalPosts,
      recentDonations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.donation.aggregate({
        where: { status: "successful" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.donation.aggregate({
        where: {
          status: "successful",
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.event.count(),
      prisma.event.count({
        where: { startDate: { gte: now } },
      }),
      prisma.sermon.count({ where: { isPublished: true } }),
      prisma.group.count({ where: { isActive: true } }),
      prisma.post.count({ where: { isVisible: true } }),
      prisma.donation.findMany({
        where: { status: "successful" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { id: true, fullName: true } },
          category: { select: { name: true } },
        },
      }),
    ])

    return NextResponse.json({
      totalMembers,
      newMembersThisMonth,
      donations: {
        totalAmount: totalDonations._sum.amount || 0,
        totalCount: totalDonations._count,
        monthAmount: donationsThisMonth._sum.amount || 0,
        monthCount: donationsThisMonth._count,
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
      },
      totalSermons,
      totalGroups,
      totalPosts,
      recentDonations,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
