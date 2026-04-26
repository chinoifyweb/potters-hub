import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get("week");
    const list = searchParams.get("list");

    if (list === "true") {
      const rows = await prisma.sundayService.findMany({
        where: { isPublished: true, publishAt: { lte: new Date() } },
        orderBy: { sundayDate: "desc" },
        select: {
          id: true,
          weekNumber: true,
          sundayDate: true,
          title: true,
          publishAt: true,
        },
      });
      return NextResponse.json({ services: rows });
    }

    let svc;
    if (week) {
      svc = await prisma.sundayService.findFirst({
        where: {
          weekNumber: parseInt(week, 10),
          isPublished: true,
          publishAt: { lte: new Date() },
        },
      });
    } else {
      // Latest service whose publishAt has already passed (Friday 1am rule)
      svc = await prisma.sundayService.findFirst({
        where: { isPublished: true, publishAt: { lte: new Date() } },
        orderBy: { publishAt: "desc" },
      });
    }

    if (!svc) {
      return NextResponse.json(
        { error: "No Sunday Service available yet" },
        { status: 404 }
      );
    }
    return NextResponse.json({ service: svc });
  } catch (err) {
    console.error("[/api/sunday-service] error:", err);
    return NextResponse.json(
      { error: "Failed to load Sunday Service" },
      { status: 500 }
    );
  }
}
