import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function normPhone(p?: string | null): string {
  if (!p) return "";
  return String(p).replace(/\D/g, "").replace(/^0/, "234");
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;

  const { searchParams } = new URL(req.url);
  const audience = searchParams.get("audience") || "all";
  const sinceDays = parseInt(searchParams.get("sinceDays") || "0", 10);

  const [members, workers, visitors] = await Promise.all([
    audience === "workers" || audience === "firsttimers"
      ? Promise.resolve([] as any[])
      : prisma.user.findMany({
          where: { role: "member", isActive: true },
          select: { id: true, fullName: true, phone: true, email: true, birthDay: true, birthMonth: true },
          orderBy: { fullName: "asc" },
        }),
    audience === "members" || audience === "firsttimers"
      ? Promise.resolve([] as any[])
      : prisma.worker.findMany({
          where: { isActive: true },
          select: { id: true, fullName: true, phone: true, email: true, department: true, birthDay: true, birthMonth: true },
          orderBy: { fullName: "asc" },
        }),
    audience === "members" || audience === "workers"
      ? Promise.resolve([] as any[])
      : prisma.visitor.findMany({
          where: sinceDays > 0
            ? { firstVisitDate: { gte: new Date(Date.now() - sinceDays * 86400000) } }
            : {},
          select: { id: true, fullName: true, phone: true, email: true, firstVisitDate: true, status: true, birthDay: true, birthMonth: true },
          orderBy: { firstVisitDate: "desc" },
        }),
  ]);

  const map = new Map<string, any>();

  for (const m of members) {
    const key = normPhone(m.phone) || `m:${m.id}`;
    map.set(key, {
      key,
      id: m.id, fullName: m.fullName, phone: m.phone, email: m.email,
      birthDay: m.birthDay, birthMonth: m.birthMonth,
      tags: ["member"],
      sources: [{ table: "members", id: m.id }],
    });
  }
  for (const w of workers) {
    const key = normPhone(w.phone) || `w:${w.id}`;
    const existing = map.get(key);
    if (existing) {
      if (!existing.tags.includes("worker")) existing.tags.push("worker");
      existing.sources.push({ table: "workers", id: w.id });
      existing.department = w.department || existing.department;
    } else {
      map.set(key, {
        key,
        id: w.id, fullName: w.fullName, phone: w.phone, email: w.email,
        department: w.department, birthDay: w.birthDay, birthMonth: w.birthMonth,
        tags: ["worker"],
        sources: [{ table: "workers", id: w.id }],
      });
    }
  }
  for (const v of visitors) {
    const key = normPhone(v.phone) || `v:${v.id}`;
    const existing = map.get(key);
    if (existing) {
      if (!existing.tags.includes("firsttimer")) existing.tags.push("firsttimer");
      existing.sources.push({ table: "visitors", id: v.id });
      existing.firstVisitDate = v.firstVisitDate;
    } else {
      map.set(key, {
        key,
        id: v.id, fullName: v.fullName, phone: v.phone, email: v.email,
        firstVisitDate: v.firstVisitDate, birthDay: v.birthDay, birthMonth: v.birthMonth,
        tags: ["firsttimer"],
        sources: [{ table: "visitors", id: v.id }],
      });
    }
  }

  const contacts = Array.from(map.values()).filter((c) => c.phone);
  contacts.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));

  return NextResponse.json({ contacts, count: contacts.length });
}
