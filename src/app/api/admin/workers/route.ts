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
    },
  });
  return NextResponse.json({ worker }, { status: 201 });
}
