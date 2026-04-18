import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { countChildrensWorkers } from "@/lib/notify-children";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("err" in auth) return auth.err;
  const count = await countChildrensWorkers();
  return NextResponse.json({ count });
}
