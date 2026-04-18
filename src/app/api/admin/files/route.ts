import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 600;
export const dynamic = "force-dynamic";

const BASE_DIR = "/home/tphc.org.ng/nodeapp/public/d";
const MAX_FILE_BYTES = 500 * 1024 * 1024; // 500 MB
const MAX_FILES_PER_REQUEST = 20;

function sanitizeFilename(name: string): string {
  // Keep only safe chars; preserve extension
  const trimmed = name.trim().replace(/\s+/g, "_");
  const safe = trimmed.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Avoid pathological empty name
  if (!safe || safe === "." || safe === "..") return "file";
  // Cap length
  return safe.length > 180 ? safe.slice(-180) : safe;
}

function serializeFile(f: any) {
  return {
    id: f.id,
    uuid: f.uuid,
    originalName: f.originalName,
    safeName: f.safeName,
    mimeType: f.mimeType,
    sizeBytes: Number(f.sizeBytes),
    label: f.label,
    createdAt: f.createdAt,
    downloadCount: f.downloadCount,
    url: `/d/${f.uuid}/${f.safeName}`,
  };
}

export async function GET() {
  const gate = await requireAdmin();
  if ("err" in gate) return gate.err;

  const rows = await prisma.fileUpload.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return NextResponse.json({ files: rows.map(serializeFile) });
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if ("err" in gate) return gate.err;

  const session = gate.session;
  const uploaderId = (session.user as any)?.id || null;

  let form: FormData;
  try {
    form = await req.formData();
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid multipart payload", detail: e?.message }, { status: 400 });
  }

  const label = (form.get("label") as string | null)?.toString().trim() || null;
  const rawFiles = form.getAll("files");
  const files = rawFiles.filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Too many files — max ${MAX_FILES_PER_REQUEST} per upload` },
      { status: 400 }
    );
  }

  // Validate sizes first
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `"${f.name}" exceeds 500 MB limit` },
        { status: 413 }
      );
    }
  }

  try {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  } catch (e) {
    /* ignore */
  }

  const created: any[] = [];

  for (const f of files) {
    const uuid = randomUUID();
    const dir = path.join(BASE_DIR, uuid);
    fs.mkdirSync(dir, { recursive: true });

    const safeName = sanitizeFilename(f.name || "file");
    const absPath = path.join(dir, safeName);

    const buf = Buffer.from(await f.arrayBuffer());
    fs.writeFileSync(absPath, buf);

    const relPath = path.posix.join("d", uuid, safeName);

    const row = await prisma.fileUpload.create({
      data: {
        uuid,
        originalName: f.name || safeName,
        safeName,
        mimeType: f.type || null,
        sizeBytes: BigInt(buf.length),
        path: relPath,
        label,
        uploadedById: uploaderId,
      },
    });

    created.push(serializeFile(row));
  }

  return NextResponse.json({ files: created });
}
