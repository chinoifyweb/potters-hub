import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const b = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof b.fullName === "string") data.fullName = b.fullName;
  if (typeof b.phone === "string") data.phone = b.phone;
  if ("email" in b) data.email = b.email || null;
  if ("department" in b) data.department = b.department || null;
  if ("role" in b) data.role = b.role || null;
  if ("notes" in b) data.notes = b.notes || null;
  if (typeof b.isActive === "boolean") data.isActive = b.isActive;
  const worker = await prisma.worker.update({ where: { id: params.id }, data });
  return NextResponse.json({ worker });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  await prisma.worker.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
