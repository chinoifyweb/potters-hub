import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { mobileCors } from "@/lib/mobile-cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return mobileCors(new NextResponse(null, { status: 204 }));
}

/**
 * Mobile-app endpoint for pastor's broadcast messages.
 *
 * Unlike the web `/api/pastor-messages` route — which is locked to pastor/admin
 * roles for editing — this endpoint serves the published messages to ANY
 * authenticated mobile-app user as a read-only feed.
 */
export async function GET(req: NextRequest) {
  try {
    const auth =
      req.headers.get("authorization") || req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return mobileCors(
        NextResponse.json({ error: "Missing Authorization header" }, { status: 401 })
      );
    }
    const token = auth.slice(7);
    const secret = process.env.NEXTAUTH_SECRET || "fallback-dev-secret";
    try {
      jwt.verify(token, secret);
    } catch {
      return mobileCors(
        NextResponse.json({ error: "Invalid token" }, { status: 401 })
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = { isPublished: true };
    if (category && category !== "all") where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { speaker: { contains: search, mode: "insensitive" } },
        { scriptureReference: { contains: search, mode: "insensitive" } },
      ];
    }

    const data = await prisma.pastorMessage.findMany({
      where,
      orderBy: { date: "desc" },
      take: 100,
    });

    const messages = data.map((m) => ({
      id: m.id,
      title: m.title,
      speaker: m.speaker,
      scriptureReference: m.scriptureReference,
      content: m.content,
      notes: m.notes,
      audioUrl: m.audioUrl,
      videoUrl: m.videoUrl,
      thumbnailUrl: m.thumbnailUrl,
      category: m.category,
      date: m.date.toISOString().split("T")[0],
      durationSeconds: m.durationSeconds,
      createdAt: m.createdAt,
    }));

    return mobileCors(NextResponse.json({ messages }));
  } catch (e: any) {
    console.error("[mobile/pastor-messages]", e);
    return mobileCors(
      NextResponse.json(
        { error: "Failed to fetch pastor messages" },
        { status: 500 }
      )
    );
  }
}
