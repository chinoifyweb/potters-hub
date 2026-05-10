import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { mobileCors } from "@/lib/mobile-cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return mobileCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json().catch(() => ({}));
    if (!email || !password) {
      return mobileCors(
        NextResponse.json({ error: "Email and password required" }, { status: 400 })
      );
    }
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        isVerified: true,
        phone: true,
      },
    });
    if (!user || !user.passwordHash) {
      return mobileCors(
        NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      );
    }
    if (!user.isActive) {
      return mobileCors(NextResponse.json({ error: "Account disabled" }, { status: 403 }));
    }
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return mobileCors(
        NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      );
    }
    const secret = process.env.NEXTAUTH_SECRET || "fallback-dev-secret";
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, name: user.fullName },
      secret,
      { expiresIn: "60d" }
    );
    return mobileCors(
      NextResponse.json({
        token,
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
    console.error("[mobile/auth/login]", e);
    return mobileCors(NextResponse.json({ error: "Server error" }, { status: 500 }));
  }
}
