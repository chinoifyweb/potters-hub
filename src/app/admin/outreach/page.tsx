"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Send,
  Smartphone,
  MessageCircle,
  Loader2,
  RefreshCw,
  Users,
  HardHat,
  UserPlus,
  CheckSquare,
  X,
  Search,
  Cake,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Contact = {
  key: string;
  fullName: string;
  phone: string;
  email?: string;
  birthDay?: number;
  birthMonth?: number;
  department?: string;
  firstVisitDate?: string;
  tags: string[];
  sources?: any[];
};

type AudienceValue = "all" | "workers" | "firsttimers" | "custom";

export default function OutreachPage() {
  const [waStatus, setWaStatus] = useState<any>({ ready: false });
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "both">("whatsapp");
  const [type, setType] = useState("welcome");
  const [customBody, setCustomBody] = useState("");
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // New audience state
  const [audience, setAudience] = useState<AudienceValue | null>(null);
  const [selected, setSelected] = useState<Contact[]>([]);
  const [loadingAudience, setLoadingAudience] = useState<AudienceValue | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [search, setSearch] = useState("");
  const [pickerSelectedKeys, setPickerSelectedKeys] = useState<Set<string>>(new Set());

  // Attachments (WhatsApp only)
  const [files, setFiles] = useState<File[]>([]);
  function addFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    const tooBig = list.filter((f) => f.size > 50 * 1024 * 1024);
    if (tooBig.length > 0) {
      toast.error(`Skipped ${tooBig.length} file(s) over 50MB: ${tooBig.map((f) => f.name).join(", ")}`);
    }
    const under = list.filter((f) => f.size <= 50 * 1024 * 1024);
    const combined = [...files, ...under].slice(0, 10);
    setFiles(combined);
    e.target.value = ""; // allow re-selecting same file
  }
  function removeFile(i: number) {
    setFiles(files.filter((_, idx) => idx !== i));
  }

  async function loadStatus() {
    try {
      const waRes = await fetch("/api/admin/whatsapp");
      const wa = await waRes.json().catch(() => ({ ready: false, error: "network" }));
      setWaStatus(wa);
    } catch {}
  }
  async function loadLogs() {
    try {
      const r = await fetch("/api/admin/outreach").then((r) => r.json());
      setLogs(r.logs || []);
      setTemplates(r.templates || {});
      if (r.templates?.[type] && !customBody) setCustomBody(r.templates[type]);
    } catch {}
  }
  async function disconnectWA() {
    if (!confirm("Disconnect WhatsApp? You will need to scan the QR again to link a different account.")) return;
    try {
      const r = await fetch("/api/admin/whatsapp/logout", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Logout failed");
      toast.success("WhatsApp disconnected — a new QR will appear shortly");
      setTimeout(loadStatus, 2000);
    } catch (e: any) {
      toast.error("Disconnect failed: " + e.message);
    }
  }

  useEffect(() => {
    loadStatus();
    loadLogs();
    const i = setInterval(loadStatus, 5000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (templates[type]) setCustomBody(templates[type]);
  }, [type]);

  async function ensureAllContacts() {
    if (allContacts.length > 0) return allContacts;
    setLoadingAll(true);
    try {
      const r = await fetch("/api/admin/contacts?audience=all").then((r) => r.json());
      const list: Contact[] = r.contacts || [];
      setAllContacts(list);
      return list;
    } catch (e) {
      toast.error("Failed to load contacts");
      return [];
    } finally {
      setLoadingAll(false);
    }
  }

  async function selectAudience(a: AudienceValue) {
    setAudience(a);
    if (a === "custom") {
      setPickerSelectedKeys(new Set(selected.map((c) => c.key)));
      setPickerOpen(true);
      await ensureAllContacts();
      return;
    }
    setLoadingAudience(a);
    try {
      const qp =
        a === "firsttimers" ? "audience=firsttimers&sinceDays=7" : `audience=${a}`;
      const r = await fetch(`/api/admin/contacts?${qp}`).then((r) => r.json());
      const list: Contact[] = r.contacts || [];
      setSelected(list);
      const label =
        a === "all" ? "members" : a === "workers" ? "workers" : "first-timers";
      toast.success(`Loaded ${list.length} ${label}`);
    } catch {
      toast.error("Failed to load audience");
    } finally {
      setLoadingAudience(null);
    }
  }

  function removeFromSelected(key: string) {
    setSelected((prev) => prev.filter((c) => c.key !== key));
  }

  function clearSelected() {
    setSelected([]);
    setAudience(null);
  }

  // Picker filtering
  const filteredPickerContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allContacts;
    return allContacts.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q),
    );
  }, [allContacts, search]);

  function togglePickerKey(key: string, checked: boolean) {
    setPickerSelectedKeys((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function selectAllFiltered() {
    setPickerSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const c of filteredPickerContacts) next.add(c.key);
      return next;
    });
  }

  function clearAllFiltered() {
    setPickerSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const c of filteredPickerContacts) next.delete(c.key);
      return next;
    });
  }

  function confirmPicker() {
    const byKey = new Map<string, Contact>(allContacts.map((c) => [c.key, c]));
    const picked: Contact[] = [];
    Array.from(pickerSelectedKeys).forEach((k) => {
      const c = byKey.get(k);
      if (c) picked.push(c);
    });
    setSelected(picked);
    setPickerOpen(false);
    toast.success(`Selected ${picked.length} contact(s)`);
  }

  async function send() {
    if (selected.length === 0) {
      toast.error("Select an audience first");
      return;
    }
    if (!customBody.trim()) {
      toast.error("Message required");
      return;
    }
    setSending(true);
    try {
      const payload = {
        channel,
        type,
        customBody,
        recipients: selected.map((c) => ({ name: c.fullName, phone: c.phone })),
      };
      const useMultipart =
        files.length > 0 && (channel === "whatsapp" || channel === "both");
      let r: Response;
      if (useMultipart) {
        const fd = new FormData();
        fd.append("payload", JSON.stringify(payload));
        for (const f of files) fd.append("files", f);
        r = await fetch("/api/admin/outreach", { method: "POST", body: fd });
      } else {
        r = await fetch("/api/admin/outreach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await r.json();
      const results = data.results || [];

      const wa = results.filter((x: any) => x.channel === "whatsapp");
      const waOk = wa.filter((x: any) => x.ok).length;
      const waFail = wa.length - waOk;

      const fallbackLinks = wa.filter((x: any) => !x.ok && x.link);
      fallbackLinks.forEach((x: any, i: number) => {
        setTimeout(() => window.open(x.link, "_blank", "noopener"), i * 600);
      });

      if (wa.length > 0) {
        if (waFail === 0) {
          toast.success(`WhatsApp: ${waOk} sent automatically`);
        } else if (waOk === 0 && fallbackLinks.length > 0) {
          toast.error(`WhatsApp service unavailable — opened ${fallbackLinks.length} wa.me fallback link(s)`);
        } else {
          toast.error(`WhatsApp: ${waOk} sent, ${waFail} failed${fallbackLinks.length ? ` — ${fallbackLinks.length} wa.me link(s) opened` : ""}`);
        }
      }

      const sms = results.filter((x: any) => x.channel === "sms");
      const smsOk = sms.filter((x: any) => x.ok).length;
      const smsFail = sms.length - smsOk;
      if (sms.length > 0) {
        if (smsFail) toast.error(`SMS: ${smsOk} sent, ${smsFail} failed`);
        else toast.success(`SMS: ${smsOk} sent, ${smsFail} failed`);
      }

      if (wa.length === 0 && sms.length === 0) {
        toast.success("Request completed");
      }

      loadLogs();
      setFiles([]);
    } catch {
      toast.error("Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Send className="h-7 w-7" />
          Outreach
        </h1>
        <p className="text-muted-foreground">
          Send WhatsApp and SMS messages to visitors and members
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={loadStatus}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {waStatus.ready && (
                <Button variant="ghost" size="sm" onClick={disconnectWA} title="Disconnect">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {waStatus.ready ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>
            ) : waStatus.state === "QR_READY" ? (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">Scan QR</Badge>
            ) : waStatus.state === "INITIALIZING" || waStatus.state === "AUTHENTICATED" ? (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Connecting…</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 border-red-200">Offline</Badge>
            )}

            {waStatus.qr && !waStatus.ready && (
              <div className="mt-3 p-4 bg-muted rounded-md text-center">
                <p className="text-sm font-medium mb-2">📱 Scan with your WhatsApp phone:</p>
                <img
                  src={waStatus.qr}
                  alt="WhatsApp QR"
                  className="mx-auto max-w-[240px] rounded bg-white p-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  WhatsApp → Settings → Linked Devices → Link a Device
                </p>
              </div>
            )}

            {waStatus.ready && waStatus.info?.pushname && (
              <p className="text-xs text-muted-foreground mt-2">
                Connected as <strong>{waStatus.info.pushname}</strong>
              </p>
            )}

            {!waStatus.ready && !waStatus.qr && waStatus.state !== "QR_READY" && (
              <p className="text-sm text-muted-foreground mt-2">
                {waStatus.error || "Waiting for WhatsApp service to start… If this persists, check the tphc-wa PM2 process."}
              </p>
            )}

            {waStatus.ready && (
              <p className="text-sm text-muted-foreground mt-2">
                Messages will send automatically via WhatsApp Web.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              SMS
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              SMS via Termii if TERMII_API_KEY is set.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Compose Message</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Channel</Label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="whatsapp">WhatsApp only</option>
                <option value="sms">SMS only</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <Label>Template</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="welcome">Welcome (new visitor)</option>
                <option value="absence">Absence follow-up</option>
                <option value="birthday">Birthday</option>
                <option value="broadcast">Sunday broadcast</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Message (use {"{{name}}"} for personalization)</Label>
            <Textarea
              rows={5}
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
            />
          </div>

          {/* Attachments (WhatsApp only) */}
          <div>
            <Label>Attachments (WhatsApp only, up to 10 files, 50MB each)</Label>
            <Input
              type="file"
              multiple
              accept="image/*,application/pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp3,.mp4,.txt"
              onChange={addFiles}
              className="mt-1"
              disabled={files.length >= 10}
            />
            {channel === "sms" && files.length > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                SMS channel selected — attachments will be ignored.
              </p>
            )}
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs bg-muted px-2 py-1 rounded"
                  >
                    <span className="truncate">
                      {f.name}{" "}
                      <span className="text-muted-foreground">
                        ({(f.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => removeFile(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audience selector */}
          <div>
            <Label>Audience</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <AudienceChip
                value="all"
                current={audience}
                loading={loadingAudience === "all"}
                label="All Members"
                icon={<Users className="h-4 w-4" />}
                onClick={() => selectAudience("all")}
              />
              <AudienceChip
                value="workers"
                current={audience}
                loading={loadingAudience === "workers"}
                label="Workers"
                icon={<HardHat className="h-4 w-4" />}
                onClick={() => selectAudience("workers")}
              />
              <AudienceChip
                value="firsttimers"
                current={audience}
                loading={loadingAudience === "firsttimers"}
                label="First Timers (7 days)"
                icon={<UserPlus className="h-4 w-4" />}
                onClick={() => selectAudience("firsttimers")}
              />
              <AudienceChip
                value="custom"
                current={audience}
                loading={false}
                label="Choose Contacts"
                icon={<CheckSquare className="h-4 w-4" />}
                onClick={() => selectAudience("custom")}
              />
            </div>
          </div>

          {/* Selected recipients viewer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Recipients ({selected.length})</Label>
              <div className="flex gap-2">
                {audience === "custom" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPickerSelectedKeys(new Set(selected.map((c) => c.key)));
                      setPickerOpen(true);
                      ensureAllContacts();
                    }}
                  >
                    Edit selection
                  </Button>
                )}
                {selected.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearSelected}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {selected.length === 0 ? (
              <p className="text-sm text-muted-foreground border rounded-md p-4 text-center">
                No recipients selected. Pick an audience above.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
                {selected.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium truncate">{c.fullName || "(no name)"}</span>
                        <span className="text-muted-foreground">{c.phone}</span>
                        {c.tags?.map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      {(c.department || c.birthDay) && (
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {c.department && (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {c.department}
                            </span>
                          )}
                          {c.birthDay && c.birthMonth && (
                            <span className="inline-flex items-center gap-1">
                              <Cake className="h-3 w-3" />
                              {c.birthDay}/{c.birthMonth}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromSelected(c.key)}
                      className="h-7 w-7 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={send}
            disabled={sending || selected.length === 0}
            className="w-full"
          >
            {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send to {selected.length} recipient(s)
          </Button>
        </CardContent>
      </Card>

      {/* Contact picker modal */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Contacts</DialogTitle>
            <DialogDescription>
              Select specific people to message. Search by name, phone, or email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or email…"
                className="pl-9"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {loadingAll
                  ? "Loading contacts…"
                  : `${filteredPickerContacts.length} shown · ${pickerSelectedKeys.size} selected`}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={selectAllFiltered} disabled={loadingAll}>
                  Select all filtered
                </Button>
                <Button size="sm" variant="ghost" onClick={clearAllFiltered} disabled={loadingAll}>
                  Clear filtered
                </Button>
              </div>
            </div>

            <div className="border rounded-md max-h-[400px] overflow-y-auto">
              {loadingAll ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading contacts…
                </div>
              ) : filteredPickerContacts.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No contacts match your search.
                </div>
              ) : (
                filteredPickerContacts.map((c) => {
                  const checked = pickerSelectedKeys.has(c.key);
                  return (
                    <label
                      key={c.key}
                      className={`flex items-start gap-3 px-3 py-2 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 ${
                        checked ? "bg-muted/30" : ""
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => togglePickerKey(c.key, !!v)}
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium truncate">
                            {c.fullName || "(no name)"}
                          </span>
                          <span className="text-sm text-muted-foreground">{c.phone}</span>
                          {c.tags?.map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {c.email && <span className="truncate">{c.email}</span>}
                          {c.department && (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {c.department}
                            </span>
                          )}
                          {c.birthDay && c.birthMonth && (
                            <span className="inline-flex items-center gap-1">
                              <Cake className="h-3 w-3" />
                              {c.birthDay}/{c.birthMonth}
                            </span>
                          )}
                          {c.firstVisitDate && (
                            <span>First visit: {c.firstVisitDate}</span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPickerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPicker}>
              Use {pickerSelectedKeys.size} contact(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Recent Messages</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((l) => (
              <div
                key={l.id}
                className="flex items-start justify-between text-sm border-b pb-2"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{l.channel}</Badge>
                    <span className="font-medium">{l.recipientName || l.recipient}</span>
                    <Badge variant={l.status === "sent" ? "default" : "destructive"}>
                      {l.status}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1 line-clamp-2">{l.body}</div>
                  {l.error && <div className="text-xs text-red-600">{l.error}</div>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(l.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No messages yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- AudienceChip ----------

function AudienceChip({
  value,
  current,
  label,
  icon,
  loading,
  onClick,
}: {
  value: AudienceValue;
  current: AudienceValue | null;
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  onClick: () => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 rounded-md border px-3 py-3 text-sm text-left transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
          : "border-border hover:bg-muted"
      } ${loading ? "opacity-60 cursor-wait" : ""}`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-md ${
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      </span>
      <span className="font-medium leading-tight">{label}</span>
    </button>
  );
}
