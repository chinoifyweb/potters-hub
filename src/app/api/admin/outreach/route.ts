import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { sendWhatsApp, sendSMS, renderTemplate, DEFAULT_TEMPLATES } from "@/lib/messaging";

export async function GET() {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const logs = await prisma.messageLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ logs, templates: DEFAULT_TEMPLATES });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const sentById = (auth.session.user as any).id;
  const b = await req.json();
  const channel: "whatsapp" | "sms" | "both" = b.channel;
  const type: string = b.type || "custom";
  const customBody: string | undefined = b.customBody;
  const recipients: { name: string; phone: string; visitorId?: string; userId?: string }[] = b.recipients || [];
  const tpl = customBody || DEFAULT_TEMPLATES[type] || "";
  const results: any[] = [];
  for (const r of recipients) {
    if (!r.phone) {
      results.push({ phone: r.phone, status: "failed", error: "no_phone" });
      continue;
    }
    const msg = renderTemplate(tpl, { name: (r.name || "").split(" ")[0] || "friend" });
    const meta = { name: r.name, type, sentById, visitorId: r.visitorId, userId: r.userId };
    if (channel === "whatsapp" || channel === "both") {
      const w = await sendWhatsApp(r.phone, msg, meta);
      results.push({ channel: "whatsapp", ...w });
    }
    if (channel === "sms" || channel === "both") {
      const s = await sendSMS(r.phone, msg, meta);
      results.push({ phone: r.phone, channel: "sms", ...s });
    }
    await new Promise((res) => setTimeout(res, 2000 + Math.random() * 2000));
  }
  return NextResponse.json({ results });
}
