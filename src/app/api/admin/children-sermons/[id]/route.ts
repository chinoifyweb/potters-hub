import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import {
  notifyChildrensWorkers,
  type ChildrenNotifyResult,
} from "@/lib/notify-children";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const a = await requireAdmin();
  if ("err" in a) return a.err;
  const item = await prisma.childrenSermon.findUnique({
    where: { id: params.id },
  });
  if (!item)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

async function updateAndMaybeNotify(req: NextRequest, id: string) {
  const b = await req.json();
  const updates: any = {};
  for (const k of [
    "title",
    "teacher",
    "ageGroup",
    "description",
    "videoUrl",
    "audioUrl",
    "thumbnailUrl",
    "scripture",
    "memoryVerse",
    "quarter",
    "content",
    "isPublished",
  ]) {
    if (b[k] !== undefined) updates[k] = b[k];
  }
  if (b.weekNumber !== undefined) {
    updates.weekNumber =
      b.weekNumber === null || b.weekNumber === "" ? null : Number(b.weekNumber);
  }
  if (b.date !== undefined) updates.date = new Date(b.date);
  const item = await prisma.childrenSermon.update({
    where: { id },
    data: updates,
  });

  // Only notify on edit when the admin explicitly opts in.
  let notify: ChildrenNotifyResult | null = null;
  if (b.notifyWorkers === true) {
    try {
      notify = (await Promise.race([
        notifyChildrensWorkers(item, true),
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 60000),
        ),
      ])) as ChildrenNotifyResult | null;
    } catch (e) {
      console.error("[children-sermons PATCH] notify failed:", e);
    }
  }

  return NextResponse.json({ item, notify });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const a = await requireAdmin();
  if ("err" in a) return a.err;
  try {
    return await updateAndMaybeNotify(req, params.id);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const a = await requireAdmin();
  if ("err" in a) return a.err;
  try {
    return await updateAndMaybeNotify(req, params.id);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const a = await requireAdmin();
  if ("err" in a) return a.err;
  await prisma.childrenSermon.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
