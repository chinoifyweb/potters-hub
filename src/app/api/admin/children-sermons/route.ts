import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import {
  notifyChildrensWorkers,
  type ChildrenNotifyResult,
} from "@/lib/notify-children";

export async function GET() {
  const a = await requireAdmin();
  if ("err" in a) return a.err;
  const items = await prisma.childrenSermon.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const a = await requireAdmin();
  if ("err" in a) return a.err;
  try {
    const b = await req.json();
    if (!b.title || !b.date)
      return NextResponse.json(
        { error: "title and date required" },
        { status: 400 },
      );
    const item = await prisma.childrenSermon.create({
      data: {
        title: b.title,
        teacher: b.teacher || null,
        ageGroup: b.ageGroup || null,
        description: b.description || null,
        videoUrl: b.videoUrl || null,
        audioUrl: b.audioUrl || null,
        thumbnailUrl: b.thumbnailUrl || null,
        scripture: b.scripture || null,
        memoryVerse: b.memoryVerse || null,
        weekNumber:
          b.weekNumber !== undefined && b.weekNumber !== null && b.weekNumber !== ""
            ? Number(b.weekNumber)
            : null,
        quarter: b.quarter || null,
        content: b.content || null,
        date: new Date(b.date),
        isPublished: b.isPublished ?? false,
      },
    });

    // Default to NOTIFY on create unless caller explicitly opts out.
    let notify: ChildrenNotifyResult | null = null;
    if (b.notifyWorkers !== false) {
      try {
        notify = (await Promise.race([
          notifyChildrensWorkers(item, false),
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 60000),
          ),
        ])) as ChildrenNotifyResult | null;
      } catch (e) {
        console.error("[children-sermons POST] notify failed:", e);
      }
    }

    return NextResponse.json({ item, notify }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
