import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { mobileCors } from "@/lib/mobile-cors";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return mobileCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : null;

    if (!fullName || fullName.length < 2) {
      return mobileCors(
        NextResponse.json({ error: "Full name is required" }, { status: 400 })
      );
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return mobileCors(
        NextResponse.json({ error: "Valid email is required" }, { status: 400 })
      );
    }
    if (!password || password.length < 6) {
      return mobileCors(
        NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return mobileCors(
        NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: phone || undefined,
        role: "member",
        isActive: true,
        isVerified: false,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        phone: true,
        isVerified: true,
      },
    });

    // Fire-and-forget welcome email
    sendWelcomeEmail(user.email, user.fullName || "").catch((err) => {
      console.error("[mobile/auth/register] welcome email failed:", err);
    });

    const secret = process.env.NEXTAUTH_SECRET || "fallback-dev-secret";
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, name: user.fullName },
      secret,
      { expiresIn: "60d" }
    );

    return mobileCors(
      NextResponse.json({
        token,
        user,
      })
    );
  } catch (e: any) {
    console.error("[mobile/auth/register]", e);
    return mobileCors(NextResponse.json({ error: "Server error" }, { status: 500 }));
  }
}
