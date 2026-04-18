import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const workers = await prisma.worker.findMany({ orderBy: { fullName: "asc" } });
  return NextResponse.json({ workers });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const body = await req.json().catch(() => ({}));
  if (!body.fullName || !body.phone) {
    return NextResponse.json({ error: "fullName and phone required" }, { status: 400 });
  }
  const worker = await prisma.worker.create({
    data: {
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || null,
      department: body.department || null,
      role: body.role || null,
      notes: body.notes || null,
      isActive: body.isActive ?? true,
      birthDay: body.birthDay ?? null,
      birthMonth: body.birthMonth ?? null,
    },
  });

  // Auto-promote worker to member
  try {
    const existing = await prisma.user.findFirst({ where: { phone: body.phone } });
    if (!existing) {
      const normalized = body.phone.replace(/\D/g, "");
      const safeEmail = body.email && body.email.trim()
        ? body.email.trim().toLowerCase()
        : `worker-${normalized}@tphc.org.ng`;
      await prisma.user.create({
        data: {
          fullName: body.fullName,
          email: safeEmail,
          phone: body.phone,
          role: "member",
          isActive: true,
          isVerified: false,
          birthDay: body.birthDay ?? null,
          birthMonth: body.birthMonth ?? null,
          passwordHash: require("crypto").randomBytes(32).toString("hex"),
        },
      });
    }
  } catch (e) {
    console.error("[workers POST] auto-promote failed:", e);
  }

  return NextResponse.json({ worker }, { status: 201 });
}
