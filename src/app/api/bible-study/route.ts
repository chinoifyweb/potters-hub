import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/bible-study-auth";
import { BIBLE_STUDY_CATEGORIES, BIBLE_STUDY_CATEGORY_KEYS } from "@/lib/bible-study-categories";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = { isVisible: true };
    if (category && BIBLE_STUDY_CATEGORY_KEYS.includes(category)) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { scripture: { contains: search, mode: "insensitive" } },
      ];
    }

    const [topics, total] = await Promise.all([
      prisma.bibleStudyTopic.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: "desc" }, { lastActivityAt: "desc" }],
        include: {
          createdBy: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
          _count: { select: { posts: true } },
        },
      }),
      prisma.bibleStudyTopic.count({ where }),
    ]);

    return NextResponse.json({
      topics,
      categories: BIBLE_STUDY_CATEGORIES,
      pagination: { page, totalPages: Math.ceil(total / limit), total },
    });
  } catch (error: any) {
    console.error("[bible-study GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(10000).optional(),
  scripture: z.string().max(200).optional(),
  category: z.string().refine((v) => BIBLE_STUDY_CATEGORY_KEYS.includes(v), {
    message: "Invalid category",
  }),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const topic = await prisma.bibleStudyTopic.create({
      data: {
        title: parsed.data.title.trim(),
        description: parsed.data.description?.trim() || null,
        scripture: parsed.data.scripture?.trim() || null,
        category: parsed.data.category,
        createdById: user.id,
      },
      include: {
        createdBy: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error: any) {
    console.error("[bible-study POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
