import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/bible-study-auth";

const createPostSchema = z.object({
  content: z.string().min(1).max(10000),
  parentPostId: z.string().uuid().optional().nullable(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const topic = await prisma.bibleStudyTopic.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, isLocked: true, isVisible: true, createdById: true },
    });
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    if (!topic.isVisible) return NextResponse.json({ error: "Topic not available" }, { status: 404 });
    if (topic.isLocked) return NextResponse.json({ error: "Topic is locked" }, { status: 403 });

    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Validate parent post belongs to same topic if provided
    if (parsed.data.parentPostId) {
      const parent = await prisma.bibleStudyPost.findUnique({
        where: { id: parsed.data.parentPostId },
        select: { topicId: true },
      });
      if (!parent || parent.topicId !== topic.id) {
        return NextResponse.json({ error: "Invalid parent post" }, { status: 400 });
      }
    }

    const post = await prisma.bibleStudyPost.create({
      data: {
        topicId: topic.id,
        authorId: user.id,
        content: parsed.data.content,
        parentPostId: parsed.data.parentPostId || null,
      },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        _count: { select: { likes: true, replies: true } },
      },
    });

    // Bump topic activity
    await prisma.bibleStudyTopic.update({
      where: { id: topic.id },
      data: { lastActivityAt: new Date() },
    });

    // Fire email notifications (fire-and-forget) to topic creator + thread participants
    (async () => {
      try {
        const subscribers = await prisma.user.findMany({
          where: {
            OR: [
              { id: topic.createdById },
              {
                bibleStudyPosts: {
                  some: { topicId: topic.id, NOT: { authorId: user.id } },
                },
              },
            ],
            NOT: { id: user.id },
            isActive: true,
          },
          select: { id: true, email: true, fullName: true },
        });

        const seen = new Set<string>();
        const uniqueSubscribers = subscribers.filter((u) => {
          if (!u.email) return false;
          if (seen.has(u.email)) return false;
          seen.add(u.email);
          return true;
        });

        if (uniqueSubscribers.length === 0) return;

        const { sendEmail } = await import("@/lib/email");
        const safeContent = (parsed.data.content || "")
          .slice(0, 300)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br>");
        const safeTitle = topic.title
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const safeAuthor = (user.fullName || "A member")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        for (const s of uniqueSubscribers) {
          sendEmail({
            to: s.email,
            subject: `New reply in "${topic.title}" — TPHC Bible Study`,
            html: `
              <p>Hello ${(s.fullName || "Beloved").replace(/</g, "&lt;")},</p>
              <p><strong>${safeAuthor}</strong> just replied in a Bible study thread you're following:</p>
              <p><em>"${safeTitle}"</em></p>
              <blockquote style="border-left:3px solid #C41E1E;padding-left:12px;color:#444">
                ${safeContent}
              </blockquote>
              <p><a href="https://tphc.org.ng/bible-study/${topic.id}" style="background:#C41E1E;color:white;padding:10px 18px;border-radius:6px;text-decoration:none">Open the discussion</a></p>
              <p>— The Potter's House Church</p>
            `,
          }).catch((e: any) => console.error("[bible-study email]", e));
        }

        // Push notifications (best effort, in-app notifications table)
        try {
          await prisma.notification.createMany({
            data: uniqueSubscribers.map((s) => ({
              userId: s.id,
              type: "bible_study_reply",
              title: `New reply in "${topic.title}"`,
              body: `${user.fullName || "A member"} replied to a Bible study thread you're following.`,
              data: { topicId: topic.id, postId: post.id } as any,
            })),
            skipDuplicates: true,
          });
        } catch (e) {
          // notifications table may not have createMany support for all dbs — non-fatal
          console.error("[bible-study notify]", e);
        }
      } catch (e) {
        console.error("[bible-study notify outer]", e);
      }
    })();

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error("[bible-study [id]/posts POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
