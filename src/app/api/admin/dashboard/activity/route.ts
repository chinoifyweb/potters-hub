import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export async function GET() {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;

  const [members, visitors, workers, msgs, files, childMan] = await Promise.all([
    safe(() => prisma.user.findMany({ where: { role: "member", isActive: true }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, fullName: true, createdAt: true } }), [] as any[]),
    safe(() => prisma.visitor.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, fullName: true, createdAt: true } }), [] as any[]),
    safe(() => prisma.worker.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, fullName: true, department: true, createdAt: true } }), [] as any[]),
    safe(() => prisma.messageLog.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, channel: true, recipient: true, recipientName: true, status: true, createdAt: true } }), [] as any[]),
    safe(() => prisma.fileUpload.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, originalName: true, createdAt: true } }), [] as any[]),
    safe(() => prisma.childrenSermon.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, createdAt: true } }), [] as any[]),
  ]);

  const items: any[] = [
    ...members.map((m: any) => ({ type: "member", title: m.fullName, subtitle: "New member added", time: m.createdAt, icon: "👤" })),
    ...visitors.map((v: any) => ({ type: "visitor", title: v.fullName, subtitle: "First-timer registered", time: v.createdAt, icon: "🙋" })),
    ...workers.map((w: any) => ({ type: "worker", title: w.fullName, subtitle: "Worker added" + (w.department ? ` — ${w.department}` : ""), time: w.createdAt, icon: "🛠️" })),
    ...msgs.map((m: any) => ({ type: "outreach", title: m.recipientName || m.recipient, subtitle: `${m.channel.toUpperCase()} — ${m.status}`, time: m.createdAt, icon: m.channel === "whatsapp" ? "💬" : "📱", status: m.status })),
    ...files.map((f: any) => ({ type: "file", title: f.originalName, subtitle: "File uploaded", time: f.createdAt, icon: "📎" })),
    ...childMan.map((c: any) => ({ type: "children", title: c.title, subtitle: "Children's Manual entry", time: c.createdAt, icon: "📖" })),
  ];

  items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return NextResponse.json({ activity: items.slice(0, 15) });
}
