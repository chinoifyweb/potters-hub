import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import DownloadClient from "./download-client";

export const dynamic = "force-dynamic";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default async function DownloadPage({ params }: { params: { uuid: string } }) {
  const file = await prisma.fileUpload.findUnique({ where: { uuid: params.uuid } });
  if (!file) return notFound();

  const directUrl = `/d/${file.uuid}/${file.safeName}`;
  const sizeHuman = formatSize(Number(file.sizeBytes));
  const ext = (file.originalName.split(".").pop() || "").toLowerCase();
  const iconMap: Record<string, string> = {
    apk: "📱", exe: "💿", zip: "🗜️", rar: "🗜️", "7z": "🗜️",
    pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊", ppt: "📽️", pptx: "📽️",
    mp3: "🎵", wav: "🎵", m4a: "🎵", ogg: "🎵",
    mp4: "🎬", mov: "🎬", avi: "🎬", mkv: "🎬", webm: "🎬",
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️", svg: "🖼️",
    txt: "📃",
  };
  const icon = iconMap[ext] || "📦";

  return (
    <DownloadClient
      uuid={file.uuid}
      originalName={file.originalName}
      directUrl={directUrl}
      sizeHuman={sizeHuman}
      icon={icon}
      label={file.label || ""}
      downloadCount={file.downloadCount}
    />
  );
}
