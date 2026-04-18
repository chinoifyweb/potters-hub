"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  Download,
  Copy,
  Trash2,
  File as FileIcon,
  FileArchive,
  FileImage,
  FileAudio,
  FileVideo,
  FileText,
  Loader2,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type FileRow = {
  id: string;
  uuid: string;
  originalName: string;
  safeName: string;
  mimeType: string | null;
  sizeBytes: number;
  label: string | null;
  createdAt: string;
  downloadCount: number;
  url: string;
};

function formatSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function iconForMime(mime: string | null, name: string) {
  const m = (mime || "").toLowerCase();
  const lowerName = name.toLowerCase();
  if (m.startsWith("image/")) return FileImage;
  if (m.startsWith("audio/")) return FileAudio;
  if (m.startsWith("video/")) return FileVideo;
  if (m.includes("pdf") || lowerName.endsWith(".pdf")) return FileText;
  if (
    m.includes("zip") ||
    m.includes("rar") ||
    m.includes("7z") ||
    lowerName.endsWith(".zip") ||
    lowerName.endsWith(".rar") ||
    lowerName.endsWith(".7z") ||
    lowerName.endsWith(".apk")
  )
    return FileArchive;
  return FileIcon;
}

const MAX_FILE_BYTES = 500 * 1024 * 1024;

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(false);

  // upload state
  const [pending, setPending] = useState<File[]>([]);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // delete dialog
  const [deleteTarget, setDeleteTarget] = useState<FileRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadFiles() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/files", { cache: "no-store" });
      if (!r.ok) throw new Error("Failed to load");
      const j = await r.json();
      setFiles(j.files || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  function handleSelect(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list);
    const tooBig = arr.filter((f) => f.size > MAX_FILE_BYTES);
    if (tooBig.length) {
      toast.error(
        `Skipped ${tooBig.length} file(s) over 500MB: ${tooBig
          .map((f) => f.name)
          .join(", ")}`
      );
    }
    const ok = arr.filter((f) => f.size <= MAX_FILE_BYTES);
    const combined = [...pending, ...ok].slice(0, 20);
    setPending(combined);
  }

  function removePending(idx: number) {
    setPending(pending.filter((_, i) => i !== idx));
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleSelect(e.dataTransfer.files);
  }

  async function uploadFiles() {
    if (pending.length === 0) {
      toast.error("No files selected");
      return;
    }
    setUploading(true);
    setProgress(0);

    const fd = new FormData();
    for (const f of pending) fd.append("files", f);
    if (label.trim()) fd.append("label", label.trim());

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/admin/files");
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            let msg = `Upload failed (${xhr.status})`;
            try {
              const j = JSON.parse(xhr.responseText);
              if (j?.error) msg = j.error;
            } catch {}
            reject(new Error(msg));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(fd);
      });

      toast.success(`Uploaded ${pending.length} file(s)`);
      setPending([]);
      setLabel("");
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadFiles();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function copyLink(row: FileRow) {
    const full =
      (typeof window !== "undefined" ? window.location.origin : "https://tphc.org.ng") +
      '/download/' + row.uuid;
    try {
      await navigator.clipboard.writeText(full);
      setCopiedId(row.id);
      toast.success("Link copied");
      setTimeout(() => setCopiedId((c) => (c === row.id ? null : c)), 1500);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = full;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Link copied");
    }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/admin/files/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("Failed");
      toast.success("File deleted");
      setDeleteTarget(null);
      await loadFiles();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const totalSize = useMemo(
    () => files.reduce((a, f) => a + f.sizeBytes, 0),
    [files]
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">File Sharing</h1>
          <p className="text-sm text-muted-foreground">
            Upload files to share via public links. {files.length} file
            {files.length === 1 ? "" : "s"} — {formatSize(totalSize)} total
          </p>
        </div>
        <Button variant="outline" onClick={loadFiles} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Upload card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Upload Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 hover:bg-muted/50"
            }`}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              Click to browse or drop files here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Up to 20 files, 500 MB each. APKs, PDFs, images, audio, video, zip.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                handleSelect(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {pending.length > 0 && (
            <div className="space-y-1">
              {pending.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs bg-muted px-2 py-1.5 rounded"
                >
                  <span className="truncate pr-2">
                    {f.name}{" "}
                    <span className="text-muted-foreground">
                      ({formatSize(f.size)})
                    </span>
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => removePending(i)}
                    disabled={uploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div>
            <Label>Label (optional)</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Church app v1.2 APK"
              disabled={uploading}
              maxLength={200}
            />
          </div>

          {uploading && (
            <div className="space-y-1">
              <div className="w-full bg-muted rounded h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Uploading… {progress}%
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={uploadFiles}
              disabled={uploading || pending.length === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" /> Upload{" "}
                  {pending.length > 0 ? `(${pending.length})` : ""}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files table */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Files</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && files.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-10">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Loading…
            </div>
          ) : files.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-10">
              No files uploaded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-2">File</th>
                    <th className="py-2 pr-2 hidden md:table-cell">Label</th>
                    <th className="py-2 pr-2 text-right">Size</th>
                    <th className="py-2 pr-2 hidden md:table-cell">Uploaded</th>
                    <th className="py-2 pr-2 text-right hidden sm:table-cell">
                      Downloads
                    </th>
                    <th className="py-2 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => {
                    const Icon = iconForMime(f.mimeType, f.originalName);
                    const isCopied = copiedId === f.id;
                    return (
                      <tr key={f.id} className="border-b hover:bg-muted/30">
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate" title={f.originalName}>
                              {f.originalName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 pr-2 hidden md:table-cell max-w-[180px] truncate text-muted-foreground">
                          {f.label || "—"}
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums">
                          {formatSize(f.sizeBytes)}
                        </td>
                        <td className="py-2 pr-2 hidden md:table-cell text-muted-foreground">
                          {formatDate(f.createdAt)}
                        </td>
                        <td className="py-2 pr-2 text-right hidden sm:table-cell tabular-nums">
                          {f.downloadCount}
                        </td>
                        <td className="py-2 pr-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              title="Copy link"
                              onClick={() => copyLink(f)}
                            >
                              {isCopied ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button size="sm" variant="outline" asChild title="Download">
                              <a href={f.url} download={f.originalName}>
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              title="Delete"
                              onClick={() => setDeleteTarget(f)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete file?</DialogTitle>
          </DialogHeader>
          <div className="text-sm">
            This will permanently delete{" "}
            <strong>{deleteTarget?.originalName}</strong> and invalidate its
            public link. This cannot be undone.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={doDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
