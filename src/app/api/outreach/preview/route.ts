import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { renderTemplate } from "@/lib/outreach-templates";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      type?: string;
      name?: string;
      message?: string;
    };
    const type = body.type ?? "";
    const text = renderTemplate(type, body.name ?? null, body.message ?? null);
    return NextResponse.json({ text });
  } catch (error) {
    console.error("[outreach/preview] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
