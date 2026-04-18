import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import crypto from "crypto";

export async function GET() {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const visitors = await prisma.visitor.findMany({
    orderBy: { firstVisitDate: "desc" },
    include: { followUps: true },
  });
  return NextResponse.json({ visitors });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const b = await req.json();

  if (!b.fullName || !b.phone) {
    return NextResponse.json({ error: "fullName and phone are required" }, { status: 400 });
  }

  const v = await prisma.visitor.create({
    data: {
      fullName: b.fullName,
      phone: b.phone || null,
      email: b.email || null,
      howHeard: b.howHeard || null,
      prayerRequest: b.prayerRequest || null,
      wantsContact: b.wantsContact ?? true,
      status: "new",
      notes: b.notes || null,
      address: b.address || null,
      birthDay: typeof b.birthDay === "number" ? b.birthDay : null,
      birthMonth: typeof b.birthMonth === "number" ? b.birthMonth : null,
      firstVisitDate: b.firstVisitDate ? new Date(b.firstVisitDate) : new Date(),
    },
  });

  const base = v.firstVisitDate.getTime();
  await prisma.followUp.createMany({
    data: [
      { visitorId: v.id, scheduledFor: new Date(base + 3 * 86400000), type: "day3_call", status: "pending" },
      { visitorId: v.id, scheduledFor: new Date(base + 7 * 86400000), type: "day7_checkin", status: "pending" },
    ],
  });

  // Auto-promote: ensure this contact is also in the members list
  try {
    const normalizedPhone = (b.phone || "").replace(/\D/g, "");
    if (normalizedPhone && normalizedPhone.length >= 10) {
      const existing = await prisma.user.findFirst({ where: { phone: b.phone } });
      if (!existing) {
        // Use a unique synthetic email so the unique constraint doesn't block
        const safeEmail = b.email && b.email.trim()
          ? b.email.trim().toLowerCase()
          : `visitor-${normalizedPhone}@tphc.org.ng`;
        await prisma.user.create({
          data: {
            fullName: b.fullName,
            email: safeEmail,
            phone: b.phone,
            role: "member",
            isActive: true,
            isVerified: false,
            birthDay: typeof b.birthDay === "number" ? b.birthDay : null,
            birthMonth: typeof b.birthMonth === "number" ? b.birthMonth : null,
            // passwordHash is required on User — set a random unusable one
            passwordHash: crypto.randomBytes(32).toString("hex"),
          },
        });
      } else if (!existing.birthDay && (b.birthDay || b.birthMonth)) {
        // Fill in birthday on the existing member record
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            birthDay: typeof b.birthDay === "number" ? b.birthDay : existing.birthDay,
            birthMonth: typeof b.birthMonth === "number" ? b.birthMonth : existing.birthMonth,
          },
        });
      }
    }
  } catch (e) {
    console.error("[visitors POST] auto-promote failed:", e);
    // Don't fail the whole request — visitor was created successfully
  }

  return NextResponse.json(v);
}
