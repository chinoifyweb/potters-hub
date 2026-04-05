import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://geambxvkdmquotsprdgv.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlYW1ieHZrZG1xdW90c3ByZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDY0MDMsImV4cCI6MjA5MDQ4MjQwM30.xHklQJjnMbqD-Qlgyo9s6IdHu8xd3F5BREFybf_PG0Y"
);

// GET /api/pastor-messages/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "pastor" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("pastor_messages")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: {
        id: data.id,
        title: data.title,
        speaker: data.speaker,
        scriptureReference: data.scripture_reference,
        content: data.content,
        notes: data.notes,
        audioUrl: data.audio_url,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        category: data.category,
        date: typeof data.date === "string" ? data.date.split("T")[0] : data.date,
        durationSeconds: data.duration_seconds,
        isPublished: data.is_published,
      },
    });
  } catch (error) {
    console.error("Error fetching pastor message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

// PUT /api/pastor-messages/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin" && session.user.role !== "pastor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updates: any = { updated_at: new Date().toISOString() };

    if (body.title !== undefined) updates.title = body.title;
    if (body.speaker !== undefined) updates.speaker = body.speaker;
    if (body.scriptureReference !== undefined) updates.scripture_reference = body.scriptureReference;
    if (body.content !== undefined) updates.content = body.content;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.audioUrl !== undefined) updates.audio_url = body.audioUrl;
    if (body.videoUrl !== undefined) updates.video_url = body.videoUrl;
    if (body.category !== undefined) updates.category = body.category;
    if (body.date !== undefined) updates.date = `${body.date}T00:00:00Z`;
    if (body.isPublished !== undefined) updates.is_published = body.isPublished;

    const { data, error } = await supabase
      .from("pastor_messages")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: data });
  } catch (error) {
    console.error("Error updating pastor message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE /api/pastor-messages/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — Admin only" }, { status: 403 });
    }

    const { error } = await supabase
      .from("pastor_messages")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pastor message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
