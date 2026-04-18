import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;

  let memberGrowth: Array<{ month: string; count: number }> = [];
  let outreachByDay: Array<{ day: string; sent: number; failed: number }> = [];

  try {
    const rows = await prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
      SELECT DATE_TRUNC('month', created_at) as month, COUNT(*)::bigint as count
      FROM users
      WHERE role = 'member' AND is_active = true
        AND created_at > NOW() - INTERVAL '6 months'
      GROUP BY month ORDER BY month ASC
    `;
    memberGrowth = rows.map(r => ({
      month: new Date(r.month).toLocaleDateString("en", { month: "short", year: "2-digit" }),
      count: Number(r.count),
    }));
  } catch (e) { console.error("memberGrowth query failed:", e); }

  try {
    const rows = await prisma.$queryRaw<Array<{ day: Date; sent: bigint; failed: bigint }>>`
      SELECT DATE_TRUNC('day', created_at) as day,
        SUM(CASE WHEN status != 'failed' THEN 1 ELSE 0 END)::bigint as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::bigint as failed
      FROM message_logs
      WHERE created_at > NOW() - INTERVAL '14 days'
      GROUP BY day ORDER BY day ASC
    `;
    outreachByDay = rows.map(r => ({
      day: new Date(r.day).toLocaleDateString("en", { month: "short", day: "numeric" }),
      sent: Number(r.sent),
      failed: Number(r.failed),
    }));
  } catch (e) { console.error("outreachByDay query failed:", e); }

  return NextResponse.json({ memberGrowth, outreachByDay });
}
