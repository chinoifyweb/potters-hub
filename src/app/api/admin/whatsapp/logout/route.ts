import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const WA_URL = process.env.WA_SERVICE_URL || "http://127.0.0.1:3402/api";

export async function POST() {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  try {
    const r = await fetch(`${WA_URL}/logout`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
    });
    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: r.status });
  } catch (e: any) {
    return NextResponse.json({ error: "WA service unreachable" }, { status: 502 });
  }
}
