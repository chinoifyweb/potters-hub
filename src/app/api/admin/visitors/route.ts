import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

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
  return NextResponse.json(v);
}
