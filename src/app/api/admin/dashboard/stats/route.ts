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

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    membersTotal, membersNewThisMonth,
    workersTotal, workersByDept,
    firstTimersTotal, firstTimers7, firstTimers30,
    outreach7, outreachTotal, outreachFailed7,
    filesTotal, filesSize, downloadsTotal,
    sermonsPublished, lastSermonDate,
    childrenTotal, lastChildrenDate,
  ] = await Promise.all([
    safe(() => prisma.user.count({ where: { isActive: true, role: "member" } }), 0),
    safe(() => prisma.user.count({ where: { isActive: true, role: "member", createdAt: { gte: startOfMonth } } }), 0),
    safe(() => prisma.worker.count({ where: { isActive: true } }), 0),
    safe(async () => {
      const rows = await prisma.worker.groupBy({ by: ["department"], where: { isActive: true }, _count: { _all: true } });
      return Object.fromEntries(rows.map((r: any) => [r.department || "Other", r._count._all]));
    }, {} as Record<string, number>),
    safe(() => prisma.visitor.count(), 0),
    safe(() => prisma.visitor.count({ where: { firstVisitDate: { gte: sevenDaysAgo } } }), 0),
    safe(() => prisma.visitor.count({ where: { firstVisitDate: { gte: thirtyDaysAgo } } }), 0),
    safe(() => prisma.messageLog.count({ where: { createdAt: { gte: sevenDaysAgo }, status: { not: "failed" } } }), 0),
    safe(() => prisma.messageLog.count(), 0),
    safe(() => prisma.messageLog.count({ where: { createdAt: { gte: sevenDaysAgo }, status: "failed" } }), 0),
    safe(() => prisma.fileUpload.count(), 0),
    safe(async () => {
      const agg = await prisma.fileUpload.aggregate({ _sum: { sizeBytes: true } });
      return Number(agg._sum.sizeBytes ?? 0);
    }, 0),
    safe(async () => {
      const agg = await prisma.fileUpload.aggregate({ _sum: { downloadCount: true } });
      return agg._sum.downloadCount ?? 0;
    }, 0),
    safe(() => prisma.sermon.count({ where: { isPublished: true } }), 0),
    safe(async () => {
      const r = await prisma.sermon.findFirst({ where: { isPublished: true }, orderBy: { createdAt: "desc" }, select: { createdAt: true } });
      return r?.createdAt?.toISOString() ?? null;
    }, null as string | null),
    safe(() => prisma.childrenSermon.count({ where: { isPublished: true } }), 0),
    safe(async () => {
      const r = await prisma.childrenSermon.findFirst({ where: { isPublished: true }, orderBy: { date: "desc" }, select: { date: true } });
      return r?.date?.toISOString() ?? null;
    }, null as string | null),
  ]);

  return NextResponse.json({
    members: { total: membersTotal, newThisMonth: membersNewThisMonth },
    workers: { total: workersTotal, byDepartment: workersByDept },
    firstTimers: { total: firstTimersTotal, last7Days: firstTimers7, last30Days: firstTimers30 },
    outreach: { sentLast7Days: outreach7, sentTotal: outreachTotal, failedLast7Days: outreachFailed7 },
    files: { total: filesTotal, totalSizeBytes: filesSize, downloadsTotal: downloadsTotal },
    sermons: { totalPublished: sermonsPublished, lastSermonDate },
    childrenManual: { totalPublished: childrenTotal, lastEntryDate: lastChildrenDate },
  });
}
