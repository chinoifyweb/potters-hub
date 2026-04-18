import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { renderTemplate, toSmsNumber } from "@/lib/outreach-templates";
import { getSmsStatus, sendSms } from "@/lib/outreach-sms";
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

    if (!getSmsStatus().available) {
      return NextResponse.json({ error: "SMS not configured" }, { status: 503 });
    }

    const type = body.type ?? "";
    const message = body.message ?? null;
    const details: Array<{ to: string; name?: string; ok: boolean; error?: string }> = [];
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < body.recipients.length; i++) {
      const recipient = body.recipients[i];
      const number = recipient.phone ? toSmsNumber(recipient.phone) : null;

      if (!number) {
        failed++;
        details.push({
          to: recipient.phone ?? "",
          name: recipient.name,
          ok: false,
          error: "Invalid phone number",
        });
        pushLog({
          channel: "sms",
          status: "failed",
          to: recipient.phone ?? "",
          name: recipient.name,
          type,
          error: "Invalid phone number",
        });
        continue;
      }

      const text = renderTemplate(type, recipient.name ?? null, message);
      const result = await sendSms(number, text);

      if (result.ok) {
        sent++;
        details.push({ to: number, name: recipient.name, ok: true });
        pushLog({
          channel: "sms",
          status: "success",
          to: number,
          name: recipient.name,
          type,
        });
      } else {
        failed++;
        details.push({ to: number, name: recipient.name, ok: false, error: result.error });
        pushLog({
          channel: "sms",
          status: "failed",
          to: number,
          name: recipient.name,
          type,
          error: result.error,
        });
      }

      if (i < body.recipients.length - 1) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    return NextResponse.json({
      ok: true,
      total: body.recipients.length,
      sent,
      failed,
      details,
    });
  } catch (error) {
    console.error("[outreach/sms-broadcast] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
