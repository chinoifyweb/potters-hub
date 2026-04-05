import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://geambxvkdmquotsprdgv.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlYW1ieHZrZG1xdW90c3ByZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDY0MDMsImV4cCI6MjA5MDQ4MjQwM30.xHklQJjnMbqD-Qlgyo9s6IdHu8xd3F5BREFybf_PG0Y"
);

// GET /api/pastor-messages — list pastor messages (pastor/admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "pastor" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — Pastors only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const all = searchParams.get("all"); // admin can see unpublished

    let query = supabase
      .from("pastor_messages")
      .select("*")
      .order("date", { ascending: false });

    // Non-admin pastors only see published
    if (session.user.role !== "admin" && all !== "true") {
      query = query.eq("is_published", true);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,speaker.ilike.%${search}%,scripture_reference.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    const messages = (data || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      speaker: m.speaker,
      scriptureReference: m.scripture_reference,
      content: m.content,
      notes: m.notes,
      audioUrl: m.audio_url,
      videoUrl: m.video_url,
      thumbnailUrl: m.thumbnail_url,
      category: m.category,
      date: typeof m.date === "string" ? m.date.split("T")[0] : m.date,
      durationSeconds: m.duration_seconds,
      isPublished: m.is_published,
      createdAt: m.created_at,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Pastor messages API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pastor messages" },
      { status: 500 }
    );
  }
}

// POST /api/pastor-messages — create a pastor message (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin" && session.user.role !== "pastor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      speaker,
      scriptureReference,
      content,
      notes,
      audioUrl,
      videoUrl,
      category,
      date,
      isPublished,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pastor_messages")
      .insert({
        title,
        speaker: speaker || null,
        scripture_reference: scriptureReference || null,
        content: content || null,
        notes: notes || null,
        audio_url: audioUrl || null,
        video_url: videoUrl || null,
        category: category || "sermon",
        date: date ? `${date}T00:00:00Z` : new Date().toISOString(),
        is_published: isPublished ?? false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating pastor message:", error);
    return NextResponse.json(
      { error: "Failed to create pastor message" },
      { status: 500 }
    );
  }
}
