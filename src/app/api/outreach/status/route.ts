import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TEMPLATE_OPTIONS } from "@/lib/outreach-templates";
import { getSmsStatus } from "@/lib/outreach-sms";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      whatsapp: {
        ready: true,
        state: "CLICK_TO_SEND",
        mode: "wa.me",
      },
      sms: getSmsStatus(),
      church: "The Potter's Hub",
      serverTime: new Date().toISOString(),
      templates: TEMPLATE_OPTIONS,
    });
  } catch (error) {
    console.error("[outreach/status] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
