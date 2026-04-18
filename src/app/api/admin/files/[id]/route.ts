import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_DIR = "/home/tphc.org.ng/nodeapp/public/d";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdmin();
  if ("err" in gate) return gate.err;

  const row = await prisma.fileUpload.findUnique({ where: { id: params.id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Remove disk dir
  const uuidDir = path.join(BASE_DIR, row.uuid);
  try {
    if (fs.existsSync(uuidDir)) {
      fs.rmSync(uuidDir, { recursive: true, force: true });
    }
  } catch (e: any) {
    console.error("[files/delete] fs.rmSync failed", e?.message);
  }

  await prisma.fileUpload.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdmin();
  if ("err" in gate) return gate.err;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const label =
    typeof body?.label === "string" ? body.label.trim().slice(0, 200) : null;

  const row = await prisma.fileUpload.update({
    where: { id: params.id },
    data: { label: label || null },
  });

  return NextResponse.json({
    ok: true,
    file: {
      id: row.id,
      uuid: row.uuid,
      originalName: row.originalName,
      safeName: row.safeName,
      label: row.label,
      sizeBytes: Number(row.sizeBytes),
      createdAt: row.createdAt,
      downloadCount: row.downloadCount,
      url: `/d/${row.uuid}/${row.safeName}`,
    },
  });
}
