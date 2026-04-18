"use client";
import { useEffect, useState } from "react";
import { Send, Smartphone, MessageCircle, Loader2, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

type Recipient = { name: string; phone: string };

export default function OutreachPage() {
  const [waStatus, setWaStatus] = useState<any>({ ready: false });
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "both">("whatsapp");
  const [type, setType] = useState("welcome");
  const [customBody, setCustomBody] = useState("");
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: "", phone: "" }]);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

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
  useEffect(() => {
    loadStatus();
    loadLogs();
    const i = setInterval(loadStatus, 5000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (templates[type]) setCustomBody(templates[type]);
  }, [type]);

  function addRecipient() { setRecipients([...recipients, { name: "", phone: "" }]); }
  function updateRec(i: number, field: keyof Recipient, val: string) {
    const next = [...recipients]; next[i] = { ...next[i], [field]: val }; setRecipients(next);
  }
  function removeRec(i: number) { setRecipients(recipients.filter((_, idx) => idx !== i)); }

  async function send() {
    const valid = recipients.filter(r => r.phone.trim());
    if (!valid.length) { toast.error("Add at least one recipient"); return; }
    if (!customBody.trim()) { toast.error("Message required"); return; }
    setSending(true);
    try {
      const r = await fetch("/api/admin/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, type, customBody, recipients: valid }),
      });
      const data = await r.json();
      const results = data.results || [];

      // WhatsApp results summary
      const wa = results.filter((x: any) => x.channel === "whatsapp");
      const waOk = wa.filter((x: any) => x.ok).length;
      const waFail = wa.length - waOk;

      // Open wa.me fallback links for any failed WA sends (e.g. service offline / not ready)
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

      // SMS result summary
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
    } catch { toast.error("Send failed"); } finally { setSending(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Send className="h-7 w-7" />Outreach</h1>
        <p className="text-muted-foreground">Send WhatsApp and SMS messages to visitors and members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><MessageCircle className="h-5 w-5" />WhatsApp</h3>
            <Button variant="ghost" size="sm" onClick={loadStatus}><RefreshCw className="h-4 w-4" /></Button>
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
                <img src={waStatus.qr} alt="WhatsApp QR" className="mx-auto max-w-[240px] rounded bg-white p-2" />
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
          <CardHeader><h3 className="font-semibold flex items-center gap-2"><Smartphone className="h-5 w-5" />SMS</h3></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">SMS via Termii if TERMII_API_KEY is set.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Compose Message</h2></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Channel</Label>
              <select value={channel} onChange={e => setChannel(e.target.value as any)} className="w-full border rounded px-3 py-2">
                <option value="whatsapp">WhatsApp only</option>
                <option value="sms">SMS only</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <Label>Template</Label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-3 py-2">
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
            <Textarea rows={5} value={customBody} onChange={e => setCustomBody(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Recipients</Label>
              <Button variant="outline" size="sm" onClick={addRecipient}><Plus className="h-4 w-4 mr-1" />Add</Button>
            </div>
            <div className="space-y-2">
              {recipients.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Name" value={r.name} onChange={e => updateRec(i, "name", e.target.value)} />
                  <Input placeholder="Phone (08...)" value={r.phone} onChange={e => updateRec(i, "phone", e.target.value)} />
                  <Button variant="ghost" size="icon" onClick={() => removeRec(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={send} disabled={sending} className="w-full">
            {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Send to {recipients.filter(r => r.phone).length} recipient(s)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold">Recent Messages</h2></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((l) => (
              <div key={l.id} className="flex items-start justify-between text-sm border-b pb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{l.channel}</Badge>
                    <span className="font-medium">{l.recipientName || l.recipient}</span>
                    <Badge variant={l.status === "sent" ? "default" : "destructive"}>{l.status}</Badge>
                  </div>
                  <div className="text-muted-foreground mt-1 line-clamp-2">{l.body}</div>
                  {l.error && <div className="text-xs text-red-600">{l.error}</div>}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
