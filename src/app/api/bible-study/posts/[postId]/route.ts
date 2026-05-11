import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/bible-study-auth";

const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const patchSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  isVisible: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const post = await prisma.bibleStudyPost.findUnique({
      where: { id: params.postId },
      select: { id: true, authorId: true, createdAt: true },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const admin = isAdmin(user);
    const isAuthor = post.authorId === user.id;

    // Only admin can change visibility
    if (parsed.data.isVisible !== undefined && !admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Content edits: author within window, OR admin always
    if (parsed.data.content !== undefined) {
      if (!admin) {
        if (!isAuthor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const age = Date.now() - new Date(post.createdAt).getTime();
        if (age > EDIT_WINDOW_MS) {
          return NextResponse.json(
            { error: "Edit window expired (15 minutes)" },
            { status: 403 }
          );
        }
      }
    }

    const data: any = {};
    if (parsed.data.content !== undefined) data.content = parsed.data.content;
    if (parsed.data.isVisible !== undefined) data.isVisible = parsed.data.isVisible;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.bibleStudyPost.update({
      where: { id: params.postId },
      data,
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        _count: { select: { likes: true, replies: true } },
      },
    });
    return NextResponse.json({ post: updated });
  } catch (error: any) {
    console.error("[bible-study posts [postId] PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const post = await prisma.bibleStudyPost.findUnique({
      where: { id: params.postId },
      select: { id: true, authorId: true },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const admin = isAdmin(user);
    const isAuthor = post.authorId === user.id;
    if (!admin && !isAuthor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.bibleStudyPost.delete({ where: { id: params.postId } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[bible-study posts [postId] DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
