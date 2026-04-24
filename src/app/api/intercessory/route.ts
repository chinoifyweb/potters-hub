import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get("week");
    const list = searchParams.get("list");

    if (list === "true") {
      const rows = await prisma.intercessoryPrayerSet.findMany({
        where: { isPublished: true },
        orderBy: { weekNumber: "desc" },
        select: { id: true, weekNumber: true, fridayDate: true, title: true },
      });
      return NextResponse.json({ sets: rows });
    }

    const where = week
      ? { weekNumber: parseInt(week, 10), isPublished: true }
      : { isPublished: true };

    const set = await prisma.intercessoryPrayerSet.findFirst({
      where,
      orderBy: week ? undefined : { fridayDate: "desc" },
    });

    if (!set) {
      return NextResponse.json(
        { error: "No intercessory set found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ set });
  } catch (err) {
    console.error("[/api/intercessory] error:", err);
    return NextResponse.json(
      { error: "Failed to load intercessory prayer set" },
      { status: 500 }
    );
  }
}
