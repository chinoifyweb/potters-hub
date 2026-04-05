import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://geambxvkdmquotsprdgv.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlYW1ieHZrZG1xdW90c3ByZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDY0MDMsImV4cCI6MjA5MDQ4MjQwM30.xHklQJjnMbqD-Qlgyo9s6IdHu8xd3F5BREFybf_PG0Y"
);

// GET /api/admin/devotionals — list all devotionals (admin/pastor only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin" && session.user.role !== "pastor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("devotionals")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    const devotionals = (data || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      scripture: d.scripture,
      scriptureText: d.scripture_text,
      content: d.content,
      author: d.author,
      date: typeof d.date === "string" ? d.date.split("T")[0] : d.date,
      dayOfWeek: d.day_of_week,
      morningReading: d.morning_reading,
      prayerPoints: d.prayer_points || [],
      isPublished: d.is_published,
    }));

    return NextResponse.json({ devotionals });
  } catch (error) {
    console.error("Admin devotionals API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch devotionals" },
      { status: 500 }
    );
  }
}

// POST /api/admin/devotionals — create a devotional
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
      scripture,
      scriptureText,
      content,
      author,
      date,
      dayOfWeek,
      morningReading,
      prayerPoints,
      isPublished,
    } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: "Title and date are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("devotionals")
      .insert({
        title,
        scripture: scripture || null,
        scripture_text: scriptureText || null,
        content: content || "",
        author: author || null,
        date: `${date}T00:00:00Z`,
        day_of_week: dayOfWeek || null,
        morning_reading: morningReading || null,
        prayer_points: prayerPoints || [],
        is_published: isPublished ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A devotional already exists for this date" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ devotional: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating devotional:", error);
    return NextResponse.json(
      { error: "Failed to create devotional" },
      { status: 500 }
    );
  }
}
