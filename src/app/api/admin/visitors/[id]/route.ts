import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const b = await req.json();
  const v = await prisma.visitor.update({
    where: { id: params.id },
    data: {
      fullName: b.fullName,
      phone: b.phone,
      email: b.email,
      howHeard: b.howHeard,
      prayerRequest: b.prayerRequest,
      status: b.status,
      notes: b.notes,
      returnVisits: b.returnVisits,
      assignedToId: b.assignedToId,
      address: b.address,
      birthDay: typeof b.birthDay === "number" ? b.birthDay : b.birthDay === null ? null : undefined,
      birthMonth: typeof b.birthMonth === "number" ? b.birthMonth : b.birthMonth === null ? null : undefined,
    },
  });
  return NextResponse.json(v);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  await prisma.visitor.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
