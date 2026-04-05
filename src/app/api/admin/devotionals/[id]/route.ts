import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://geambxvkdmquotsprdgv.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlYW1ieHZrZG1xdW90c3ByZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDY0MDMsImV4cCI6MjA5MDQ4MjQwM30.xHklQJjnMbqD-Qlgyo9s6IdHu8xd3F5BREFybf_PG0Y"
);

// PUT /api/admin/devotionals/[id]
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
    if (body.scripture !== undefined) updates.scripture = body.scripture;
    if (body.scriptureText !== undefined) updates.scripture_text = body.scriptureText;
    if (body.content !== undefined) updates.content = body.content;
    if (body.author !== undefined) updates.author = body.author;
    if (body.date !== undefined) updates.date = `${body.date}T00:00:00Z`;
    if (body.dayOfWeek !== undefined) updates.day_of_week = body.dayOfWeek;
    if (body.morningReading !== undefined) updates.morning_reading = body.morningReading;
    if (body.prayerPoints !== undefined) updates.prayer_points = body.prayerPoints;
    if (body.isPublished !== undefined) updates.is_published = body.isPublished;

    const { data, error } = await supabase
      .from("devotionals")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ devotional: data });
  } catch (error) {
    console.error("Error updating devotional:", error);
    return NextResponse.json(
      { error: "Failed to update devotional" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/devotionals/[id]
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
      .from("devotionals")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting devotional:", error);
    return NextResponse.json(
      { error: "Failed to delete devotional" },
      { status: 500 }
    );
  }
}
