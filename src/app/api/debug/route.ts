import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
  try {
    // Test DB connection
    const userCount = await prisma.user.count()
    const adminUser = await prisma.user.findUnique({
      where: { email: "chinoify04@gmail.com" },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        isVerified: true,
        passwordHash: true,
      },
    })

    return NextResponse.json({
      dbConnected: true,
      totalUsers: userCount,
      adminExists: !!adminUser,
      adminHasPassword: !!adminUser?.passwordHash,
      adminRole: adminUser?.role,
      adminIsActive: adminUser?.isActive,
      passwordHashLength: adminUser?.passwordHash?.length,
      nextauthUrl: process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 60) + "...",
    })
  } catch (error: any) {
    return NextResponse.json({
      dbConnected: false,
      error: error.message,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 60) + "...",
      hasDbUrl: !!process.env.DATABASE_URL,
    }, { status: 500 })
  }
}
