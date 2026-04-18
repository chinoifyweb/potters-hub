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

      // Open WhatsApp click-to-send links, spaced 600ms apart to avoid popup blocking
      const waLinks = results.filter((x: any) => x.channel === "whatsapp" && x.link);
      waLinks.forEach((x: any, i: number) => {
        setTimeout(() => window.open(x.link, "_blank", "noopener"), i * 600);
      });
      if (waLinks.length > 0) {
        toast.success(`WhatsApp: ${waLinks.length} chat(s) opened — tap Send in each.`);
      }

      // SMS result summary
      const sms = results.filter((x: any) => x.channel === "sms");
      const smsOk = sms.filter((x: any) => x.ok).length;
      const smsFail = sms.length - smsOk;
      if (sms.length > 0) {
        if (smsFail) toast.error(`SMS: ${smsOk} sent, ${smsFail} failed`);
        else toast.success(`SMS: ${smsOk} sent, ${smsFail} failed`);
      }

      if (waLinks.length === 0 && sms.length === 0) {
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
          <CardHeader className="flex flex-row items-center justify-between"><h3 className="font-semibold flex items-center gap-2"><MessageCircle className="h-5 w-5" />WhatsApp</h3>
            <Button variant="ghost" size="sm" onClick={loadStatus}><RefreshCw className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Click-to-send</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Tap Send — WhatsApp opens on your device pre-filled. Tap Send in WhatsApp to deliver.
            </p>
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
