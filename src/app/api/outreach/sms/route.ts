import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { renderTemplate, toSmsNumber } from "@/lib/outreach-templates";
import { sendSms } from "@/lib/outreach-sms";
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

    const number = toSmsNumber(body.phone);
    if (!number) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const type = body.type ?? "";
    const text = renderTemplate(type, body.name ?? null, body.message ?? null);
    const result = await sendSms(number, text);

    if (result.ok) {
      pushLog({
        channel: "sms",
        status: "success",
        to: number,
        name: body.name,
        type,
      });
      return NextResponse.json({ ok: true, to: number, messageId: result.messageId });
    }

    pushLog({
      channel: "sms",
      status: "failed",
      to: number,
      name: body.name,
      type,
      error: result.error,
    });
    return NextResponse.json({ error: result.error ?? "Failed to send SMS" }, { status: 502 });
  } catch (error) {
    console.error("[outreach/sms] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
