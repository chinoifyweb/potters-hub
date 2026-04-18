"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Loader2, UserPlus, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Visitor {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  howHeard: string | null;
  prayerRequest: string | null;
  status: string;
  notes: string | null;
  returnVisits: number;
  firstVisitDate: string;
  followUps: any[];
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [prayerRequest, setPrayerRequest] = useState("");
  const [wantsContact, setWantsContact] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("new");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/visitors");
      const j = await r.json();
      setVisitors(j.visitors || []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function reset() {
    setFullName(""); setPhone(""); setEmail(""); setHowHeard(""); setPrayerRequest("");
    setWantsContact(true); setNotes(""); setStatus("new"); setEditingId(null);
  }
  function openNew() { reset(); setOpen(true); }
  function openEdit(v: Visitor) {
    setEditingId(v.id);
    setFullName(v.fullName); setPhone(v.phone || ""); setEmail(v.email || "");
    setHowHeard(v.howHeard || ""); setPrayerRequest(v.prayerRequest || "");
    setNotes(v.notes || ""); setStatus(v.status); setOpen(true);
  }

  async function save() {
    if (!fullName) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      const payload = { fullName, phone, email, howHeard, prayerRequest, wantsContact, notes, status };
      const url = editingId ? `/api/admin/visitors/${editingId}` : "/api/admin/visitors";
      const method = editingId ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error();
      toast.success(editingId ? "Updated" : "FirstTimer added");
      setOpen(false); reset(); load();
    } catch { toast.error("Save failed"); } finally { setSaving(false); }
  }

  async function del(v: Visitor) {
    if (!confirm(`Delete ${v.fullName}?`)) return;
    try {
      const r = await fetch(`/api/admin/visitors/${v.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Deleted"); load();
    } catch { toast.error("Delete failed"); }
  }

  const stats = {
    total: visitors.length,
    newThisWeek: visitors.filter(v => (Date.now() - new Date(v.firstVisitDate).getTime()) < 7 * 86400000).length,
    returning: visitors.filter(v => v.returnVisits > 0).length,
    joined: visitors.filter(v => v.status === "joined").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><UserPlus className="h-7 w-7" />FirstTimers & Follow-Up</h1>
          <p className="text-muted-foreground">Track first-timers and manage pastoral follow-up</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New Visitor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Total Visitors</div><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">New This Week</div><div className="text-2xl font-bold">{stats.newThisWeek}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Returned</div><div className="text-2xl font-bold">{stats.returning}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Joined</div><div className="text-2xl font-bold">{stats.joined}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">All Visitors</h2></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>First Visit</TableHead>
                <TableHead>Status</TableHead><TableHead>Follow-ups</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {visitors.map(v => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.fullName}</TableCell>
                    <TableCell className="text-xs">
                      {v.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{v.phone}</div>}
                      {v.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{v.email}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{new Date(v.firstVisitDate).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={v.status === "joined" ? "default" : "secondary"}>{v.status}</Badge></TableCell>
                    <TableCell className="text-sm">{v.followUps?.filter((f: any) => f.status === "pending").length || 0} pending</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(v)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => del(v)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {visitors.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No visitors yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit Visitor" : "New Visitor"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Full Name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} /></div>
            </div>
            <div><Label>How did they hear?</Label><Input value={howHeard} onChange={e => setHowHeard(e.target.value)} /></div>
            <div><Label>Prayer Request</Label><Textarea rows={2} value={prayerRequest} onChange={e => setPrayerRequest(e.target.value)} /></div>
            <div><Label>Notes</Label><Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} /></div>
            {editingId && (
              <div><Label>Status</Label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="new">New</option>
                  <option value="returning">Returning</option>
                  <option value="joined">Joined</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
            <div className="flex items-center gap-2"><Switch checked={wantsContact} onCheckedChange={setWantsContact} /><Label>Wants contact</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
