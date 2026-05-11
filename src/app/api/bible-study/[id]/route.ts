import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/bible-study-auth";
import { BIBLE_STUDY_CATEGORY_KEYS } from "@/lib/bible-study-categories";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;
    const skip = (page - 1) * limit;

    const topic = await prisma.bibleStudyTopic.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        _count: { select: { posts: true } },
      },
    });
    if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Increment view count (fire-and-forget)
    prisma.bibleStudyTopic
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch((e: any) => console.error("[bible-study view inc]", e));

    const [posts, totalPosts] = await Promise.all([
      prisma.bibleStudyPost.findMany({
        where: { topicId: id, isVisible: true },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
          _count: { select: { likes: true, replies: true } },
        },
      }),
      prisma.bibleStudyPost.count({ where: { topicId: id, isVisible: true } }),
    ]);

    // Mark which posts current user has liked (if authenticated)
    const currentUser = await getCurrentUser(req);
    let likedIds: Set<string> = new Set();
    if (currentUser && posts.length > 0) {
      const likes = await prisma.bibleStudyLike.findMany({
        where: { userId: currentUser.id, postId: { in: posts.map((p) => p.id) } },
        select: { postId: true },
      });
      likedIds = new Set(likes.map((l) => l.postId));
    }

    const postsWithMeta = posts.map((p) => ({ ...p, likedByMe: likedIds.has(p.id) }));

    return NextResponse.json({
      topic,
      posts: postsWithMeta,
      pagination: { page, totalPages: Math.ceil(totalPosts / limit), total: totalPosts },
    });
  } catch (error: any) {
    console.error("[bible-study [id] GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const patchSchema = z.object({
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  category: z.string().optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(10000).optional().nullable(),
  scripture: z.string().max(200).optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: any = {};
    if (parsed.data.isPinned !== undefined) data.isPinned = parsed.data.isPinned;
    if (parsed.data.isLocked !== undefined) data.isLocked = parsed.data.isLocked;
    if (parsed.data.isVisible !== undefined) data.isVisible = parsed.data.isVisible;
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.scripture !== undefined) data.scripture = parsed.data.scripture;
    if (parsed.data.category !== undefined) {
      if (!BIBLE_STUDY_CATEGORY_KEYS.includes(parsed.data.category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      data.category = parsed.data.category;
    }

    const topic = await prisma.bibleStudyTopic.update({ where: { id: params.id }, data });
    return NextResponse.json({ topic });
  } catch (error: any) {
    console.error("[bible-study [id] PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.bibleStudyTopic.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[bible-study [id] DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
