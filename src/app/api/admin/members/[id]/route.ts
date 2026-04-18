import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const b = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof b.fullName === "string") data.fullName = b.fullName;
  if (typeof b.email === "string") data.email = b.email;
  if ("phone" in b) data.phone = b.phone || null;
  if (typeof b.role === "string") data.role = b.role;
  if (typeof b.isActive === "boolean") data.isActive = b.isActive;
  if (typeof b.isVerified === "boolean") data.isVerified = b.isVerified;
  if ("address" in b) data.address = b.address || null;
  if ("birthDay" in b) data.birthDay = typeof b.birthDay === "number" ? b.birthDay : null;
  if ("birthMonth" in b) data.birthMonth = typeof b.birthMonth === "number" ? b.birthMonth : null;
  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, email: true, fullName: true, phone: true, address: true, role: true, isActive: true, isVerified: true, birthDay: true, birthMonth: true },
  });
  // Sync worker record
  try {
    if (typeof b.isWorker === "boolean" && user.phone) {
      const existingWorker = await prisma.worker.findFirst({ where: { phone: user.phone } });
      if (b.isWorker) {
        if (existingWorker) {
          await prisma.worker.update({
            where: { id: existingWorker.id },
            data: {
              fullName: user.fullName,
              department: b.workerDepartment || existingWorker.department,
              birthDay: data.birthDay ?? existingWorker.birthDay,
              birthMonth: data.birthMonth ?? existingWorker.birthMonth,
              isActive: true,
            },
          });
        } else {
          await prisma.worker.create({
            data: {
              fullName: user.fullName,
              phone: user.phone,
              email: user.email,
              department: b.workerDepartment || null,
              birthDay: data.birthDay ?? null,
              birthMonth: data.birthMonth ?? null,
              isActive: true,
            },
          });
        }
      } else if (existingWorker) {
        await prisma.worker.update({ where: { id: existingWorker.id }, data: { isActive: false } });
      }
    }
  } catch (e) {
    console.error("[members PATCH] worker sync failed:", e);
  }

  return NextResponse.json({ user });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  // Soft-delete to preserve referential integrity with related data
  await prisma.user.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
