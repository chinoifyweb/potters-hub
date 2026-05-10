import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { mobileCors } from "@/lib/mobile-cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return mobileCors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return mobileCors(
        NextResponse.json({ error: "Missing Authorization header" }, { status: 401 })
      );
    }
    const token = auth.slice(7);
    const secret = process.env.NEXTAUTH_SECRET || "fallback-dev-secret";
    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      return mobileCors(NextResponse.json({ error: "Invalid token" }, { status: 401 }));
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        phone: true,
        isVerified: true,
        isActive: true,
      },
    });
    if (!user || !user.isActive) {
      return mobileCors(
        NextResponse.json({ error: "User not found or disabled" }, { status: 401 })
      );
    }
    return mobileCors(
      NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
        },
      })
    );
  } catch (e: any) {
    console.error("[mobile/auth/me]", e);
    return mobileCors(NextResponse.json({ error: "Server error" }, { status: 500 }));
  }
}
