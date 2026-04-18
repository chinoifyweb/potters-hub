import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`[forgot-password] No user for ${email} (returning ok to prevent enumeration)`);
      return NextResponse.json({ ok: true });
    }

    // Invalidate previous unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const base = process.env.NEXTAUTH_URL || "https://tphc.org.ng";
    const resetUrl = `${base.replace(/\/$/, "")}/reset-password?token=${token}`;

    const result = await sendPasswordResetEmail(email, resetUrl);
    if (!result.ok) {
      console.error("[forgot-password] email send failed:", result.error);
      // Still return ok to user — don't leak email issues
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[forgot-password] error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
