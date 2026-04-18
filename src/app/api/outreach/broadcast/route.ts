import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { renderTemplate, toWaLink, normalizePhone } from "@/lib/outreach-templates";
import { pushLog } from "@/lib/outreach-log";

export const dynamic = "force-dynamic";

type Recipient = { name?: string; phone: string };

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
      recipients?: Recipient[];
      type?: string;
      message?: string;
    };

    if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
      return NextResponse.json(
        { error: "recipients must be a non-empty array" },
        { status: 400 }
      );
    }

    const type = body.type ?? "";
    const message = body.message ?? null;
    const items: Array<{ name?: string; phone: string; link: string; text: string }> = [];
    const failed: Array<{ name?: string; phone: string; error: string }> = [];

    for (const recipient of body.recipients) {
      const text = renderTemplate(type, recipient.name ?? null, message);
      const link = recipient.phone ? toWaLink(recipient.phone, text) : null;
      const normalized = normalizePhone(recipient.phone) ?? recipient.phone ?? "";

      if (!link) {
        failed.push({
          name: recipient.name,
          phone: recipient.phone,
          error: "Invalid phone number",
        });
        pushLog({
          channel: "whatsapp",
          status: "failed",
          to: normalized,
          name: recipient.name,
          type,
          error: "Invalid phone number",
        });
        continue;
      }

      items.push({ name: recipient.name, phone: recipient.phone, link, text });
      pushLog({
        channel: "whatsapp",
        status: "queued",
        to: normalized,
        name: recipient.name,
        type,
      });
    }

    return NextResponse.json({
      ok: true,
      queued: items.length,
      failed: failed.length,
      items,
    });
  } catch (error) {
    console.error("[outreach/broadcast] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
