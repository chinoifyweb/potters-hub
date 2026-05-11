import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/bible-study-auth";

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const post = await prisma.bibleStudyPost.findUnique({
      where: { id: params.postId },
      select: { id: true },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await prisma.bibleStudyLike.findUnique({
      where: { postId_userId: { postId: params.postId, userId: user.id } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.bibleStudyLike.delete({ where: { id: existing.id } });
      await prisma.bibleStudyPost.update({
        where: { id: params.postId },
        data: { likeCount: { decrement: 1 } },
      });
      liked = false;
    } else {
      await prisma.bibleStudyLike.create({
        data: { postId: params.postId, userId: user.id },
      });
      await prisma.bibleStudyPost.update({
        where: { id: params.postId },
        data: { likeCount: { increment: 1 } },
      });
      liked = true;
    }

    const fresh = await prisma.bibleStudyPost.findUnique({
      where: { id: params.postId },
      select: { likeCount: true },
    });

    return NextResponse.json({ liked, likeCount: fresh?.likeCount ?? 0 });
  } catch (error: any) {
    console.error("[bible-study like POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
