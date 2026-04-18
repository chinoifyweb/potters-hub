import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { renderTemplate, toWaLink, normalizePhone } from "@/lib/outreach-templates";
import { pushLog } from "@/lib/outreach-log";

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
      phone?: string;
      name?: string;
      type?: string;
      message?: string;
    };

    if (!body.phone || typeof body.phone !== "string") {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    const type = body.type ?? "";
    const text = renderTemplate(type, body.name ?? null, body.message ?? null);
    const link = toWaLink(body.phone, text);
    if (!link) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const normalized = normalizePhone(body.phone) ?? body.phone;
    pushLog({
      channel: "whatsapp",
      status: "queued",
      to: normalized,
      name: body.name,
      type,
    });

    return NextResponse.json({ ok: true, link, text, to: body.phone });
  } catch (error) {
    console.error("[outreach/send] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
