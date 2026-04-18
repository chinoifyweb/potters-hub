import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { sendWhatsApp, sendSMS, renderTemplate, DEFAULT_TEMPLATES } from "@/lib/messaging";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_FILES = 10;
const MAX_FILE_BYTES = 200 * 1024 * 1024; // 200MB
const UPLOADS_DIR = "/home/tphc.org.ng/nodeapp/uploads/outreach";

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

  const contentType = req.headers.get("content-type") || "";
  let channel: "whatsapp" | "sms" | "both";
  let type: string;
  let customBody: string | undefined;
  let recipients: { name: string; phone: string; visitorId?: string; userId?: string }[] = [];
  let filePaths: string[] = [];

  if (contentType.includes("multipart/form-data")) {
    // Multipart branch — payload JSON + file blobs
    let form: FormData;
    try {
      form = await req.formData();
    } catch (e: any) {
      return NextResponse.json({ error: "Invalid multipart form" }, { status: 400 });
    }
    const payloadRaw = String(form.get("payload") || "{}");
    let payload: any = {};
    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
    }
    channel = payload.channel;
    type = payload.type || "custom";
    customBody = payload.customBody;
    recipients = payload.recipients || [];

    const fileFields = form.getAll("files").filter((f): f is File => f instanceof File);
    if (fileFields.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Too many files — max ${MAX_FILES} allowed` },
        { status: 400 },
      );
    }
    for (const f of fileFields) {
      if (f.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: `File "${f.name}" exceeds 200MB limit` },
          { status: 400 },
        );
      }
    }

    if (fileFields.length > 0) {
      await fs.promises.mkdir(UPLOADS_DIR, { recursive: true });
      for (const file of fileFields) {
        const bytes = Buffer.from(await file.arrayBuffer());
        const safeName = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
        const uuid = crypto.randomUUID();
        const fp = path.join(UPLOADS_DIR, `${uuid}-${safeName}`);
        await fs.promises.writeFile(fp, bytes);
        filePaths.push(fp);
      }
    }
  } else {
    // Original JSON branch
    const b = await req.json();
    channel = b.channel;
    type = b.type || "custom";
    customBody = b.customBody;
    recipients = b.recipients || [];
  }

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
      // Pass filePaths only to WhatsApp — SMS cannot carry attachments
      const w = await sendWhatsApp(r.phone, msg, meta, filePaths.length ? filePaths : undefined);
      results.push({ channel: "whatsapp", ...w });
    }
    if (channel === "sms" || channel === "both") {
      const s = await sendSMS(r.phone, msg, meta);
      results.push({ phone: r.phone, channel: "sms", ...s });
    }
    await new Promise((res) => setTimeout(res, 2000 + Math.random() * 2000));
  }

  // Schedule cleanup of uploaded files after 10 minutes — plenty of time for
  // the WA service to have finished sending them all.
  if (filePaths.length > 0) {
    setTimeout(
      () => {
        filePaths.forEach((fp) =>
          fs.promises.unlink(fp).catch(() => {
            /* ignore */
          }),
        );
      },
      10 * 60 * 1000,
    );
  }

  return NextResponse.json({ results });
}
