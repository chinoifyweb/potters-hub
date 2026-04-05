import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://geambxvkdmquotsprdgv.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlYW1ieHZrZG1xdW90c3ByZGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDY0MDMsImV4cCI6MjA5MDQ4MjQwM30.xHklQJjnMbqD-Qlgyo9s6IdHu8xd3F5BREFybf_PG0Y"
);

// GET /api/devotionals — get today's devotional, by date, or list all
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const listParam = searchParams.get("list");

    // List mode: return all devotionals (for calendar/archive)
    if (listParam === "true") {
      const { data, error } = await supabase
        .from("devotionals")
        .select("id, date, day_of_week, title, scripture")
        .eq("is_published", true)
        .order("date", { ascending: true });

      if (error) throw error;

      const devotionals = (data || []).map((d: any) => ({
        id: d.id,
        date: typeof d.date === "string" ? d.date.split("T")[0] : d.date,
        dayOfWeek: d.day_of_week,
        topic: d.title,
        scriptureRef: d.scripture,
      }));

      return NextResponse.json({ devotionals });
    }

    // Single devotional by date (or today)
    const targetDate = dateParam || new Date().toISOString().split("T")[0];
    const startOfDay = `${targetDate}T00:00:00.000Z`;
    const endOfDay = `${targetDate}T23:59:59.999Z`;

    const { data: devotional, error } = await supabase
      .from("devotionals")
      .select("*")
      .gte("date", startOfDay)
      .lte("date", endOfDay)
      .eq("is_published", true)
      .single();

    if (error || !devotional) {
      return NextResponse.json(
        { error: "No devotional found for this date" },
        { status: 404 }
      );
    }

    // Get previous and next dates for navigation
    const [prevResult, nextResult] = await Promise.all([
      supabase
        .from("devotionals")
        .select("date, title")
        .eq("is_published", true)
        .lt("date", startOfDay)
        .order("date", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("devotionals")
        .select("date, title")
        .eq("is_published", true)
        .gt("date", endOfDay)
        .order("date", { ascending: true })
        .limit(1)
        .single(),
    ]);

    // Helper to extract YYYY-MM-DD from timestamptz
    const toDateStr = (d: string) => typeof d === "string" ? d.split("T")[0] : d;

    // Map to camelCase for frontend
    const mapped = {
      id: devotional.id,
      date: toDateStr(devotional.date),
      dayOfWeek: devotional.day_of_week,
      topic: devotional.title,
      scriptureRef: devotional.scripture,
      scriptureText: devotional.scripture_text,
      morningReading: devotional.morning_reading,
      body: devotional.content,
      prayerPoints: devotional.prayer_points,
      isPublished: devotional.is_published,
    };

    return NextResponse.json({
      devotional: mapped,
      navigation: {
        prev: prevResult.data
          ? { date: toDateStr(prevResult.data.date), topic: prevResult.data.title }
          : null,
        next: nextResult.data
          ? { date: toDateStr(nextResult.data.date), topic: nextResult.data.title }
          : null,
      },
    });
  } catch (error) {
    console.error("Devotional API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch devotional" },
      { status: 500 }
    );
  }
}
