import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { notifyChildrensWorkers } from "@/lib/notify-children";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const item = await prisma.childrenSermon.findUnique({
    where: { id: params.id },
  });
  if (!item)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const result = await notifyChildrensWorkers(item, false);
  return NextResponse.json({ ok: true, notify: result });
}
